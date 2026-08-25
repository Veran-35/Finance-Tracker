import { Category } from "@/app/types";

export const CATEGORIES: Category[] = [
  { id: "1", name: "Makanan", color: "#E76F51", icon: "🍜" },
  { id: "2", name: "Transportasi", color: "#2A9D8F", icon: "🚗" },
  { id: "3", name: "Hiburan", color: "#8338EC", icon: "🎮" },
  { id: "4", name: "Kesehatan", color: "#E9C46A", icon: "💊" },
  { id: "5", name: "Belanja", color: "#F4A261", icon: "🛍️" },
  { id: "6", name: "Gaji", color: "#219EBC", icon: "💼" },
  { id: "7", name: "Freelance", color: "#06D6A0", icon: "💻" },
];

const FALLBACK_CATEGORY: Category = { name: "Lainnya", color: "#aaa", icon: "•", id: "0" };

export function getCat(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) || { ...FALLBACK_CATEGORY, id };
}