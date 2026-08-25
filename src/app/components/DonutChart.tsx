import { fmtShort } from "@/app/utils/format";
import { ExpenseByCategory } from "@/app/types";

interface DonutChartProps {
  data: ExpenseByCategory[];
  total: number;
}

export default function DonutChart({ data, total }: DonutChartProps) {
  const R = 56, cx = 70, cy = 70, stroke = 16;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  const slices = data.map((d) => {
    const pct = total > 0 ? d.value / total : 0;
    const dash = pct * circ;
    const gap = circ - dash;
    const slice = { ...d, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F1EEE8" strokeWidth={stroke} />
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={s.color}
          strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={circ / 4 - s.offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 11, fill: "#8B8680", fontFamily: "'DM Sans', sans-serif" }}>Total</text>
      <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 13, fontWeight: 600, fill: "#2C2825", fontFamily: "'DM Sans', sans-serif" }}>{fmtShort(total)}</text>
    </svg>
  );
}