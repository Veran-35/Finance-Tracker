'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, TransactionFormData, ExpenseByCategory, Category } from '@/app/types';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';

const DEFAULT_FORM: TransactionFormData = {
  type: 'expense',
  amount: '',
  category_id: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
};

export function useTransactions() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [form, setForm] = useState<TransactionFormData>({ ...DEFAULT_FORM });
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ─── Fetch Categories ──────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color, icon')
        .eq('user_id', user.id)
        .eq('module', 'finance')
        .order('name');

      if (error) {
        console.error('Gagal memuat kategori:', error.message);
        return;
      }

      if (data) {
        setCategories(data);
        if (data.length > 0) {
          setForm((prev) => (prev.category_id ? prev : { ...prev, category_id: data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error memuat kategori:', err);
    }
  }, [user]);

  // ─── Fetch Transactions ────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, type, amount, category_id, description, transaction_date')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Gagal memuat transaksi:', error.message);
      } else if (data) {
        setTransactions(
          data.map((t) => ({
            id: t.id,
            type: t.type as Transaction['type'],
            amount: Number(t.amount),
            category_id: t.category_id || '',
            description: t.description || '',
            date: t.transaction_date,
          }))
        );
      }
    } catch (err) {
      console.error('Error memuat transaksi:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [fetchCategories, fetchTransactions]);

  // ─── Computed Values ───────────────────────────────────────────────
  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const balance = totalIncome - totalExpense;

  const expenseByCategory = useMemo<ExpenseByCategory[]>(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category_id] = (map[t.category_id] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([id, value]) => {
        const cat = categories.find((c) => c.id === id);
        return {
          id,
          value,
          name: cat?.name || 'Lainnya',
          color: cat?.color || '#aaa',
          icon: cat?.icon || '📦',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => filterType === 'all' || t.type === filterType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType]);

  // ─── Add Transaction ───────────────────────────────────────────────
  async function addTransaction() {
    if (!user || !form.amount || !form.description) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: form.type,
          amount: parseFloat(form.amount),
          category_id: form.category_id || null,
          description: form.description,
          transaction_date: form.date,
        })
        .select('id, type, amount, category_id, description, transaction_date')
        .single();

      if (error) {
        console.error('Gagal menambah transaksi:', error.message);
        return;
      }

      if (data) {
        setTransactions((prev) => [
          {
            id: data.id,
            type: data.type as Transaction['type'],
            amount: Number(data.amount),
            category_id: data.category_id || '',
            description: data.description || '',
            date: data.transaction_date,
          },
          ...prev,
        ]);
        setForm({
          ...DEFAULT_FORM,
          category_id: categories[0]?.id || '',
          date: new Date().toISOString().slice(0, 10),
        });
      }
    } catch (err) {
      console.error('Gagal menambah transaksi:', err);
    }
  }

  // ─── Update Transaction ────────────────────────────────────────────
  async function updateTransaction() {
    if (!user || !editingId || !form.amount || !form.description) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          type: form.type,
          amount: parseFloat(form.amount),
          category_id: form.category_id || null,
          description: form.description,
          transaction_date: form.date,
        })
        .eq('id', editingId)
        .select('id, type, amount, category_id, description, transaction_date')
        .single();

      if (error) {
        console.error('Gagal memperbarui transaksi:', error.message);
        return;
      }

      if (data) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === editingId
              ? {
                  id: data.id,
                  type: data.type as Transaction['type'],
                  amount: Number(data.amount),
                  category_id: data.category_id || '',
                  description: data.description || '',
                  date: data.transaction_date,
                }
              : t
          )
        );
        cancelEdit();
      }
    } catch (err) {
      console.error('Gagal memperbarui transaksi:', err);
    }
  }

  // ─── Delete Transaction ────────────────────────────────────────────
  async function deleteTransaction(id: string) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Gagal menghapus transaksi:', error.message);
        return;
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Gagal menghapus transaksi:', err);
    }
  }

  // ─── Edit Helpers ──────────────────────────────────────────────────
  function startEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setForm({
      type: transaction.type,
      amount: String(transaction.amount),
      category_id: transaction.category_id,
      description: transaction.description,
      date: transaction.date,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      ...DEFAULT_FORM,
      category_id: categories[0]?.id || '',
      date: new Date().toISOString().slice(0, 10),
    });
  }

  return {
    transactions,
    loading,
    totalIncome,
    totalExpense,
    balance,
    expenseByCategory,
    filtered,
    filterType,
    setFilterType,
    form,
    setForm,
    editingId,
    addTransaction,
    updateTransaction,
    startEdit,
    cancelEdit,
    deleteTransaction,
    categories,
  };
}

export type UseTransactionsReturn = ReturnType<typeof useTransactions>;
