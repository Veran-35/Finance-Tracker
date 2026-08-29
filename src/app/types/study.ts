export type StudyMode = 'pomodoro' | 'stopwatch';
export type SessionStatus = 'in_progress' | 'completed' | 'cancelled';
export type PomodoroPhase = 'work' | 'short_break' | 'long_break';

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  total_seconds: number;
  created_at: string;
}

export interface SubjectFormData {
  name: string;
  color: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string | null;
  mode: StudyMode;
  duration_seconds: number;
  status: SessionStatus;
  started_at: string;
  ended_at: string | null;
  subjects?: { name: string; color: string } | null;
}

export interface StudyStats {
  total_sessions: number;
  total_seconds: number;
  this_week_seconds: number;
  this_month_seconds: number;
}

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

export const MODE_CONFIG: Record<StudyMode, { label: string; icon: string }> = {
  pomodoro: { label: 'Pomodoro', icon: '🍅' },
  stopwatch: { label: 'Stopwatch', icon: '⏱️' },
};

export const PHASE_CONFIG: Record<PomodoroPhase, { label: string; color: string }> = {
  work: { label: 'Fokus', color: '#E76F51' },
  short_break: { label: 'Istirahat Singkat', color: '#2A9D8F' },
  long_break: { label: 'Istirahat Panjang', color: '#219EBC' },
};

export const SUBJECT_COLORS = [
  '#E76F51',
  '#2A9D8F',
  '#8338EC',
  '#E9C46A',
  '#F4A261',
  '#457B9D',
  '#219EBC',
  '#06D6A0',
  '#3B82F6',
  '#9CA3AF',
];
