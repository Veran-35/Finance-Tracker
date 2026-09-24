import { describe, it, expect } from 'vitest';
import {
  transactionsToCsv,
  csvToTransactions,
  parseCsv,
  parseImportDate,
  parseAmount,
  excelSerialToDate,
} from './csv';
import type { Transaction, Category, Account } from '@/app/types';

const categories: Category[] = [
  { id: 'c1', name: 'Makanan', color: '#E76F51', icon: '🍜' },
  { id: 'c2', name: 'Gaji', color: '#2A9D8F', icon: '💵' },
  { id: 'other', name: 'Lainnya', color: '#aaa', icon: '📦' },
];

const accounts: Account[] = [
  { id: 'a1', name: 'BCA', type: 'bank', color: '#2A9D8F', icon: '🏦' },
  { id: 'a2', name: 'Dana', type: 'ewallet', color: '#118EEA', icon: '💙' },
];

describe('parseAmount', () => {
  it('strips thousand separators (dot and comma)', () => {
    expect(parseAmount('1.500.000')).toBe(1500000);
    expect(parseAmount('1,500,000')).toBe(1500000);
    expect(parseAmount('1500000')).toBe(1500000);
    expect(parseAmount('Rp 25.000')).toBe(25000);
  });

  it('returns 0 for empty or non-numeric', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('abc')).toBe(0);
  });
});

describe('excelSerialToDate', () => {
  it('converts a known serial to the right UTC date', () => {
    const d = excelSerialToDate(46235);
    expect(d).not.toBeNull();
    expect(d!.getUTCFullYear()).toBe(2026);
  });
});

describe('parseImportDate', () => {
  it('accepts ISO, DD/MM/YYYY and Excel serial', () => {
    expect(parseImportDate('2026-09-05')).toBe('2026-09-05');
    expect(parseImportDate('05/09/2026')).toBe('2026-09-05');
    expect(parseImportDate('2026-09-05T10:00:00Z')).toBe('2026-09-05');
  });

  it('returns null for invalid input', () => {
    expect(parseImportDate('')).toBeNull();
    expect(parseImportDate('bukan tanggal')).toBeNull();
  });
});

describe('parseCsv', () => {
  it('handles quoted cells and comma delimiter', () => {
    const rows = parseCsv('a,b\n"hello, world",2');
    expect(rows).toEqual([
      ['a', 'b'],
      ['hello, world', '2'],
    ]);
  });

  it('auto-detects semicolon delimiter', () => {
    const rows = parseCsv('a;b;c\n1;2;3');
    expect(rows[0]).toEqual(['a', 'b', 'c']);
  });
});

describe('transactionsToCsv', () => {
  it('maps income to Debet and expense to Kredit', () => {
    const txns: Transaction[] = [
      { id: 't1', type: 'expense', amount: 25000, category_id: 'c1', account_id: 'a1', description: 'Bakso', date: '2026-09-05' },
      { id: 't2', type: 'income', amount: 5000000, category_id: 'c2', account_id: 'a1', description: 'Gaji', date: '2026-09-01' },
    ];
    const csv = transactionsToCsv(txns, categories, accounts);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('NO,Tanggal,Kegiatan,Debet (Rp),Kredit (Rp),Keterangan,Bank');
    // terurut naik berdasarkan tanggal: income 09-01 lebih dulu
    expect(lines[1]).toBe('1,2026-09-01,Gaji,5000000,,Gaji,BCA');
    expect(lines[2]).toBe('2,2026-09-05,Bakso,,25000,Makanan,BCA');
  });
});

