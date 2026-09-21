import { Transaction, Category, TransactionFormData } from '@/app/types';

// Kolom mengikuti workbook Excel milik user (catatan_keuangan_2026.xlsx):
// Debet = uang keluar (expense), Kredit = uang masuk (income).
export const CSV_HEADERS = [
  'NO',
  'Tanggal',
  'Kegiatan',
  'Debet (Rp)',
  'Kredit (Rp)',
  'Keterangan',
  'Bank',
] as const;

const OTHER_CATEGORY_NAME = 'Lainnya';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Serial tanggal Excel (basis 1900, dengan bug tahun kabisat 1900) -> Date UTC.
export function excelSerialToDate(serial: number): Date | null {
  if (!Number.isFinite(serial) || serial < 1) return null;
  const ms = Math.round((serial - 25569) * 86400 * 1000);
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date;
}

function fromDateParts(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

// Terima YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, atau serial Excel -> YYYY-MM-DD.
export function parseImportDate(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const slash = value.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (slash) {
    return fromDateParts(Number(slash[3]), Number(slash[2]), Number(slash[1]));
  }

  if (/^\d+(\.\d+)?$/.test(value)) {
    const date = excelSerialToDate(Number(value));
    if (!date) return null;
    return fromDateParts(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate()
    );
  }

  return null;
}

// "1.500.000" / "1,500,000" / "1500000" -> 1500000
export function parseAmount(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

function escapeCell(value: string): string {
  return /[",;\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function transactionsToCsv(
  transactions: Transaction[],
  categories: Category[]
): string {
  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name || OTHER_CATEGORY_NAME;

  const sorted = transactions
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const lines = [CSV_HEADERS.join(',')];
  sorted.forEach((t, i) => {
    const isExpense = t.type === 'expense';
    lines.push(
      [
        String(i + 1),
        t.date,
        escapeCell(t.description),
        isExpense ? String(t.amount) : '',
        isExpense ? '' : String(t.amount),
        escapeCell(catName(t.category_id)),
        '',
      ].join(',')
    );
  });

  return lines.join('\r\n');
}

export function downloadCsv(filename: string, content: string) {
  // BOM agar Excel membaca UTF-8 dengan benar.
  const blob = new Blob(['\uFEFF' + content], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Parser CSV sederhana: dukung kolom berkutip, delimiter , atau ; otomatis.
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const firstLine = clean.slice(0, clean.indexOf('\n') === -1 ? clean.length : clean.indexOf('\n'));
  const delimiter =
    (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length
      ? ';'
      : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch === '\r') {
      // skip; ditangani saat \n
    } else {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.map((r) => r.map((c) => c.trim()));
}

export interface CsvImportResult {
  rows: TransactionFormData[];
  skipped: number;
}

// Sel bisa berasal dari CSV (string) atau XLSX (string/number/Date).
export type ImportCell = string | number | Date | null | undefined;

function cellToString(cell: ImportCell): string {
  if (cell == null) return '';
  if (cell instanceof Date) {
    if (Number.isNaN(cell.getTime())) return '';
    return `${cell.getFullYear()}-${pad(cell.getMonth() + 1)}-${pad(cell.getDate())}`;
  }
  return String(cell);
}

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Petakan baris (dari CSV atau XLSX) -> form transaksi. Kolom dicari lewat header (fleksibel).
export function rowsToTransactions(
  rawRows: ImportCell[][],
  categories: Category[]
): CsvImportResult {
  const rows = rawRows.map((r) => r.map(cellToString));
  const result: CsvImportResult = { rows: [], skipped: 0 };
  if (rows.length === 0) return result;

  const headerIdx = rows.findIndex((r) =>
    r.some((c) => normalize(c) === 'tanggal')
  );
  if (headerIdx === -1) return result;

  const header = rows[headerIdx].map(normalize);
  const col = (...names: string[]) =>
    header.findIndex((h) => names.some((n) => h.includes(n)));

  const iTanggal = col('tanggal');
  const iKegiatan = col('kegiatan', 'keterangan kegiatan', 'uraian', 'deskripsi');
  const iDebet = col('debet', 'debit');
  const iKredit = col('kredit', 'credit');
  const iKeterangan = col('keterangan');
  const iType = col('tipe', 'type', 'jenis');
  const iAmount = col('amount', 'nominal', 'jumlah');

  const otherCategory = categories.find((c) => c.name === OTHER_CATEGORY_NAME);
  const byName = new Map(categories.map((c) => [normalize(c.name), c.id]));

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every((c) => !c)) continue;

    const date = iTanggal >= 0 ? parseImportDate(r[iTanggal] || '') : null;
    if (!date) {
      result.skipped++;
      continue;
    }

    const description = (iKegiatan >= 0 ? r[iKegiatan] : '') || '';
    if (!description.trim()) {
      result.skipped++;
      continue;
    }

    let type: 'income' | 'expense';
    let amount: number;

    if (iDebet >= 0 || iKredit >= 0) {
      const debet = iDebet >= 0 ? parseAmount(r[iDebet] || '') : 0;
      const kredit = iKredit >= 0 ? parseAmount(r[iKredit] || '') : 0;
      if (debet === 0 && kredit === 0) {
        result.skipped++;
        continue;
      }
      type = kredit > 0 ? 'income' : 'expense';
      amount = kredit > 0 ? kredit : debet;
    } else if (iAmount >= 0) {
      amount = parseAmount(r[iAmount] || '');
      const t = (iType >= 0 ? normalize(r[iType] || '') : '').trim();
      type =
        t.includes('masuk') || t.includes('income') || t.includes('kredit')
          ? 'income'
          : 'expense';
      if (amount === 0) {
        result.skipped++;
        continue;
      }
    } else {
      result.skipped++;
      continue;
    }

    const note = iKeterangan >= 0 ? (r[iKeterangan] || '').trim() : '';
    let categoryId = note ? byName.get(normalize(note)) || '' : '';
    let customCategory = '';
    if (!categoryId) {
      categoryId = otherCategory?.id || '';
      customCategory = note && otherCategory ? note : '';
    }

    result.rows.push({
      type,
      amount: String(amount),
      category_id: categoryId,
      custom_category: customCategory,
      description,
      date,
    });
  }

  return result;
}

// Impor dari teks CSV: parse dulu jadi baris, lalu petakan.
export function csvToTransactions(
  text: string,
  categories: Category[]
): CsvImportResult {
  return rowsToTransactions(parseCsv(text), categories);
}
