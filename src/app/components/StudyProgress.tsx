'use client';

import { useEffect, useState } from 'react';
import { fmtDurationHuman } from '@/app/utils/format';

const GOAL_KEY = 'study-weekly-goal-minutes';
const DEFAULT_GOAL_MINUTES = 300;

function loadGoal(): number {
  if (typeof window === 'undefined') return DEFAULT_GOAL_MINUTES;
  try {
    const raw = window.localStorage.getItem(GOAL_KEY);
    if (raw) {
      const value = Number(JSON.parse(raw));
      if (Number.isFinite(value) && value > 0) return Math.min(value, 10000);
    }
  } catch {
    // abaikan nilai korup
  }
  return DEFAULT_GOAL_MINUTES;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

interface HeatCell {
  key: string;
  seconds: number;
  future: boolean;
}

// Kolom = minggu (Sen–Min), 18 minggu terakhir sampai hari ini.
function buildHeatmap(daily: Record<string, number>): HeatCell[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mundur ke Senin pada minggu paling awal.
  const weeks = 18;
  const start = new Date(today);
  const dayOfWeek = (start.getDay() + 6) % 7; // Senin=0
  start.setDate(start.getDate() - dayOfWeek - (weeks - 1) * 7);

  const grid: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + w * 7 + d);
      const key = dayKey(cell);
      col.push({
        key,
        seconds: daily[key] || 0,
        future: cell.getTime() > today.getTime(),
      });
    }
    grid.push(col);
  }
  return grid;
}

function intensity(seconds: number, max: number): string {
  if (seconds <= 0) return '#EFEBE4';
  const ratio = max > 0 ? seconds / max : 0;
  if (ratio < 0.25) return '#A8E6CF';
  if (ratio < 0.5) return '#5FD3A6';
  if (ratio < 0.75) return '#2A9D8F';
  return '#1F7A6E';
}

interface StudyProgressProps {
  dailySeconds: Record<string, number>;
  streak: number;
  thisWeekSeconds: number;
}

export function StudyProgress({
  dailySeconds,
  streak,
  thisWeekSeconds,
}: StudyProgressProps) {
  const [goalMinutes, setGoalMinutes] = useState<number>(loadGoal);

  useEffect(() => {
    try {
      window.localStorage.setItem(GOAL_KEY, JSON.stringify(goalMinutes));
    } catch {
      // localStorage tidak tersedia
    }
  }, [goalMinutes]);

  const goalSeconds = goalMinutes * 60;
  const weekPct = goalSeconds > 0 ? Math.min((thisWeekSeconds / goalSeconds) * 100, 100) : 0;
  const maxSeconds = Object.values(dailySeconds).reduce((m, s) => Math.max(m, s), 0);
  const grid = buildHeatmap(dailySeconds);
  const reached = thisWeekSeconds >= goalSeconds && goalSeconds > 0;

  const handleGoal = (raw: string) => {
    const value = Math.floor(Number(raw));
    if (!Number.isFinite(value) || value < 1) return;
    setGoalMinutes(Math.min(value, 10000));
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5 px-6 mb-5 animate-[fadeInUp_0.55s_ease-out]">
      <div className="flex items-center justify-between gap-4 mb-4 max-md:flex-col max-md:items-start">
        <div className="flex items-center gap-5">
          <div>
            <div className="text-[22px] font-bold text-dark leading-tight flex items-center gap-1.5">
              🔥 {streak}
            </div>
            <div className="text-xs text-muted">Hari beruntun</div>
          </div>
          <div>
            <div className="text-[22px] font-bold text-dark leading-tight">
              {fmtDurationHuman(thisWeekSeconds)}
            </div>
            <div className="text-xs text-muted">Minggu ini</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="weekly-goal"
            className="text-[11px] font-semibold text-muted whitespace-nowrap"
          >
            Target mingguan (menit)
          </label>
          <input
            id="weekly-goal"
            type="number"
            min={1}
            value={goalMinutes}
            onChange={(e) => handleGoal(e.target.value)}
            className="w-20 py-1.5 px-2.5 border-[1.5px] border-border-dark rounded-lg text-[13px] text-dark outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 text-center"
          />
        </div>
      </div>

      {/* Weekly goal progress */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[12px] font-medium text-muted">
            Progress target mingguan
          </span>
          <span
            className="text-[12px] font-bold"
            style={{ color: reached ? '#06D6A0' : '#2A9D8F' }}
          >
            {Math.round(weekPct)}%{reached ? ' ✓' : ''}
          </span>
        </div>
        <div className="h-2.5 bg-[#F0EDE8] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-in-out"
            style={{
              width: `${weekPct}%`,
              background: reached
                ? 'linear-gradient(90deg,#06D6A0,#2A9D8F)'
                : 'linear-gradient(90deg,#2A9D8F,#219EBC)',
            }}
          />
        </div>
      </div>

      {/* Heatmap */}
      <div className="flex items-start gap-2 overflow-x-auto pb-1">
        <div className="flex flex-col gap-1 pt-[2px] shrink-0">
          {['Sen', '', 'Rab', '', 'Jum', '', ''].map((label, i) => (
            <span
              key={i}
              className="h-[13px] text-[9px] text-muted-lighter leading-[13px] w-6"
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          {grid.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((cell) => (
                <span
                  key={cell.key}
                  title={`${cell.key}: ${cell.seconds > 0 ? fmtDurationHuman(cell.seconds) : 'tidak ada sesi'}`}
                  className="w-[13px] h-[13px] rounded-[3px]"
                  style={{
                    background: cell.future ? 'transparent' : intensity(cell.seconds, maxSeconds),
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-lighter">
        <span>Sedikit</span>
        {['#EFEBE4', '#A8E6CF', '#5FD3A6', '#2A9D8F', '#1F7A6E'].map((c) => (
          <span key={c} className="w-[11px] h-[11px] rounded-[3px]" style={{ background: c }} />
        ))}
        <span>Banyak</span>
      </div>
    </div>
  );
}
