'use client';

import { useState } from 'react';
import { Budget, BudgetFormData } from '@/app/types';

const DEFAULT_FORM: BudgetFormData = {
  title: '',
  icon: '💰',
  color: '#E76F51',
  limit: '',
};

const ICON_OPTIONS = ['💰', '🍜', '🚗', '🎮', '💊', '🛍️', '🏠', '💡', '📚', '✈️', '🎬', '👕', '🏋️', '🎵', '📱', '🐾'];

const COLOR_OPTIONS = [
  '#E76F51', '#F4A261', '#2A9D8F', '#219EBC', '#8338EC',
  '#06D6A0', '#E9C46A', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [form, setForm] = useState<BudgetFormData>({ ...DEFAULT_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);

  function addBudget() {
    if (!form.title.trim() || !form.limit) return;
    const newBudget: Budget = {
      id: `b${Date.now()}`,
      title: form.title.trim(),
      icon: form.icon,
      color: form.color,
      limit: parseInt(form.limit),
    };
    setBudgets((prev) => [...prev, newBudget]);
    setForm({ ...DEFAULT_FORM });
  }

  function deleteBudget(id: string) {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

  function startEdit(budget: Budget) {
    setEditingId(budget.id);
    setForm({
      title: budget.title,
      icon: budget.icon,
      color: budget.color,
      limit: String(budget.limit),
    });
  }

  function saveEdit() {
    if (!editingId || !form.title.trim() || !form.limit) return;
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === editingId
          ? {
              ...b,
              title: form.title.trim(),
              icon: form.icon,
              color: form.color,
              limit: parseInt(form.limit),
            }
          : b
      )
    );
    setEditingId(null);
    setForm({ ...DEFAULT_FORM });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...DEFAULT_FORM });
  }

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);

  return {
    budgets,
    form,
    setForm,
    editingId,
    totalBudget,
    addBudget,
    deleteBudget,
    startEdit,
    saveEdit,
    cancelEdit,
    ICON_OPTIONS,
    COLOR_OPTIONS,
  };
}

export type UseBudgetsReturn = ReturnType<typeof useBudgets>;
