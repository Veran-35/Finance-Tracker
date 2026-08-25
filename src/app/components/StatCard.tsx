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

export function StatCard({ label, value, color, icon, bg, isGradient, statusText }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl py-4.5 px-5 ${isGradient ? "text-white shadow-[0_8px_24px_rgba(42,157,143,0.15)]" : "text-dark border border-border"}`}
      style={{ background: bg }}
    >
      <div className="flex justify-between items-center mb-2.5">
        <div className="text-[11px] font-semibold opacity-70 uppercase tracking-[0.06em]">{label}</div>
        <div className="text-lg">{icon}</div>
      </div>
      <div className="text-[22px] font-semibold" style={{ color: isGradient ? "#fff" : color }}>
        {fmt(value)}
      </div>
      {isGradient && statusText && (
        <div className="text-[11px] opacity-85 mt-1">{statusText}</div>
      )}
    </div>
  );
}
