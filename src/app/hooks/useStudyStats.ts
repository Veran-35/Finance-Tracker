'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { StudySession, StudyStats } from '@/app/types/study';

const EMPTY_STATS: StudyStats = {
  total_sessions: 0,
  total_seconds: 0,
  this_week_seconds: 0,
  this_month_seconds: 0,
};

export function useStudyStats() {
  const { user } = useAuth();

  const [stats, setStats] = useState<StudyStats>(EMPTY_STATS);
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [statsRes, todayRes, sessionsRes] = await Promise.all([
        supabase
          .from('study_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('study_sessions')
          .select('duration_seconds')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('started_at', startOfToday.toISOString()),
        supabase
          .from('study_sessions')
          .select('*, subjects(name, color)')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('started_at', { ascending: false })
          .limit(20),
      ]);

      if (statsRes.error) {
        console.error('Gagal memuat statistik belajar:', statsRes.error.message);
      } else {
        setStats((statsRes.data as StudyStats | null) ?? EMPTY_STATS);
      }

      if (todayRes.error) {
        console.error('Gagal memuat sesi hari ini:', todayRes.error.message);
      } else {
        const total = (
          (todayRes.data ?? []) as { duration_seconds: number | null }[]
        ).reduce((acc, row) => acc + (row.duration_seconds ?? 0), 0);
        setTodaySeconds(total);
      }

      if (sessionsRes.error) {
        console.error('Gagal memuat sesi terbaru:', sessionsRes.error.message);
      } else {
        setRecentSessions((sessionsRes.data ?? []) as StudySession[]);
      }
    } catch (err) {
      console.error('Error memuat statistik belajar:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Fetch data awal saat mount; setState terjadi setelah await, bukan cascade derived-state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshStats();
  }, [refreshStats]);

  return { stats, todaySeconds, recentSessions, loading, refreshStats };
}

export type UseStudyStatsReturn = ReturnType<typeof useStudyStats>;
