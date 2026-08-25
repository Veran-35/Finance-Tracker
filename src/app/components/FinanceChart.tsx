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
}

export function FinanceChart({ transactions }: FinanceChartProps) {
  const chartData = useMemo(() => {
    // Group transactions by month
    const monthMap: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthMap[key]) {
        monthMap[key] = { income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        monthMap[key].income += t.amount;
      } else {
        monthMap[key].expense += t.amount;
      }
    });

    // Sort by month and format labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const [, month] = key.split('-');
        return {
          name: monthNames[parseInt(month) - 1],
          Pemasukan: val.income,
          Pengeluaran: val.expense,
        };
      });
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white border border-border rounded-2xl p-5.5 mb-5">
        <div className="text-[13px] font-semibold text-dark mb-4">Grafik Keuangan</div>
        <div className="text-center py-10 text-muted text-sm">
          Belum ada data transaksi untuk ditampilkan
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-5.5 mb-5">
      <div className="text-[13px] font-semibold text-dark mb-4">Grafik Keuangan</div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#8A8580' }}
              axisLine={{ stroke: '#E8E4DF' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#8A8580' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => {
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
              labelStyle={{ color: '#8A8580', fontSize: 11, marginBottom: 4 }}
              formatter={(value) => [fmt(Number(value) || 0), '']}
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
