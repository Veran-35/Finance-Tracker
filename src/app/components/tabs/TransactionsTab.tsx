import { Transaction } from "@/app/types";
import { TransactionItem } from "@/app/components/TransactionItem";
import { UseTransactionsReturn } from "@/app/hooks/useTransactions";

interface TransactionsTabProps {
  txn: UseTransactionsReturn;
  onEdit: (transaction: Transaction) => void;
  onAddNew: () => void;
}

export function TransactionsTab({ txn, onEdit, onAddNew }: TransactionsTabProps) {
  const filters = [
    { key: "all", label: "Semua" },
    { key: "income", label: "Pemasukan" },
    { key: "expense", label: "Pengeluaran" },
  ];

  const inputClass =
    "py-2 px-3 border border-border bg-white rounded-[10px] text-[13px] text-dark outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted-lighter";

  return (
    <div>
      {/* Baris 1: filter tipe + jumlah + tombol tambah */}
      <div className="flex gap-1.5 mb-3 max-md:flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => txn.setFilterType(f.key)}
            className={`rounded-[10px] py-2 px-4.5 text-[13px] font-medium cursor-pointer transition-all duration-150 border ${
              txn.filterType === f.key
                ? "border-dark bg-dark text-cream"
                : "border-border bg-white text-[#5A5550] hover:bg-border/50"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="flex flex-row gap-5 ml-auto text-[13px] ">
          <div className=" text-muted-light flex items-center justify-center text-md">
            {txn.filtered.length} transaksi
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

      {/* Baris 2: toolbar pencarian & filter lanjutan */}
      <div className="flex gap-2 mb-4.5 max-md:flex-wrap">
        <input
          type="search"
          value={txn.search}
          onChange={(e) => txn.setSearch(e.target.value)}
          placeholder="🔍 Cari transaksi..."
          className={`${inputClass} flex-1 min-w-[160px]`}
        />
        <select
          value={txn.filterCategory}
          onChange={(e) => txn.setFilterCategory(e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="all">Semua Kategori</option>
          {txn.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={txn.dateFrom}
          onChange={(e) => txn.setDateFrom(e.target.value)}
          aria-label="Dari tanggal"
          className={inputClass}
        />
        <input
          type="date"
          value={txn.dateTo}
          onChange={(e) => txn.setDateTo(e.target.value)}
          aria-label="Sampai tanggal"
          className={inputClass}
        />
        {txn.hasActiveFilters && (
          <button
            onClick={txn.resetFilters}
            className="rounded-[10px] py-2 px-3.5 text-[13px] font-medium cursor-pointer transition-all duration-150 border border-border bg-white text-accent hover:bg-accent/10"
          >
            Reset
          </button>
        )}
      </div>

      {/* Daftar transaksi (terpaginasi) */}
      <div className="flex flex-col gap-2 bg-white/50">
        {txn.paginated.map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            categories={txn.categories}
            variant="full"
            onEdit={onEdit}
            onDelete={txn.deleteTransaction}
          />
        ))}

        {txn.paginated.length === 0 &&
          (txn.transactions.length === 0 ? (
            <div className="text-center py-15 text-muted-light text-sm">
              Belum ada transaksi. Klik &ldquo;Transaksi Baru&rdquo; untuk menambahkan.
            </div>
          ) : (
            <div className="text-center py-15 text-sm">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-dark font-medium mb-1">
                Tidak ada transaksi yang cocok dengan filter
              </div>
              <button
                onClick={txn.resetFilters}
                className="mt-2 text-accent font-medium cursor-pointer bg-transparent border-none text-[13px] hover:underline"
              >
                Reset semua filter
              </button>
            </div>
          ))}
      </div>

      {/* Pagination */}
      {txn.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={() => txn.setPage(txn.currentPage - 1)}
            disabled={txn.currentPage <= 1}
            className="rounded-[10px] py-2 px-4 text-[13px] font-medium cursor-pointer transition-all duration-150 border border-border bg-white text-[#5A5550] hover:bg-border/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            ‹ Sebelumnya
          </button>
          <span className="text-[13px] text-muted-light px-2">
            Halaman {txn.currentPage} dari {txn.totalPages}
          </span>
          <button
            onClick={() => txn.setPage(txn.currentPage + 1)}
            disabled={txn.currentPage >= txn.totalPages}
            className="rounded-[10px] py-2 px-4 text-[13px] font-medium cursor-pointer transition-all duration-150 border border-border bg-white text-[#5A5550] hover:bg-border/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            Berikutnya ›
          </button>
        </div>
      )}
    </div>
  );
}
