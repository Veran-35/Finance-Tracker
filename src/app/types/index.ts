export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category_id: string;
  description: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  title: string;
  icon: string;
  color: string;
  limit: number;
}

export interface BudgetFormData {
  title: string;
  icon: string;
  color: string;
  limit: string;
}

export interface TransactionFormData {
  type: string;
  amount: string;
  category_id: string;
  description: string;
  date: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface ExpenseByCategory {
  id: string;
  value: number;
  name: string;
  color: string;
  icon: string;
}
