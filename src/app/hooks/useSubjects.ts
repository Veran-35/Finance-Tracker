'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { Subject, SubjectFormData, SUBJECT_COLORS } from '@/app/types/study';

const DEFAULT_FORM: SubjectFormData = {
  name: '',
  color: SUBJECT_COLORS[0],
};

export function useSubjects() {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<SubjectFormData>({ ...DEFAULT_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);

  // ─── Fetch Subjects ────────────────────────────────────────────────
  const fetchSubjects = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Gagal memuat mata pelajaran:', error.message);
      } else if (data) {
        setSubjects(data as Subject[]);
      }
    } catch (err) {
      console.error('Error memuat mata pelajaran:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Fetch data awal saat mount; setState terjadi setelah await, bukan cascade derived-state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSubjects();
  }, [fetchSubjects]);

  // ─── Add Subject ───────────────────────────────────────────────────
  const addSubject = async () => {
    if (!user || !form.name.trim()) {
      return { error: 'Nama mata pelajaran wajib diisi' };
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          user_id: user.id,
          name: form.name.trim(),
          color: form.color,
        })
        .select()
        .single();

      if (error) {
        console.error('Gagal menambah mata pelajaran:', error.message);
        return { error: error.message };
      }

      if (data) {
        setSubjects((prev) => [...prev, data as Subject]);
        setForm({ ...DEFAULT_FORM });
      }

      return { error: null };
    } catch (err) {
      console.error('Error menambah mata pelajaran:', err);
      return { error: (err as Error).message };
    }
  };

  // ─── Update Subject ────────────────────────────────────────────────
  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

    try {
      const { error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Gagal memperbarui mata pelajaran:', error.message);
      }
    } catch (err) {
      console.error('Error memperbarui mata pelajaran:', err);
    }
  };

  // ─── Delete Subject ────────────────────────────────────────────────
  const deleteSubject = async (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Gagal menghapus mata pelajaran:', error.message);
      }
    } catch (err) {
      console.error('Error menghapus mata pelajaran:', err);
    }
  };

  // ─── Edit Helpers ──────────────────────────────────────────────────
  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setForm({ name: subject.name, color: subject.color });
  };

  const saveEdit = async () => {
    if (!editingId || !form.name.trim()) {
      return;
    }

    try {
      await updateSubject(editingId, {
        name: form.name.trim(),
        color: form.color,
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

  return {
    subjects,
    loading,
    form,
    setForm,
    editingId,
    addSubject,
    deleteSubject,
    startEdit,
    saveEdit,
    cancelEdit,
    fetchSubjects,
  };
}

export type UseSubjectsReturn = ReturnType<typeof useSubjects>;
