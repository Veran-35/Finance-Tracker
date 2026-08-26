import { Transaction, ExpenseByCategory, Category } from "@/app/types";
import { StatCard } from "@/app/components/StatCard";
import DonutChart from "@/app/components/DonutChart";
import { MiniBar } from "@/app/components/MiniBar";
import { TransactionItem } from "@/app/components/TransactionItem";
import { FinanceChart } from "@/app/components/FinanceChart";
import { fmtShort } from "@/app/utils/format";

interface OverviewTabProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  expenseByCategory: ExpenseByCategory[];
  transactions: Transaction[];
  categories: Category[];
}

export function OverviewTab({
  balance,
  totalIncome,
  totalExpense,
  expenseByCategory,
  transactions,
  categories,
}: OverviewTabProps) {
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
      label: "Pemasukan",
      value: totalIncome,
      color: "#219EBC",
      icon: "📈",
      bg: "#fff",
      isGradient: false,
    },
    {
      label: "Pengeluaran",
      value: totalExpense,
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

      {/* Recent Transactions */}
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
    </div>
  );
}
