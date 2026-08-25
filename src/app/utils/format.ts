export function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function fmtShort(n: number, isDecimal: boolean = false) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(isDecimal ? 1 : 0)}jt`;
  if (n >= 1000) return `${(n / 1000).toFixed(isDecimal ? 1 : 0)}rb`;
  return String(n);
}

