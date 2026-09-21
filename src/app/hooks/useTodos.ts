'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { daysUntil } from '@/app/utils/date';
import { DueSoonTodo, Todo, TodoFormData } from '@/app/types/todo';

const REMINDER_KEY = 'todo-reminder-days';
const DEFAULT_REMINDER_DAYS = 3;

function loadReminderDays(): number {
  if (typeof window === 'undefined') return DEFAULT_REMINDER_DAYS;
  try {
    const raw = window.localStorage.getItem(REMINDER_KEY);
    if (raw) {
      const value = Math.floor(Number(JSON.parse(raw)));
      if (Number.isFinite(value) && value >= 1) return Math.min(value, 30);
    }
  } catch {
    // setting korup: pakai default
  }
  return DEFAULT_REMINDER_DAYS;
}

const DEFAULT_FORM: TodoFormData = {
  title: '',
  content: '',
  priority: 'medium',
  due_date: '',
};

export function useTodos() {
  const { user } = useAuth();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [form, setForm] = useState<TodoFormData>({ ...DEFAULT_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listId, setListId] = useState<string | null>(null);
  const [reminderDays, setReminderDaysState] = useState<number>(loadReminderDays);

  useEffect(() => {
    try {
      window.localStorage.setItem(REMINDER_KEY, JSON.stringify(reminderDays));
    } catch {
      // localStorage tidak tersedia: setting cukup hidup di memori
    }
  }, [reminderDays]);

  function setReminderDays(raw: string) {
    const value = Math.floor(Number(raw));
    if (!Number.isFinite(value) || value < 1) return;
    setReminderDaysState(Math.min(value, 30));
  }

  // todos.list_id NOT NULL: pakai daftar pertama user, atau buat satu bila belum ada.
  const ensureListId = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    if (listId) return listId;

    try {
      const { data, error } = await supabase
        .from('todo_lists')
        .select('id')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .limit(1);

      if (error) {
        console.error('Gagal memuat daftar todo:', error.message);
        return null;
      }

      if (data && data.length > 0) {
        setListId(data[0].id);
        return data[0].id;
      }

      const { data: created, error: createError } = await supabase
        .from('todo_lists')
        .insert({ user_id: user.id, title: 'Umum' })
        .select('id')
        .single();

      if (createError || !created) {
        console.error('Gagal membuat daftar todo:', createError?.message);
        return null;
      }

      setListId(created.id);
      return created.id;
    } catch (err) {
      console.error('Error menyiapkan daftar todo:', err);
      return null;
    }
  }, [user, listId]);

  // ─── Fetch Todos ───────────────────────────────────────────────────
  const fetchTodos = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Gagal memuat todo list:', error.message);
      } else if (data) {
        setTodos(data as Todo[]);
      }
    } catch (err) {
      console.error('Error memuat todo list:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Fetch data awal saat mount; setState terjadi setelah await, bukan cascade derived-state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTodos();
  }, [fetchTodos]);

  // ─── Add Todo ──────────────────────────────────────────────────────
  const addTodo = async () => {
    if (!user || !form.title.trim()) {
      return { error: 'Title is required' };
    }

    const targetListId = await ensureListId();
    if (!targetListId) {
      return { error: 'Daftar todo belum siap' };
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: user.id,
          list_id: targetListId,
          title: form.title.trim(),
          content: form.content.trim() || null,
          priority: form.priority,
          due_date: form.due_date || null,
          is_completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Gagal menambah todo:', error.message);
        return { error: error.message };
      }

      if (data) {
        setTodos((prev) => [data as Todo, ...prev]);
        setForm({ ...DEFAULT_FORM });
      }

      return { error: null };
    } catch (err) {
      console.error('Error menambah todo:', err);
      return { error: (err as Error).message };
    }
  };

  // ─── Update Todo ───────────────────────────────────────────────────
  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    try {
      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Gagal memperbarui todo:', error.message);
      }
    } catch (err) {
      console.error('Error memperbarui todo:', err);
    }
  };

  // ─── Toggle Todo ───────────────────────────────────────────────────
  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    await updateTodo(id, { is_completed: !todo.is_completed });
  };

  // ─── Delete Todo ───────────────────────────────────────────────────
  const deleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Gagal menghapus todo:', error.message);
      }
    } catch (err) {
      console.error('Error menghapus todo:', err);
    }
  };

  // ─── Reorder (drag & drop) ─────────────────────────────────────────
  const reorderTodos = async (dragId: string, overId: string) => {
    if (dragId === overId) return;
    const from = todos.findIndex((t) => t.id === dragId);
    const to = todos.findIndex((t) => t.id === overId);
    if (from < 0 || to < 0) return;

    const next = [...todos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setTodos(next);

    try {
      await Promise.all(
        next
          .map((t, i) => ({ id: t.id, position: i, changed: t.position !== i }))
          .filter((entry) => entry.changed)
          .map((entry) =>
            supabase
              .from('todos')
              .update({ position: entry.position })
              .eq('id', entry.id)
          )
      );
    } catch (err) {
      console.error('Gagal menyimpan urutan todo:', err);
    }
  };

  // ─── Edit Helpers ──────────────────────────────────────────────────
  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setForm({
      title: todo.title,
      content: todo.content || '',
      priority: todo.priority,
      due_date: todo.due_date || '',
    });
  };

  const saveEdit = async () => {
    if (!editingId || !form.title.trim()) {
      return;
    }

    try {
      await updateTodo(editingId, {
        title: form.title.trim(),
        content: form.content.trim() || null,
        priority: form.priority,
        due_date: form.due_date || null,
      });

      setEditingId(null);
      setForm({ ...DEFAULT_FORM });
    } catch (err) {
      console.error('Gagal menyimpan edit:', err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...DEFAULT_FORM });
  };

  // ─── Filtered & Stats ─────────────────────────────────────────────
  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.is_completed).length,
    completed: todos.filter((t) => t.is_completed).length,
  };

  const dueSoonTodos: DueSoonTodo[] = todos
    .filter((t) => !t.is_completed && t.due_date)
    .map((todo) => ({ todo, daysLeft: daysUntil(todo.due_date as string) }))
    .filter(({ daysLeft }) => daysLeft >= 0 && daysLeft <= reminderDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    todos: filtered,
    allTodos: todos,
    loading,
    filter,
    setFilter,
    form,
    setForm,
    editingId,
    stats,
    reminderDays,
    setReminderDays,
    dueSoonTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    startEdit,
    saveEdit,
    cancelEdit,
    fetchTodos,
  };
}

export type UseTodosReturn = ReturnType<typeof useTodos>;
