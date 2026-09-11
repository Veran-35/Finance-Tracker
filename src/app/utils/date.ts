// Selisih hari kalender waktu lokal; new Date('YYYY-MM-DD') diparsing sebagai UTC midnight.
export function daysUntil(dueDate: string): number {
  const [y, m, d] = dueDate.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}
