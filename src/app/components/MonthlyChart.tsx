'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Transaction } from '@/app/types';
import { fmt } from '@/app/utils/format';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

// Prefix YYYY-MM dari waktu lokal, bukan toISOString() yang UTC.
function currentMonthPrefix() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(prefix: string) {
  const [year, month] = prefix.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

interface MonthlyChartProps {
  transactions: Transaction[];
  className?: string;
}

export function MonthlyChart({ transactions, className = '' }: MonthlyChartProps) {
  const [month, setMonth] = useState(currentMonthPrefix);

  const monthOptions = useMemo(() => {
    const prefixes = new Set<string>([currentMonthPrefix()]);
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) prefixes.add(t.date.slice(0, 7));
    });
    return [...prefixes].sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const chartData = useMemo(() => {
    const [year, monthNumber] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNumber, 0).getDate();
    const incomeByDay = new Array<number>(daysInMonth).fill(0);
    const expenseByDay = new Array<number>(daysInMonth).fill(0);

    transactions.forEach((t) => {
      if (!t.date || !t.date.startsWith(month)) return;
      const day = Number(t.date.slice(8, 10));
      if (day < 1 || day > daysInMonth) return;
      if (t.type === 'income') incomeByDay[day - 1] += t.amount;
      else expenseByDay[day - 1] += t.amount;
    });

    return incomeByDay.map((income, i) => ({
      name: String(i + 1),
      Pemasukan: income,
      Pengeluaran: expenseByDay[i],
    }));
  }, [transactions, month]);

  const monthIncome = chartData.reduce((s, d) => s + d.Pemasukan, 0);
  const monthExpense = chartData.reduce((s, d) => s + d.Pengeluaran, 0);
  const hasData = monthIncome > 0 || monthExpense > 0;

  return (
    <div
      className={`bg-white border border-border rounded-2xl p-5.5 flex flex-col ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4 max-md:flex-wrap">
        <div>
          <div className="text-[13px] font-semibold text-dark">
            Grafik Keuangan (Bulanan)
          </div>
          <div className="text-xs text-muted-light mt-1">
            Masuk {fmt(monthIncome)} · Keluar {fmt(monthExpense)}
          </div>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          aria-label="Pilih bulan"
          className="py-2 px-3 border border-border bg-white rounded-[10px] text-[13px] text-dark outline-none cursor-pointer transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/10"
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </div>

      {hasData ? (
        <div className="w-full min-h-[260px]" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#8A8580' }}
                axisLine={{ stroke: '#E8E4DF' }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={6}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#8A8580' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => {
                  if (v >= 1000000000) return `${(v / 1000000000).toFixed(0)}M`;
                  if (v >= 1000000) return `${(v / 1000000).toFixed(0)}jt`;
                  if (v >= 1000) return `${(v / 1000).toFixed(0)}rb`;
                  return String(v);
                }}
              />
              <Tooltip
                contentStyle={{
                  background: '#2D2A26',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#F5F0EB',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}
                itemStyle={{ color: '#F5F0EB' }}
                labelStyle={{ color: '#E8E4DF', fontWeight: 600, fontSize: 12, marginBottom: 4 }}
                labelFormatter={(label) => `Tanggal ${label}`}
                formatter={(value, name) => [fmt(Number(value) || 0), String(name)]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Line
                type="monotone"
                dataKey="Pemasukan"
                stroke="#2A9D8F"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#2A9D8F', strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="Pengeluaran"
                stroke="#E76F51"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#E76F51', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-xs text-muted text-center py-15">
          Belum ada transaksi di {monthLabel(month)}
        </div>
      )}
    </div>
  );
}
