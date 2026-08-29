export function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function fmtShort(n: number, isDecimal: boolean = false) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(isDecimal ? 1 : 0)}jt`;
  if (n >= 1000) return `${(n / 1000).toFixed(isDecimal ? 1 : 0)}rb`;
  return String(n);
}

export function fmtDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function fmtDurationHuman(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const j = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (j > 0 && m > 0) return `${j}j ${m}m`;
  if (j > 0) return `${j}j`;
  return `${m}m`;
}

