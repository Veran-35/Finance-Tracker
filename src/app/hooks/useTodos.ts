'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { Todo, TodoFormData } from '@/app/types/todo';

const DEFAULT_FORM: TodoFormData = {
  title: '',
  description: '',
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

  // ─── Fetch Todos ───────────────────────────────────────────────────
  const fetchTodos = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
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
    fetchTodos();
  }, [fetchTodos]);

  // ─── Add Todo ──────────────────────────────────────────────────────
  const addTodo = async () => {
    if (!user || !form.title.trim()) {
      return { error: 'Title is required' };
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: user.id,
          title: form.title.trim(),
          description: form.description.trim() || null,
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

  // ─── Edit Helpers ──────────────────────────────────────────────────
  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setForm({
      title: todo.title,
      description: todo.description || '',
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
        description: form.description.trim() || null,
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
    addTodo,
    toggleTodo,
    deleteTodo,
    startEdit,
    saveEdit,
    cancelEdit,
    fetchTodos,
  };
}

export type UseTodosReturn = ReturnType<typeof useTodos>;
