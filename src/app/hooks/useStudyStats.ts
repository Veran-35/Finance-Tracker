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

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Hitung hari berturut-turut dengan sesi belajar, berakhir hari ini.
// Bila hari ini belum ada, mulai dari kemarin agar streak yang berjalan tidak putus.
export function computeStreak(daily: Record<string, number>): number {
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!(daily[localDayKey(cursor)] > 0)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (daily[localDayKey(cursor)] > 0) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useStudyStats() {
  const { user } = useAuth();

  const [stats, setStats] = useState<StudyStats>(EMPTY_STATS);
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [dailySeconds, setDailySeconds] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const heatmapStart = new Date();
      heatmapStart.setHours(0, 0, 0, 0);
      heatmapStart.setDate(heatmapStart.getDate() - 180);

      const [statsRes, todayRes, sessionsRes, dailyRes] = await Promise.all([
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
        supabase
          .from('study_sessions')
          .select('started_at, duration_seconds')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('started_at', heatmapStart.toISOString()),
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

      if (dailyRes.error) {
        console.error('Gagal memuat data heatmap:', dailyRes.error.message);
      } else {
        const map: Record<string, number> = {};
        ((dailyRes.data ?? []) as { started_at: string; duration_seconds: number | null }[]).forEach(
          (row) => {
            const key = localDayKey(new Date(row.started_at));
            map[key] = (map[key] || 0) + (row.duration_seconds ?? 0);
          }
        );
        setDailySeconds(map);
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

  const deleteSession = async (id: string) => {
    const session = recentSessions.find((s) => s.id === id);

    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Gagal menghapus sesi belajar:', error.message);
        return;
      }

      // Trigger hanya menambah total_seconds subject; kurangi manual agar tidak menggelembung.
      if (session?.subject_id) {
        const { data: subject, error: readError } = await supabase
          .from('subjects')
          .select('total_seconds')
          .eq('id', session.subject_id)
          .maybeSingle();

        if (readError) {
          console.error('Gagal memuat total detik mata pelajaran:', readError.message);
        } else if (subject) {
          const { error: updateError } = await supabase
            .from('subjects')
            .update({
              total_seconds: Math.max(
                0,
                (subject.total_seconds ?? 0) - session.duration_seconds
              ),
            })
            .eq('id', session.subject_id);

          if (updateError) {
            console.error('Gagal mengurangi total detik mata pelajaran:', updateError.message);
          }
        }
      }

      await refreshStats();
    } catch (err) {
      console.error('Error menghapus sesi belajar:', err);
    }
  };

  return { stats, todaySeconds, recentSessions, loading, refreshStats, deleteSession, dailySeconds, streak: computeStreak(dailySeconds) };
}

export type UseStudyStatsReturn = ReturnType<typeof useStudyStats>;
