'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, TransactionFormData, ExpenseByCategory, Category } from '@/app/types';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';

const PAGE_SIZE = 10;

interface TransactionRow {
  id: string;
  type: string;
  amount: number | string;
  category_id: string | null;
  description: string | null;
  transaction_date: string;
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type as Transaction['type'],
    amount: Number(row.amount),
    category_id: row.category_id || '',
    description: row.description || '',
    date: row.transaction_date,
  };
}

// Tanggal YYYY-MM-DD waktu lokal; toISOString() berbasis UTC dan bisa mundur sehari.
function todayLocal() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

const OTHER_CATEGORY_NAME = 'Lainnya';
const CUSTOM_NAME_PATTERN = new RegExp(`^${OTHER_CATEGORY_NAME} \\((.+)\\)$`);

function customCategoryName(custom: string) {
  return `${OTHER_CATEGORY_NAME} (${custom})`;
}

function parseCustomCategory(name: string) {
  const match = name.match(CUSTOM_NAME_PATTERN);
  return match ? match[1] : null;
}

const DEFAULT_FORM: TransactionFormData = {
  type: 'expense',
  amount: '',
  category_id: '',
  custom_category: '',
  description: '',
  date: todayLocal(),
};

export function useTransactions() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
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
        setTransactions(data.map(toTransaction));
      }
    } catch (err) {
      console.error('Error memuat transaksi:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Fetch data awal saat mount; setState terjadi setelah await, bukan cascade derived-state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Prefix YYYY-MM memakai waktu lokal, bukan toISOString() yang UTC.
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income' && t.date.startsWith(monthPrefix))
        .reduce((s, t) => s + t.amount, 0),
    [transactions, monthPrefix]
  );

  const monthExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense' && t.date.startsWith(monthPrefix))
        .reduce((s, t) => s + t.amount, 0),
    [transactions, monthPrefix]
  );

  const topExpenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5),
    [transactions]
  );

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
    const q = search.trim().toLowerCase();
    return transactions
      .filter((t) => filterType === 'all' || t.type === filterType)
      .filter((t) => filterCategory === 'all' || t.category_id === filterCategory)
      .filter((t) => {
        if (!q) return true;
        if (t.description.toLowerCase().includes(q)) return true;
        const catName = categories.find((c) => c.id === t.category_id)?.name;
        return !!catName && catName.toLowerCase().includes(q);
      })
      .filter((t) => (!dateFrom || t.date >= dateFrom) && (!dateTo || t.date <= dateTo))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCategory, search, categories, dateFrom, dateTo]);

  // ─── Pagination ────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasActiveFilters =
    filterType !== 'all' ||
    search.trim() !== '' ||
    filterCategory !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '';

  // Setiap perubahan filter kembali ke halaman 1
  const applyFilterType = (value: string) => {
    setFilterType(value);
    setPage(1);
  };
  const applySearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const applyFilterCategory = (value: string) => {
    setFilterCategory(value);
    setPage(1);
  };
  const applyDateFrom = (value: string) => {
    setDateFrom(value);
    setPage(1);
  };
  const applyDateTo = (value: string) => {
    setDateTo(value);
    setPage(1);
  };

  const resetFilters = () => {
    setFilterType('all');
    setSearch('');
    setFilterCategory('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  // ─── Kategori Custom: "Lainnya (nama)" ─────────────────────────────
  const otherCategory = categories.find((c) => c.name === OTHER_CATEGORY_NAME);

  async function resolveCategoryId(
    row: TransactionFormData,
    cache: Map<string, string>
  ): Promise<string | null> {
    const base = row.category_id || null;
    const custom = row.custom_category.trim();
    if (!user || !custom || !otherCategory || base !== otherCategory.id) return base;

    const name = customCategoryName(custom);
    const cached = cache.get(name);
    if (cached) return cached;

    const existing = categories.find((c) => c.name === name);
    if (existing) {
      cache.set(name, existing.id);
      return existing.id;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        module: 'finance',
        name,
        color: otherCategory.color,
        icon: otherCategory.icon || '📦',
      })
      .select('id, name, color, icon')
      .single();

    if (error || !data) {
      console.error('Gagal membuat kategori custom:', error?.message);
      return base;
    }

    cache.set(name, data.id);
    setCategories((prev) =>
      prev.some((c) => c.id === data.id)
        ? prev
        : [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
    );
    return data.id;
  }

  // ─── Add Transactions (bisa beberapa sekaligus) ────────────────────
  async function addTransactions(rows: TransactionFormData[]) {
    if (!user || rows.length === 0) return;

    const valid = rows.filter((r) => r.amount && r.description.trim());
    if (valid.length === 0) return;

    // Sekuensial: dua baris dengan nama custom baru yang sama tidak boleh insert ganda.
    const cache = new Map<string, string>();
    const resolvedIds: (string | null)[] = [];
    for (const r of valid) {
      resolvedIds.push(await resolveCategoryId(r, cache));
    }

    const payload = valid.map((r, i) => ({
      user_id: user.id,
      type: r.type,
      amount: parseFloat(r.amount),
      category_id: resolvedIds[i],
      description: r.description,
      transaction_date: r.date,
    }));

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(payload)
        .select('id, type, amount, category_id, description, transaction_date');

      if (error) {
        console.error('Gagal menambah transaksi:', error.message);
        return;
      }

      if (data) {
        const added = data.map(toTransaction);
        setTransactions((prev) => [...added, ...prev]);
        setForm({
          ...DEFAULT_FORM,
          category_id: categories[0]?.id || '',
          date: todayLocal(),
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

    const categoryId = await resolveCategoryId(form, new Map());

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          type: form.type,
          amount: parseFloat(form.amount),
          category_id: categoryId,
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
        const updated = toTransaction(data);
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingId ? updated : t))
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

  // ─── Delete Category ───────────────────────────────────────────────
  // Di DB: transactions.category_id jadi null (on delete set null) dan budget kategori itu ikut terhapus (cascade).
  async function deleteCategory(id: string) {
    if (!user) return;

    const target = categories.find((c) => c.id === id);
    if (!target || target.name === OTHER_CATEGORY_NAME) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Gagal menghapus kategori:', error.message);
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setTransactions((prev) =>
        prev.map((t) => (t.category_id === id ? { ...t, category_id: '' } : t))
      );
      setForm((prev) =>
        prev.category_id === id
          ? {
              ...prev,
              category_id: categories.find((c) => c.id !== id)?.id || '',
              custom_category: '',
            }
          : prev
      );
      if (filterCategory === id) setFilterCategory('all');
    } catch (err) {
      console.error('Gagal menghapus kategori:', err);
    }
  }

  // ─── Edit Helpers ──────────────────────────────────────────────────
  function startEdit(transaction: Transaction) {
    const category = categories.find((c) => c.id === transaction.category_id);
    const custom = category ? parseCustomCategory(category.name) : null;

    setEditingId(transaction.id);
    setForm({
      type: transaction.type,
      amount: String(transaction.amount),
      category_id: custom && otherCategory ? otherCategory.id : transaction.category_id,
      custom_category: custom || '',
      description: transaction.description,
      date: transaction.date,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      ...DEFAULT_FORM,
      category_id: categories[0]?.id || '',
      date: todayLocal(),
    });
  }

  return {
    transactions,
    loading,
    totalIncome,
    totalExpense,
    balance,
    monthIncome,
    monthExpense,
    topExpenses,
    expenseByCategory,
    filtered,
    paginated,
    currentPage,
    totalPages,
    filterType,
    setFilterType: applyFilterType,
    search,
    setSearch: applySearch,
    filterCategory,
    setFilterCategory: applyFilterCategory,
    dateFrom,
    setDateFrom: applyDateFrom,
    dateTo,
    setDateTo: applyDateTo,
    setPage,
    resetFilters,
    hasActiveFilters,
    form,
    setForm,
    editingId,
    addTransactions,
    updateTransaction,
    startEdit,
    cancelEdit,
    deleteTransaction,
    deleteCategory,
    categories,
  };
}

export type UseTransactionsReturn = ReturnType<typeof useTransactions>;