describe('csvToTransactions', () => {
  it('round-trips an exported CSV back into form rows', () => {
    const txns: Transaction[] = [
      { id: 't1', type: 'expense', amount: 25000, category_id: 'c1', account_id: 'a1', description: 'Bakso', date: '2026-09-05' },
      { id: 't2', type: 'income', amount: 5000000, category_id: 'c2', account_id: 'a1', description: 'Gaji', date: '2026-09-01' },
    ];
    const csv = transactionsToCsv(txns, categories, accounts);
    const { rows, skipped } = csvToTransactions(csv, categories, accounts);

    expect(skipped).toBe(0);
    expect(rows).toHaveLength(2);

    const gaji = rows.find((r) => r.description === 'Gaji')!;
    expect(gaji.type).toBe('income');
    expect(gaji.amount).toBe('5000000');
    expect(gaji.category_id).toBe('c2');
    expect(gaji.account_id).toBe('a1');

    const bakso = rows.find((r) => r.description === 'Bakso')!;
    expect(bakso.type).toBe('expense');
    expect(bakso.amount).toBe('25000');
    expect(bakso.category_id).toBe('c1');
    expect(bakso.account_id).toBe('a1');
  });

  it('maps an unknown Keterangan to the Lainnya base with a custom name', () => {
    const csv = [
      'NO,Tanggal,Kegiatan,Debet (Rp),Kredit (Rp),Keterangan,Bank',
      '1,2026-09-05,Parkir,,5000,Parkir Kantor,',
    ].join('\r\n');
    const { rows } = csvToTransactions(csv, categories, accounts);
    expect(rows).toHaveLength(1);
    expect(rows[0].category_id).toBe('other');
    expect(rows[0].custom_category).toBe('Parkir Kantor');
  });

  it('skips rows without a valid date or description', () => {
    const csv = [
      'NO,Tanggal,Kegiatan,Debet (Rp),Kredit (Rp),Keterangan,Bank',
      '1,INVALID,,1000,,,',
      '2,2026-09-05,,1000,,,',
      '3,2026-09-05,Valid,1000,,,',
    ].join('\r\n');
    const { rows, skipped } = csvToTransactions(csv, categories, accounts);
    expect(rows).toHaveLength(1);
    expect(skipped).toBe(2);
  });

  it('forward-fills a missing date from the previous dated row', () => {
    const csv = [
      'NO,Tanggal,Kegiatan,Debet (Rp),Kredit (Rp),Keterangan,Bank',
      '1,2026-09-05,Bakso,,25000,Makanan,',
      '2,,Gaji,5000000,,,',
    ].join('\r\n');
    const { rows, skipped } = csvToTransactions(csv, categories, accounts);
    expect(skipped).toBe(0);
    expect(rows).toHaveLength(2);
    const gaji = rows.find((r) => r.description === 'Gaji')!;
    expect(gaji.date).toBe('2026-09-05');
    expect(gaji.type).toBe('income');
    expect(gaji.amount).toBe('5000000');
  });

  it('silently ignores note rows that have no amount', () => {
    const csv = [
      'NO,Tanggal,Kegiatan,Debet (Rp),Kredit (Rp),Keterangan,Bank',
      '1,2026-09-05,Catatan piutang,,,,,',
      '2,2026-09-06,Bakso,,25000,Makanan,',
    ].join('\r\n');
    const { rows, skipped } = csvToTransactions(csv, categories, accounts);
    expect(skipped).toBe(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].description).toBe('Bakso');
  });

  it('maps a known Bank name to its account id', () => {
    const csv = [
      'NO,Tanggal,Kegiatan,Debet (Rp),Kredit (Rp),Keterangan,Bank',
      '1,2026-09-05,Top up,,50000,,Dana',
    ].join('\r\n');
    const { rows } = csvToTransactions(csv, categories, accounts);
    expect(rows).toHaveLength(1);
    expect(rows[0].account_id).toBe('a2');
    expect(rows[0].custom_account).toBe('');
  });

  it('maps an unknown Bank name to a custom account', () => {
    const csv = [
      'NO,Tanggal,Kegiatan,Debet (Rp),Kredit (Rp),Keterangan,Bank',
      '1,2026-09-05,Bakso,,25000,Makanan,GoPay',
    ].join('\r\n');
    const { rows } = csvToTransactions(csv, categories, accounts);
    expect(rows).toHaveLength(1);
    expect(rows[0].account_id).toBe('');
    expect(rows[0].custom_account).toBe('GoPay');
  });

  it('falls back to BCA when the Bank cell is blank', () => {
    const csv = [
      'NO,Tanggal,Kegiatan,Debet (Rp),Kredit (Rp),Keterangan,Bank',
      '1,2026-09-05,Bakso,,25000,Makanan,',
    ].join('\r\n');
    const { rows } = csvToTransactions(csv, categories, accounts);
    expect(rows).toHaveLength(1);
    expect(rows[0].account_id).toBe('a1');
    expect(rows[0].custom_account).toBe('');
  });
});
