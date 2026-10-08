import { useMemo, useState } from "react";
import { Transaction } from "@/app/types";
import { currentMonthPrefix, monthLabel } from "@/app/utils/date";

interface ExportModalProps {
  transactions: Transaction[];
  onConfirm: (from: string, to: string, label: string) => void;
  onClose: () => void;
}

type Mode = "month" | "year";

function monthStart(prefix: string): string {
  return `${prefix}-01`;
}

function monthEnd(prefix: string): string {
  const [y, m] = prefix.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${prefix}-${String(last).padStart(2, "0")}`;
}

export function ExportModal({ transactions, onConfirm, onClose }: ExportModalProps) {
  const [mode, setMode] = useState<Mode>("month");
  const [fromMonth, setFromMonth] = useState(currentMonthPrefix());
  const [toMonth, setToMonth] = useState(currentMonthPrefix());
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const years = useMemo(() => {
    const set = new Set(transactions.map((t) => t.date.slice(0, 4)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const effectiveYear = years.includes(year) ? year : years[0] || year;

  const [from, to, label] = useMemo(() => {
    if (mode === "year") {
      return [`${effectiveYear}-01-01`, `${effectiveYear}-12-31`, `Tahun ${effectiveYear}`];
    }
    const a = fromMonth <= toMonth ? fromMonth : toMonth;
    const b = fromMonth <= toMonth ? toMonth : fromMonth;
    const rangeLabel = a === b ? monthLabel(a) : `${monthLabel(a)} – ${monthLabel(b)}`;
    return [monthStart(a), monthEnd(b), rangeLabel];
  }, [mode, fromMonth, toMonth, effectiveYear]);

  const count = useMemo(
    () => transactions.filter((t) => t.date >= from && t.date <= to).length,
    [transactions, from, to]
  );

  const inputClass =
    "w-full py-2.5 px-3 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark bg-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10";

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-dark/45 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="bg-cream rounded-2xl p-6 w-full max-w-[440px] mx-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-[slideUp_0.3s_ease-out]">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-semibold font-display">Ekspor Transaksi</div>
          <button
            onClick={onClose}
            className="border-none bg-border rounded-lg w-8 h-8 cursor-pointer text-lg text-[#5A5550] leading-none hover:bg-border-dark transition-colors"
          >
            ×
          </button>
        </div>
        <div className="text-[11px] text-muted-lighter mb-4 leading-relaxed">
          Pilih periode yang ingin diekspor ke CSV.
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(
            [
              { key: "month", label: " Per Bulan" },
              { key: "year", label: "🗓 Per Tahun" },
            ] as const
          ).map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`p-2.5 rounded-[10px] font-semibold text-sm cursor-pointer transition-all duration-150 border-[1.5px] ${
                mode === m.key
                  ? "border-accent bg-[#FDEEE9] text-accent"
                  : "border-border bg-white text-muted"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "month" ? (
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
                DARI BULAN
              </label>
              <input
                type="month"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
                SAMPAI BULAN
              </label>
              <input
                type="month"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
              TAHUN
            </label>
            <select
              value={effectiveYear}
              onChange={(e) => setYear(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              {years.length === 0 && <option value={effectiveYear}>{effectiveYear}</option>}
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="text-[12px] text-muted-light mb-4">
          <span className="font-semibold text-dark">{count}</span> transaksi pada periode{" "}
          <span className="font-semibold text-dark">{label}</span> akan diekspor.
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-[1.5px] border-border-dark rounded-[10px] bg-white text-[#6B6560] text-sm font-semibold cursor-pointer transition-all hover:bg-border/30"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(from, to, label)}
            disabled={count === 0}
            className="flex-1 py-2.5 border-none rounded-[10px] bg-gradient-accent text-white text-sm font-semibold cursor-pointer shadow-accent transition-all hover:shadow-accent-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ekspor
          </button>
        </div>
      </div>
    </div>
  );
}
