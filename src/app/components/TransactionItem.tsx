import { Transaction, Category } from "@/app/types";
import { fmt, fmtShort } from "@/app/utils/format";

const FALLBACK_CATEGORY: Category = { name: "Lainnya", color: "#aaa", icon: "📦", id: "0" };

interface TransactionItemProps {
  transaction: Transaction;
  categories?: Category[];
  variant?: "compact" | "full";
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction: t, categories = [], variant = "compact", onEdit, onDelete }: TransactionItemProps) {
  const cat = categories.find(c => c.id === t.category_id) || FALLBACK_CATEGORY;
  const isCompact = variant === "compact";

  return (
    <div className={`flex items-center gap-3 bg-white border border-border rounded-xl ${isCompact ? "p-3 px-4 mb-2" : "p-3.5 px-4.5"}`}>
      <div
        className={`${isCompact ? "w-[38px] h-[38px] rounded-[10px] text-lg" : "w-[42px] h-[42px] rounded-[11px] text-xl"} flex items-center justify-center shrink-0`}
        style={{ background: cat.color + (isCompact ? "20" : "18") }}
      >
        {cat.icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-dark">{t.description}</div>
        <div className={`text-xs text-muted-light ${isCompact ? "" : "mt-0.5"}`}>
          {cat.name} · {t.date}
        </div>
      </div>
      <div className="text-right flex items-center gap-3">
        <div className={`text-sm font-semibold ${t.type === "income" ? "text-teal" : "text-accent"}`}>
          {t.type === "income" ? "+" : "-"}{isCompact ? fmtShort(t.amount) : fmt(t.amount)}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(t)}
                className="border-none bg-transparent text-muted-lighter text-[11px] cursor-pointer py-0.5 px-1 hover:text-teal transition-colors duration-200"
              >
                edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(t.id)}
                className="border-none bg-transparent text-muted-lighter text-[11px] cursor-pointer py-0.5 px-1 hover:text-accent transition-colors duration-200"
              >
                hapus
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
