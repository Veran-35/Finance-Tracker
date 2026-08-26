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
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  limit: number;
  spent: number;
  period: string;
  start_date: string;
  end_date: string;
}

export interface BudgetFormData {
  category_id: string;
  limit: string;
  period: string;
  start_date: string;
  end_date: string;
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
