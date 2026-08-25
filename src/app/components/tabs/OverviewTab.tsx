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

export function OverviewTab({ balance, totalIncome, totalExpense, expenseByCategory, transactions, categories }: OverviewTabProps) {
  const statCards = [
    {
      label: "Saldo",
      value: balance,
      color: balance >= 0 ? "#2A9D8F" : "#E76F51",
      icon: "💰",
      bg: "linear-gradient(135deg, #2A9D8F 0%, #06D6A0 100%)",
      isGradient: balance >= 0,
      statusText: balance >= 0 ? "Keuangan sehat ✓" : "Perlu perhatian",
    },
    { label: "Pemasukan", value: totalIncome, color: "#219EBC", icon: "📈", bg: "#fff", isGradient: false },
    { label: "Pengeluaran", value: totalExpense, color: "#E76F51", icon: "📉", bg: "#fff", isGradient: false },
  ];

  const recentTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const topCategories = expenseByCategory.slice(0, 5);

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3.5 mb-6">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Line Chart */}
      <FinanceChart transactions={transactions} />

      {/* Chart + Categories */}
      <div className="flex gap-4 items-center bg-white border border-border rounded-2xl p-5.5 mb-5">
        <DonutChart data={topCategories} total={totalExpense} />
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="text-[13px] font-semibold text-dark mb-0.5">Pengeluaran per Kategori</div>
          {topCategories.map((c) => (
            <div key={c.id}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{c.icon}</span>
                  <span className="text-[13px] text-[#5A5550]">{c.name}</span>
                </div>
                <span className="text-xs font-semibold text-dark">{fmtShort(c.value)}</span>
              </div>
              <MiniBar value={c.value} max={totalExpense * 0.5} color={c.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="text-[13px] font-semibold text-muted mb-2.5 uppercase tracking-[0.06em]">Transaksi terbaru</div>
      {recentTransactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} categories={categories} variant="compact" />
      ))}
    </div>
  );
}
