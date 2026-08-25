import { Budget } from "@/app/types";
import { fmt, fmtShort } from "@/app/utils/format";

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget: b, spent, onEdit, onDelete }: BudgetCardProps) {
  const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
  const over = spent > b.limit;

  return (
    <div
      className={`bg-white rounded-[14px] py-4.5 px-5 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] ${
        over ? "border border-[#F4C4B3]" : "border border-border"
      }`}
    >
      <div className="flex justify-between items-center mb-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center text-xl"
            style={{ background: b.color + "20" }}
          >
            {b.icon}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-dark">{b.title}</div>
            <div className="text-xs text-muted-light">Budget {fmt(b.limit)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <div className={`text-base font-semibold ${over ? "text-accent" : "text-dark"}`}>{fmt(spent)}</div>
            <div className={`text-[11px] ${over ? "text-accent" : "text-muted-light"}`}>
              {over ? `Lebih ${fmt(spent - b.limit)}` : `Sisa ${fmt(b.limit - spent)}`}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(b)}
              title="Edit"
              className="w-7 h-7 rounded-[7px] border-none bg-muted/[0.08] cursor-pointer text-xs flex items-center justify-center transition-all duration-200 hover:bg-accent-light/15"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(b.id)}
              title="Hapus"
              className="w-7 h-7 rounded-[7px] border-none bg-muted/[0.08] cursor-pointer text-xs flex items-center justify-center transition-all duration-200 hover:bg-accent/15"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
      <div className="bg-[#F1EEE8] rounded-full h-2">
        <div
          className="h-full rounded-full transition-[width] duration-600 ease-in-out"
          style={{
            width: `${pct}%`,
            background: over ? "#E76F51" : b.color,
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[11px] text-muted-lighter">0</span>
        <span className={`text-[11px] font-medium ${over ? "text-accent" : "text-muted-light"}`}>{Math.round(pct)}%</span>
        <span className="text-[11px] text-muted-lighter">{fmtShort(b.limit)}</span>
      </div>
    </div>
  );
}
