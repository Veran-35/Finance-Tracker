import { Transaction, Budget } from "@/app/types";

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "income", amount: 8000000, category_id: "6", description: "Gaji bulan Mei", date: "2025-05-01" },
  { id: "t2", type: "income", amount: 1500000, category_id: "7", description: "Project desain logo", date: "2025-05-05" },
  { id: "t3", type: "expense", amount: 350000, category_id: "1", description: "Groceries Indomaret", date: "2025-05-07" },
  { id: "t4", type: "expense", amount: 120000, category_id: "2", description: "Bensin motor", date: "2025-05-08" },
  { id: "t5", type: "expense", amount: 299000, category_id: "3", description: "Netflix & Spotify", date: "2025-05-10" },
  { id: "t6", type: "expense", amount: 85000, category_id: "1", description: "Makan siang tim", date: "2025-05-12" },
  { id: "t7", type: "expense", amount: 450000, category_id: "5", description: "Baju baru", date: "2025-05-14" },
  { id: "t8", type: "expense", amount: 200000, category_id: "4", description: "Vitamin & suplemen", date: "2025-05-15" },
  { id: "t9", type: "expense", amount: 75000, category_id: "2", description: "Grab ke kantor", date: "2025-05-18" },
  { id: "t10", type: "expense", amount: 180000, category_id: "1", description: "Dinner keluarga", date: "2025-05-20" },
];

export const BUDGETS: Budget[] = [
  { id: "b1", title: "Makanan", icon: "🍜", color: "#E76F51", limit: 800000 },
  { id: "b2", title: "Transportasi", icon: "🚗", color: "#2A9D8F", limit: 300000 },
  { id: "b3", title: "Hiburan", icon: "🎮", color: "#8338EC", limit: 400000 },
  { id: "b4", title: "Belanja", icon: "🛍️", color: "#F4A261", limit: 500000 },
];

export const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "transaksi", label: "Transaksi", icon: "💳" },
  { id: "budget", label: "Budget", icon: "🎯" },
  { id: "todos", label: "Todo List", icon: "✅" },
] as const;
