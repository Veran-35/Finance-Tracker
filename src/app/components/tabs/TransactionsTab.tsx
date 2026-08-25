import { Transaction, Category } from "@/app/types";
import { TransactionItem } from "@/app/components/TransactionItem";

interface TransactionsTabProps {
  filtered: Transaction[];
  categories: Category[];
  filterType: string;
  onFilterChange: (filter: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export function TransactionsTab({
  filtered,
  categories,
  filterType,
  onFilterChange,
  onEdit,
  onDelete,
  onAddNew,
}: TransactionsTabProps) {
  const filters = [
    { key: "all", label: "Semua" },
    { key: "income", label: "Pemasukan" },
    { key: "expense", label: "Pengeluaran" },
  ];

  return (
    <div>
      <div className="flex gap-1.5 mb-4.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`rounded-[10px] py-2 px-4.5 text-[13px] font-medium cursor-pointer transition-all duration-150 border ${
              filterType === f.key
                ? "border-dark bg-dark text-cream"
                : "border-border bg-white text-[#5A5550] hover:bg-border/50"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="flex flex-row gap-5 ml-auto text-[13px] ">
          <div className=" text-muted-light flex items-center justify-center text-md">
            {filtered.length} transaksi
          </div>
          <button
            onClick={onAddNew}
            className="bg-gradient-accent text-white border-none rounded-xl text-sm font-semibold cursor-pointer flex items-center gap-2 justify-center shadow-accent hover:shadow-accent-lg transition-all duration-200"
            style={{ padding: "8px 16px" }}
          >
            <span className="text-lg leading-none">+</span>
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-white/50">
        {filtered.map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            categories={categories}
            variant="full"
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-15 text-muted-light text-sm">
            Tidak ada transaksi
          </div>
        )}
      </div>
    </div>
  );
}
