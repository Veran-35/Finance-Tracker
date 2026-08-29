'use client';

import { useState, useEffect, useCallback } from 'react';
import { Budget, BudgetFormData, Category } from '@/app/types';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
  };
}

const DEFAULT_FORM: BudgetFormData = {
  category_id: '',
  limit: '',
  period: 'monthly',
  ...getMonthRange(),
};

export function useBudgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<BudgetFormData>({ ...DEFAULT_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch finance categories for the dropdown
  const fetchCategories = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('categories')
      .select('id, name, color, icon')
      .eq('user_id', user.id)
      .eq('module', 'finance')
      .order('name');

    if (data) {
      setCategories(data);
      if (data.length > 0) {
        setForm(f => (f.category_id ? f : { ...f, category_id: data[0].id }));
      }
    }
  }, [user]);

  // Fetch budgets + spent from the budget_progress view
  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('budget_progress')
      .select('budget_id, user_id, category_id, category_name, category_color, category_icon, budget_limit, period, start_date, end_date, spent')
      .eq('user_id', user.id);

    if (!error && data) {
      setBudgets(
        data.map((b) => ({
          id: b.budget_id,
          category_id: b.category_id,
          category_name: b.category_name,
          category_icon: b.category_icon || '📦',
          category_color: b.category_color || '#aaa',
          limit: Number(b.budget_limit),
          spent: Number(b.spent),
          period: b.period,
          start_date: b.start_date,
          end_date: b.end_date,
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // Fetch data awal saat mount; setState terjadi setelah await, bukan cascade derived-state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
    fetchBudgets();
  }, [fetchCategories, fetchBudgets]);

  async function addBudget() {
    if (!user || !form.category_id || !form.limit) return;

    const { error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id: form.category_id,
        amount: parseFloat(form.limit),
        period: form.period,
        start_date: form.start_date,
        end_date: form.end_date,
      });

    if (!error) {
      await fetchBudgets();
      resetForm();
    } else {
      console.error('Gagal menambah budget:', error.message);
    }
  }

  async function saveEdit() {
    if (!user || !editingId || !form.category_id || !form.limit) return;

    const { error } = await supabase
      .from('budgets')
      .update({
        category_id: form.category_id,
        amount: parseFloat(form.limit),
        period: form.period,
        start_date: form.start_date,
        end_date: form.end_date,
      })
      .eq('id', editingId);

    if (!error) {
      await fetchBudgets();
      cancelEdit();
    } else {
      console.error('Gagal mengupdate budget:', error.message);
    }
  }

  async function deleteBudget(id: string) {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (!error) {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } else {
      console.error('Gagal menghapus budget:', error.message);
    }
  }

  function startEdit(budget: Budget) {
    setEditingId(budget.id);
    setForm({
      category_id: budget.category_id,
      limit: String(budget.limit),
      period: budget.period,
      start_date: budget.start_date,
      end_date: budget.end_date,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    resetForm();
  }

  function resetForm() {
    setForm({
      ...DEFAULT_FORM,
      category_id: categories[0]?.id || '',
      ...getMonthRange(),
    });
  }

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return {
    budgets,
    categories,
    form,
    setForm,
    editingId,
    loading,
    totalBudget,
    totalSpent,
    addBudget,
    deleteBudget,
    startEdit,
    saveEdit,
    cancelEdit,
  };
}

export type UseBudgetsReturn = ReturnType<typeof useBudgets>;
