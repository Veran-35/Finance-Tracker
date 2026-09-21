import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { xlsxToTransactions } from './xlsx';
import type { Category } from '@/app/types';

const categories: Category[] = [
  { id: 'c1', name: 'Makanan', color: '#E76F51', icon: '🍜' },
  { id: 'c2', name: 'Gaji', color: '#2A9D8F', icon: '💵' },
  { id: 'other', name: 'Lainnya', color: '#aaa', icon: '📦' },
];

const HEADER = ['NO', 'Tanggal', 'Kegiatan', 'Debet (Rp)', 'Kredit (Rp)', 'Keterangan', 'Bank'];

function buildMonthSheet() {
  return XLSX.utils.aoa_to_sheet([
    HEADER,
    [1, new Date(2026, 8, 5), 'Bakso', 25000, '', 'Makanan', ''],
    [2, new Date(2026, 8, 1), 'Gaji', '', 5000000, 'Gaji', ''],
  ]);
}

function buildWorkbook(): Uint8Array {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildMonthSheet(), 'September');
  XLSX.utils.book_append_sheet(wb, buildMonthSheet(), 'Agustus');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}

describe('xlsxToTransactions', () => {
  it('reads every sheet and maps Debet->expense, Kredit->income', () => {
    const { rows, skipped } = xlsxToTransactions(buildWorkbook(), categories);

    expect(skipped).toBe(0);
    expect(rows).toHaveLength(4); // 2 baris x 2 sheet

    const expenses = rows.filter((r) => r.type === 'expense');
    const incomes = rows.filter((r) => r.type === 'income');
    expect(expenses).toHaveLength(2);
    expect(incomes).toHaveLength(2);
  });

  it('converts Excel date cells to YYYY-MM-DD and resolves categories', () => {
    const { rows } = xlsxToTransactions(buildWorkbook(), categories);

    const expense = rows.find((r) => r.type === 'expense')!;
    expect(expense.date).toBe('2026-09-05');
    expect(expense.amount).toBe('25000');
    expect(expense.category_id).toBe('c1');

    const income = rows.find((r) => r.type === 'income')!;
    expect(income.date).toBe('2026-09-01');
    expect(income.amount).toBe('5000000');
    expect(income.category_id).toBe('c2');
  });

  it('returns empty result for a workbook without a Tanggal header', () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([['A', 'B'], ['1', '2']]),
      'Kosong'
    );
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
    const { rows } = xlsxToTransactions(buf, categories);
    expect(rows).toHaveLength(0);
  });
});
