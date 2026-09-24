import * as XLSX from 'xlsx';
import { rowsToTransactions, type CsvImportResult, type ImportCell } from '@/app/utils/csv';
import type { Category, Account } from '@/app/types';

// Baca workbook .xlsx/.xls: gabungkan transaksi dari semua sheet (satu sheet per bulan).
// cellDates:true membuat sel tanggal Excel jadi objek Date, bukan angka serial.
export function xlsxToTransactions(
  data: ArrayBuffer | Uint8Array,
  categories: Category[],
  accounts: Account[]
): CsvImportResult {
  const wb = XLSX.read(data, { cellDates: true });
  const result: CsvImportResult = { rows: [], skipped: 0 };

  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;

    const aoa = XLSX.utils.sheet_to_json<ImportCell[]>(sheet, {
      header: 1,
      raw: true,
      defval: '',
      blankrows: false,
    });

    const part = rowsToTransactions(aoa, categories, accounts);
    result.rows.push(...part.rows);
    result.skipped += part.skipped;
  }

  return result;
}
