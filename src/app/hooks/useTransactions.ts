'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, TransactionFormData, ExpenseByCategory, Category, Account } from '@/app/types';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/app/components/Toast';

const PAGE_SIZE = 10;

interface TransactionRow {
  id: string;
  type: string;
  amount: number | string;
  category_id: string | null;
  account_id: string | null;
  description: string | null;
  transaction_date: string;
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type as Transaction['type'],
    amount: Number(row.amount),
    category_id: row.category_id || '',
    account_id: row.account_id || '',
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
  account_id: '',
  custom_account: '',
  description: '',
  date: todayLocal(),
};

export function useTransactions() {
  const { user } = useAuth();
  const toast = useToast();

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
  const [accounts, setAccounts] = useState<Account[]>([]);
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

  // ─── Fetch Accounts (bank / e-wallet) ──────────────────────────────
  const fetchAccounts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, name, type, color, icon')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Gagal memuat akun:', error.message);
        return;
      }

      if (data) {
        setAccounts(data);
        if (data.length > 0) {
          const preferred = data.find((a) => a.name === 'BCA') || data[0];
          setForm((prev) => (prev.account_id ? prev : { ...prev, account_id: preferred.id }));
        }
      }
    } catch (err) {
      console.error('Error memuat akun:', err);
    }
  }, [user]);

  // ─── Fetch Transactions ────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, type, amount, category_id, account_id, description, transaction_date')
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
    fetchAccounts();
    fetchTransactions();
  }, [fetchCategories, fetchAccounts, fetchTransactions]);

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

  // ─── Akun Default & Custom (impor: nama bank baru) ─────────────────
  const defaultAccountId =
    accounts.find((a) => a.name === 'BCA')?.id || accounts[0]?.id || '';

  async function resolveAccountId(
    row: TransactionFormData,
    cache: Map<string, string>
  ): Promise<string | null> {
    const base = row.account_id || null;
    const custom = row.custom_account.trim();
    if (!user || !custom) return base;

    const key = custom.toLowerCase();
    const cached = cache.get(key);
    if (cached) return cached;

    const existing = accounts.find((a) => a.name.toLowerCase() === key);
    if (existing) {
      cache.set(key, existing.id);
      return existing.id;
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: custom,
        type: 'bank',
        color: '#2A9D8F',
        icon: '🏦',
      })
      .select('id, name, type, color, icon')
      .single();

    if (error || !data) {
      console.error('Gagal membuat akun:', error?.message);
      return base;
    }

    cache.set(key, data.id);
    setAccounts((prev) =>
      prev.some((a) => a.id === data.id)
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
    const catCache = new Map<string, string>();
    const accCache = new Map<string, string>();
    const resolvedCategoryIds: (string | null)[] = [];
    const resolvedAccountIds: (string | null)[] = [];
    for (const r of valid) {
      resolvedCategoryIds.push(await resolveCategoryId(r, catCache));
      resolvedAccountIds.push(await resolveAccountId(r, accCache));
    }

    const payload = valid.map((r, i) => ({
      user_id: user.id,
      type: r.type,
      amount: parseFloat(r.amount),
      category_id: resolvedCategoryIds[i],
      account_id: resolvedAccountIds[i],
      description: r.description,
      transaction_date: r.date,
    }));

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(payload)
        .select('id, type, amount, category_id, account_id, description, transaction_date');

      if (error) {
        console.error('Gagal menambah transaksi:', error.message);
        toast.error('Gagal menambah transaksi');
        return;
      }

      if (data) {
        const added = data.map(toTransaction);
        setTransactions((prev) => [...added, ...prev]);
        setForm({
          ...DEFAULT_FORM,
          category_id: categories[0]?.id || '',
          account_id: defaultAccountId,
          date: todayLocal(),
        });
        toast.success(
          added.length === 1
            ? 'Transaksi ditambahkan'
            : `${added.length} transaksi ditambahkan`
        );
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
    const accountId = await resolveAccountId(form, new Map());

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          type: form.type,
          amount: parseFloat(form.amount),
          category_id: categoryId,
          account_id: accountId,
          description: form.description,
          transaction_date: form.date,
        })
        .eq('id', editingId)
        .select('id, type, amount, category_id, account_id, description, transaction_date')
        .single();

      if (error) {
        console.error('Gagal memperbarui transaksi:', error.message);
        toast.error('Gagal memperbarui transaksi');
        return;
      }

      if (data) {
        const updated = toTransaction(data);
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingId ? updated : t))
        );
        cancelEdit();
        toast.success('Transaksi diperbarui');
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
        toast.error('Gagal menghapus transaksi');
        return;
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success('Transaksi dihapus');
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
        toast.error('Gagal menghapus kategori');
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
      toast.success(`Kategori "${target.name}" dihapus`);
    } catch (err) {
      console.error('Gagal menghapus kategori:', err);
    }
  }

  // ─── Add / Update Account ──────────────────────────────────────────
  async function addAccount(input: Omit<Account, 'id'>) {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({ user_id: user.id, ...input })
        .select('id, name, type, color, icon')
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Nama akun sudah dipakai');
        } else {
          console.error('Gagal menambah akun:', error.message);
          toast.error('Gagal menambah akun');
        }
        return;
      }

      if (data) {
        setAccounts((prev) =>
          prev.some((a) => a.id === data.id)
            ? prev
            : [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success(`Akun "${data.name}" ditambahkan`);
      }
    } catch (err) {
      console.error('Gagal menambah akun:', err);
    }
  }

  async function updateAccount(id: string, input: Omit<Account, 'id'>) {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(input)
        .eq('id', id)
        .select('id, name, type, color, icon')
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Nama akun sudah dipakai');
        } else {
          console.error('Gagal memperbarui akun:', error.message);
          toast.error('Gagal memperbarui akun');
        }
        return;
      }

      if (data) {
        setAccounts((prev) =>
          prev
            .map((a) => (a.id === id ? data : a))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success(`Akun "${data.name}" diperbarui`);
      }
    } catch (err) {
      console.error('Gagal memperbarui akun:', err);
    }
  }

  // ─── Delete Account ────────────────────────────────────────────────
  // Di DB: transactions.account_id jadi null (on delete set null).
  async function deleteAccount(id: string) {
    if (!user) return;

    const target = accounts.find((a) => a.id === id);
    if (!target) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Gagal menghapus akun:', error.message);
        toast.error('Gagal menghapus akun');
        return;
      }

      setAccounts((prev) => prev.filter((a) => a.id !== id));
      setTransactions((prev) =>
        prev.map((t) => (t.account_id === id ? { ...t, account_id: '' } : t))
      );
      setForm((prev) =>
        prev.account_id === id
          ? {
              ...prev,
              account_id: accounts.find((a) => a.id !== id)?.id || '',
              custom_account: '',
            }
          : prev
      );
      toast.success(`Akun "${target.name}" dihapus`);
    } catch (err) {
      console.error('Gagal menghapus akun:', err);
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
      account_id: transaction.account_id || defaultAccountId,
      custom_account: '',
      description: transaction.description,
      date: transaction.date,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      ...DEFAULT_FORM,
      category_id: categories[0]?.id || '',
      account_id: defaultAccountId,
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
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
  };
}

export type UseTransactionsReturn = ReturnType<typeof useTransactions>;
