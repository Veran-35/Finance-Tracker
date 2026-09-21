// Selisih hari kalender waktu lokal; new Date('YYYY-MM-DD') diparsing sebagai UTC midnight.
export function daysUntil(dueDate: string): number {
  const [y, m, d] = dueDate.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

// Prefix YYYY-MM waktu lokal.
export function currentMonthPrefix(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Geser prefix YYYY-MM sebanyak delta bulan (bisa negatif).
export function shiftMonthPrefix(prefix: string, delta: number): string {
  const [y, m] = prefix.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(prefix: string): string {
  const [y, m] = prefix.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}
