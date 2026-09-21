import { useMemo, useState } from "react";
import { Transaction, Category } from "@/app/types";
import { StatCard } from "@/app/components/StatCard";
import DonutChart from "@/app/components/DonutChart";
import { MiniBar } from "@/app/components/MiniBar";
import { TransactionItem } from "@/app/components/TransactionItem";
import { FinanceChart } from "@/app/components/FinanceChart";
import { MonthlyChart } from "@/app/components/MonthlyChart";
import { fmt, fmtShort } from "@/app/utils/format";
import {
  currentMonthPrefix,
  shiftMonthPrefix,
  monthLabel,
} from "@/app/utils/date";
import { SkeletonCard, Skeleton } from "@/app/components/Skeleton";

interface OverviewTabProps {
  balance: number;
  totalExpense: number;
  monthIncome: number;
  monthExpense: number;
  topExpenses: Transaction[];
  expenseByCategory: { id: string; value: number; name: string; color: string; icon: string }[];
  transactions: Transaction[];
  categories: Category[];
  loading?: boolean;
}

interface CategorySlice {
  id: string;
  value: number;
  name: string;
  color: string;
  icon: string;
}

function aggregateByCategory(
  transactions: Transaction[],
  categories: Category[],
  prefix: string
): CategorySlice[] {
  const map: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(prefix))
    .forEach((t) => {
      map[t.category_id] = (map[t.category_id] || 0) + t.amount;
    });
  return Object.entries(map)
    .map(([id, value]) => {
      const cat = categories.find((c) => c.id === id);
      return {
        id,
        value,
        name: cat?.name || "Lainnya",
        color: cat?.color || "#aaa",
        icon: cat?.icon || "📦",
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function OverviewTab({
  balance,
  transactions,
  categories,
  loading = false,
}: OverviewTabProps) {
  const [period, setPeriod] = useState(currentMonthPrefix);

  const periodTxns = useMemo(
    () => transactions.filter((t) => t.date.startsWith(period)),
    [transactions, period]
  );

  const periodIncome = useMemo(
    () =>
      periodTxns
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
    [periodTxns]
  );

  const periodExpense = useMemo(
    () =>
      periodTxns
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [periodTxns]
  );

  const periodByCategory = useMemo(
    () => aggregateByCategory(transactions, categories, period),
    [transactions, categories, period]
  );

  const prevByCategory = useMemo(() => {
    const prevPrefix = shiftMonthPrefix(period, -1);
    const map: Record<string, number> = {};
    aggregateByCategory(transactions, categories, prevPrefix).forEach((c) => {
      map[c.id] = c.value;
    });
    return map;
  }, [transactions, categories, period]);

  const topCategories = periodByCategory.slice(0, 5);

  const insights = useMemo(
    () =>
      topCategories.map((c) => {
        const prev = prevByCategory[c.id] || 0;
        const delta = c.value - prev;
        const pct = prev > 0 ? Math.round((delta / prev) * 100) : delta > 0 ? 100 : 0;
        return { ...c, prev, delta, pct };
      }),
    [topCategories, prevByCategory]
  );

  const periodTopExpenses = useMemo(
    () =>
      periodTxns
        .filter((t) => t.type === "expense")
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5),
    [periodTxns]
  );

  const periodRecent = useMemo(
    () =>
      periodTxns
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [periodTxns]
  );

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
      label: `Pemasukan ${monthLabel(period)}`,
      value: periodIncome,
      color: "#219EBC",
      icon: "📈",
      bg: "#fff",
      isGradient: false,
    },
    {
      label: `Pengeluaran ${monthLabel(period)}`,
      value: periodExpense,
      color: "#E76F51",
      icon: "📉",
      bg: "#fff",
      isGradient: false,
    },
  ];

  return (
    <div>
      {/* Period selector */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setPeriod((p) => shiftMonthPrefix(p, -1))}
          aria-label="Bulan sebelumnya"
          className="w-9 h-9 rounded-lg border border-border bg-white text-dark cursor-pointer hover:bg-border/50 transition-colors text-base leading-none"
        >
          ‹
        </button>
        <div className="min-w-[170px] text-center">
          <div className="text-[15px] font-semibold text-dark leading-tight">
            {monthLabel(period)}
          </div>
          {period !== currentMonthPrefix() && (
            <button
              onClick={() => setPeriod(currentMonthPrefix())}
              className="text-[11px] text-accent bg-transparent border-none cursor-pointer hover:underline mt-0.5"
            >
              Kembali ke bulan ini
            </button>
          )}
        </div>
        <button
          onClick={() => setPeriod((p) => shiftMonthPrefix(p, 1))}
          aria-label="Bulan berikutnya"
          className="w-9 h-9 rounded-lg border border-border bg-white text-dark cursor-pointer hover:bg-border/50 transition-colors text-base leading-none"
        >
          ›
        </button>
      </div>

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
            Pengeluaran per Kategori · {monthLabel(period)}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
            <div className="shrink-0 flex items-center justify-center">
              <DonutChart data={topCategories} total={periodExpense} />
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
                    max={periodExpense > 0 ? periodExpense * 0.5 : 1}
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

      {/* Month-over-month category insight */}
      {insights.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-5.5 mb-6">
          <div className="text-[13px] font-semibold text-dark mb-1">
            Perbandingan vs bulan lalu
          </div>
          <div className="text-xs text-muted-light mb-3.5">
            Perubahan pengeluaran per kategori dibanding {monthLabel(shiftMonthPrefix(period, -1))}
          </div>
          <div className="flex flex-col gap-2">
            {insights.map((c) => {
              const up = c.delta > 0;
              const flat = c.delta === 0;
              const color = flat ? "#8A8580" : up ? "#E76F51" : "#2A9D8F";
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl bg-cream/60 border border-border"
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="text-[13px] text-dark flex-1 min-w-0 truncate">
                    {c.name}
                  </span>
                  <span className="text-xs text-muted-light shrink-0">
                    {fmtShort(c.prev)} → {fmtShort(c.value)}
                  </span>
                  <span
                    className="text-[12px] font-semibold shrink-0 min-w-[62px] text-right"
                    style={{ color }}
                  >
                    {flat ? "—" : `${up ? "▲" : "▼"} ${Math.abs(c.pct)}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grafik Bulanan (harian, full width) */}
      <MonthlyChart transactions={transactions} className="mb-6" />

      {/* Pengeluaran Terbesar (kiri) + Transaksi Terbaru (kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div>
          <div className="text-[13px] font-semibold text-muted mb-2.5 uppercase tracking-[0.06em]">
            Pengeluaran terbesar · {monthLabel(period)}
          </div>
          {periodTopExpenses.map((t) => {
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
                    max={periodTopExpenses[0].amount}
                    color={color}
                  />
                </div>
              </div>
            );
          })}
          {periodTopExpenses.length === 0 && (
            <div className="bg-white border border-border rounded-xl p-3 px-4 text-xs text-muted-light">
              Belum ada pengeluaran
            </div>
          )}
        </div>

        <div>
          <div className="text-[13px] font-semibold text-muted mb-2.5 uppercase tracking-[0.06em]">
            Transaksi terbaru · {monthLabel(period)}
          </div>
          {periodRecent.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              categories={categories}
              variant="compact"
            />
          ))}
          {periodRecent.length === 0 && (
            <div className="bg-white border border-border rounded-xl p-3 px-4 text-xs text-muted-light">
              Belum ada transaksi
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
