'use client';

import { useMemo } from 'react';
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

interface FinanceChartProps {
  transactions: Transaction[];
  className?: string;
}

export function FinanceChart({ transactions, className = '' }: FinanceChartProps) {
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    // Initialize all 12 months with 0
    const monthlyStats = monthNames.map((name) => ({
      name,
      Pemasukan: 0,
      Pengeluaran: 0,
    }));

    transactions.forEach((t) => {
      if (!t.date) return;
      const date = new Date(t.date);
      const monthIdx = date.getMonth(); // 0 (Jan) - 11 (Des)

      if (monthIdx >= 0 && monthIdx < 12) {
        if (t.type === 'income') {
          monthlyStats[monthIdx].Pemasukan += t.amount;
        } else if (t.type === 'expense') {
          monthlyStats[monthIdx].Pengeluaran += t.amount;
        }
      }
    });

    return monthlyStats;
  }, [transactions]);

  return (
    <div className={`bg-white border border-border rounded-2xl p-5.5 flex flex-col justify-between ${className}`}>
      <div className="text-[13px] font-semibold text-dark mb-4">Grafik Keuangan (Tahunan)</div>
      <div className="w-full flex-1 min-h-[260px]" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#8A8580' }}
              axisLine={{ stroke: '#E8E4DF' }}
              tickLine={false}
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
              formatter={(value, name) => [fmt(Number(value) || 0), String(name)]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Line
              type="monotone"
              dataKey="Pemasukan"
              stroke="#2A9D8F"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#2A9D8F', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#2A9D8F', strokeWidth: 2, stroke: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="Pengeluaran"
              stroke="#E76F51"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#E76F51', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#E76F51', strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
