import { fmt } from "@/app/utils/format";

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon: string;
  bg: string;
  isGradient: boolean;
  statusText?: string;
}

export function StatCard({
  label,
  value,
  color,
  icon,
  bg,
  isGradient,
  statusText,
}: StatCardProps) {
  const isSaldo = isGradient || label.toLowerCase() === "saldo";

  return (
    <div
      className={`rounded-2xl py-4.5 px-5 transition-all duration-200 ${
        isSaldo
          ? value >= 0
            ? "text-white shadow-[0_8px_24px_rgba(42,157,143,0.18)]"
            : "text-white shadow-[0_8px_24px_rgba(231,111,81,0.18)]"
          : "text-dark border border-border bg-white"
      }`}
      style={{ background: bg }}
    >
      <div className="flex justify-between items-center mb-2.5">
        <div
          className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${
            isSaldo ? "text-white/80" : "text-muted"
          }`}
        >
          {label}
        </div>
        <div className="text-lg">{icon}</div>
      </div>
      <div
        className="text-[22px] font-semibold tracking-tight"
        style={{ color: isSaldo ? "#ffffff" : color }}
      >
        {fmt(value)}
      </div>
      {isSaldo && statusText && (
        <div className="text-[11px] text-white/90 mt-1 font-medium">
          {statusText}
        </div>
      )}
    </div>
  );
}
