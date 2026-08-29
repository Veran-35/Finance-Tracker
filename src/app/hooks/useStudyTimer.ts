'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import {
  StudyMode,
  PomodoroPhase,
  SessionStatus,
  PomodoroSettings,
  DEFAULT_POMODORO_SETTINGS,
} from '@/app/types/study';

const SETTINGS_KEY = 'study-timer-pomodoro-settings';
const BASE_TITLE = 'FinTrack — Kelola Keuanganmu';

function loadSettings(): PomodoroSettings {
  if (typeof window === 'undefined') return DEFAULT_POMODORO_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_POMODORO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // abaikan setting korup
  }
  return DEFAULT_POMODORO_SETTINGS;
}

export function useStudyTimer(onSessionSaved?: () => void) {
  const { user } = useAuth();

  const [mode, setModeState] = useState<StudyMode>('pomodoro');
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(
    DEFAULT_POMODORO_SETTINGS.workMinutes * 60
  );
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [settings, setSettings] = useState<PomodoroSettings>(loadSettings);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Sumber kebenaran untuk timekeeping — bebas stale closure di interval
  const elapsedRef = useRef(0);
  const phaseLeftRef = useRef(DEFAULT_POMODORO_SETTINGS.workMinutes * 60);
  const lastTickRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  // ─── Persist settings ──────────────────────────────────────────────
  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // localStorage tidak tersedia
    }
  }, [settings]);

  // ─── Tick dengan koreksi drift + transisi fase pomodoro ────────────
  const tick = useCallback(() => {
    const now = Date.now();
    const deltaMs = now - lastTickRef.current;
    if (deltaMs < 1000) return;
    const wholeSec = Math.floor(deltaMs / 1000);
    lastTickRef.current += wholeSec * 1000;

    if (mode === 'stopwatch') {
      elapsedRef.current += wholeSec;
      setElapsedSeconds(elapsedRef.current);
      return;
    }

    if (phase === 'work') {
      // Hanya fase kerja yang dihitung; clamp agar tidak melewati sisa fase
      const workDelta = Math.min(wholeSec, phaseLeftRef.current);
      elapsedRef.current += workDelta;
    }
    phaseLeftRef.current = Math.max(0, phaseLeftRef.current - wholeSec);

    if (phaseLeftRef.current === 0) {
      if (phase === 'work') {
        const nextCount = pomodoroCount + 1;
        setPomodoroCount(nextCount);
        if (nextCount % settings.longBreakInterval === 0) {
          setPhase('long_break');
          phaseLeftRef.current = settings.longBreakMinutes * 60;
        } else {
          setPhase('short_break');
          phaseLeftRef.current = settings.shortBreakMinutes * 60;
        }
      } else {
        setPhase('work');
        phaseLeftRef.current = settings.workMinutes * 60;
      }
      setIsRunning(false);
    }

    setElapsedSeconds(elapsedRef.current);
    setPhaseTimeLeft(phaseLeftRef.current);
  }, [mode, phase, pomodoroCount, settings]);

  useEffect(() => {
    if (!isRunning) return;
    lastTickRef.current = Date.now();
    intervalRef.current = window.setInterval(tick, 250);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]);

  // ─── Peringatan saat timer berjalan dan tab/browser ditutup ────────
  useEffect(() => {
    if (!isRunning) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isRunning]);

  // ─── Judul tab mengikuti timer ─────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      const h = Math.floor(phaseTimeLeft / 3600);
      const m = Math.floor((phaseTimeLeft % 3600) / 60);
      const s = phaseTimeLeft % 60;
      const pad = (n: number) => String(n).padStart(2, '0');
      const display =
        mode === 'pomodoro'
          ? h > 0
            ? `${h}:${pad(m)}:${pad(s)}`
            : `${pad(m)}:${pad(s)}`
          : null;
      document.title = display
        ? `${display} · Study Timer`
        : `${BASE_TITLE} · Study Timer`;
    } else {
      document.title = BASE_TITLE;
    }
  }, [isRunning, phaseTimeLeft, mode]);

  // ─── Kontrol ───────────────────────────────────────────────────────
  const start = () => {
    if (isRunning) return;
    if (sessionStartRef.current === null) {
      sessionStartRef.current = new Date();
    }
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const setMode = (next: StudyMode) => {
    if (isRunning || elapsedRef.current > 0 || next === mode) return;
    setModeState(next);
    setPhase('work');
    phaseLeftRef.current = settings.workMinutes * 60;
    setPhaseTimeLeft(phaseLeftRef.current);
  };

  const skipBreak = () => {
    if (mode !== 'pomodoro' || phase === 'work') return;
    setPhase('work');
    phaseLeftRef.current = settings.workMinutes * 60;
    setPhaseTimeLeft(phaseLeftRef.current);
    setIsRunning(false);
  };

  const updateSettings = (patch: Partial<PomodoroSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    // Saat idle di fase kerja: durasi countdown langsung mengikuti
    if (!isRunning && elapsedRef.current === 0 && phase === 'work') {
      phaseLeftRef.current = next.workMinutes * 60;
      setPhaseTimeLeft(phaseLeftRef.current);
    }
  };

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setPomodoroCount(0);
    setPhase('work');
    elapsedRef.current = 0;
    phaseLeftRef.current = settings.workMinutes * 60;
    setPhaseTimeLeft(phaseLeftRef.current);
    sessionStartRef.current = null;
  }, [settings.workMinutes]);

  const saveSession = useCallback(
    async (status: SessionStatus) => {
      if (!user) return;

      const duration = elapsedRef.current;
      if (duration <= 0) {
        resetTimer();
        return;
      }

      try {
        const { error } = await supabase.from('study_sessions').insert({
          user_id: user.id,
          subject_id: selectedSubjectId,
          mode,
          duration_seconds: duration,
          status,
          started_at:
            sessionStartRef.current?.toISOString() ?? new Date().toISOString(),
          ended_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Gagal menyimpan sesi belajar:', error.message);
        }
      } catch (err) {
        console.error('Error menyimpan sesi belajar:', err);
      } finally {
        resetTimer();
        onSessionSaved?.();
      }
    },
    [user, selectedSubjectId, mode, onSessionSaved, resetTimer]
  );

  const completeSession = () => saveSession('completed');
  const cancelSession = () => saveSession('cancelled');

  return {
    mode,
    setMode,
    phase,
    isRunning,
    elapsedSeconds,
    phaseTimeLeft,
    pomodoroCount,
    settings,
    updateSettings,
    selectedSubjectId,
    setSelectedSubjectId,
    start,
    pause,
    skipBreak,
    completeSession,
    cancelSession,
  };
}

export type UseStudyTimerReturn = ReturnType<typeof useStudyTimer>;
