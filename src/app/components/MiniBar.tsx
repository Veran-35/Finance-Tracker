interface MiniBarProps {
  value: number;
  max: number;
  color: string;
}

export function MiniBar({ value, max, color }: MiniBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = value > max;
  return (
    <div className="bg-[#F1EEE8] rounded-full h-1.5 w-full overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-in-out"
        style={{
          width: `${pct}%`,
          background: over ? "#E76F51" : color,
        }}
      />
    </div>
  );
}
