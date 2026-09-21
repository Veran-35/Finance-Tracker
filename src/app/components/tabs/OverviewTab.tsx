import { Transaction, ExpenseByCategory, Category } from "@/app/types";
import { StatCard } from "@/app/components/StatCard";
import DonutChart from "@/app/components/DonutChart";
import { MiniBar } from "@/app/components/MiniBar";
import { TransactionItem } from "@/app/components/TransactionItem";
import { FinanceChart } from "@/app/components/FinanceChart";
import { MonthlyChart } from "@/app/components/MonthlyChart";
import { fmt, fmtShort } from "@/app/utils/format";
import { SkeletonCard, Skeleton } from "@/app/components/Skeleton";

interface OverviewTabProps {
  balance: number;
  totalExpense: number;
  monthIncome: number;
  monthExpense: number;
  topExpenses: Transaction[];
  expenseByCategory: ExpenseByCategory[];
  transactions: Transaction[];
  categories: Category[];
  loading?: boolean;
}

export function OverviewTab({
  balance,
  totalExpense,
  monthIncome,
  monthExpense,
  topExpenses,
  expenseByCategory,
  transactions,
  categories,
  loading = false,
}: OverviewTabProps) {
  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-[280px] rounded-2xl" />
          <Skeleton className="h-[280px] rounded-2xl" />
        </div>
        <Skeleton className="h-[220px] rounded-2xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[62px] rounded-xl" />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[62px] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Saldo",
      value: balance,
      color: "#ffffff",
      icon: "💰",
      bg:
        balance >= 0
          ? "linear-gradient(135deg, #2A9D8F 0%, #06D6A0 100%)"
          : "linear-gradient(135deg, #E76F51 0%, #E98074 100%)",
      isGradient: true,
      statusText: balance >= 0 ? "Keuangan sehat ✓" : "Perlu perhatian",
    },
    {
      label: "Pemasukan Bulan Ini",
      value: monthIncome,
      color: "#219EBC",
      icon: "📈",
      bg: "#fff",
      isGradient: false,
    },
    {
      label: "Pengeluaran Bulan Ini",
      value: monthExpense,
      color: "#E76F51",
      icon: "📉",
      bg: "#fff",
      isGradient: false,
    },
  ];

  const recentTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const topCategories = expenseByCategory.slice(0, 5);

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts Section: Line Chart (Kiri) + Donut & Categories (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <FinanceChart transactions={transactions} />

        {/* Chart + Categories */}
        <div className="bg-white border border-border rounded-2xl p-5.5 flex flex-col justify-between">
          <div className="text-[13px] font-semibold text-dark mb-3">
            Pengeluaran per Kategori
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
            <div className="shrink-0 flex items-center justify-center">
              <DonutChart data={topCategories} total={totalExpense} />
            </div>
            <div className="flex-1 w-full flex flex-col gap-2.5">
              {topCategories.map((c) => (
                <div key={c.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{c.icon}</span>
                      <span className="text-[13px] text-[#5A5550]">{c.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-dark">
                      {fmtShort(c.value)}
                    </span>
                  </div>
                  <MiniBar
                    value={c.value}
                    max={totalExpense > 0 ? totalExpense * 0.5 : 1}
                    color={c.color}
                  />
                </div>
              ))}
              {topCategories.length === 0 && (
                <div className="text-xs text-muted text-center py-6">
                  Belum ada data pengeluaran
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Bulanan (harian, full width) */}
      <MonthlyChart transactions={transactions} className="mb-6" />

      {/* Pengeluaran Terbesar (kiri) + Transaksi Terbaru (kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div>
          <div className="text-[13px] font-semibold text-muted mb-2.5 uppercase tracking-[0.06em]">
            Pengeluaran terbesar
          </div>
          {topExpenses.map((t) => {
            const cat = categories.find((c) => c.id === t.category_id);
            const color = cat?.color || "#aaa";
            return (
              <div
                key={t.id}
                className="bg-white border border-border rounded-xl p-3 px-4 mb-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-[38px] h-[38px] rounded-[10px] text-lg flex items-center justify-center shrink-0"
                    style={{ background: color + "20" }}
                  >
                    {cat?.icon || "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-dark truncate">
                      {t.description}
                    </div>
                    <div className="text-xs text-muted-light">
                      {cat?.name || "Lainnya"} · {t.date}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-accent shrink-0">
                    {fmt(t.amount)}
                  </div>
                </div>
                <div className="mt-2">
                  <MiniBar
                    value={t.amount}
                    max={topExpenses[0].amount}
                    color={color}
                  />
                </div>
              </div>
            );
          })}
          {topExpenses.length === 0 && (
            <div className="bg-white border border-border rounded-xl p-3 px-4 text-xs text-muted-light">
              Belum ada pengeluaran
            </div>
          )}
        </div>

        <div>
          <div className="text-[13px] font-semibold text-muted mb-2.5 uppercase tracking-[0.06em]">
            Transaksi terbaru
          </div>
          {recentTransactions.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              categories={categories}
              variant="compact"
            />
          ))}
          {recentTransactions.length === 0 && (
            <div className="bg-white border border-border rounded-xl p-3 px-4 text-xs text-muted-light">
              Belum ada transaksi
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
