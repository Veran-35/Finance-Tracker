'use client';

import { useState } from 'react';
import { useSubjects } from '@/app/hooks/useSubjects';
import { useStudyStats } from '@/app/hooks/useStudyStats';
import { useStudyTimer } from '@/app/hooks/useStudyTimer';
import { SubjectModal } from '@/app/components/SubjectModal';
import { fmtDuration, fmtDurationHuman } from '@/app/utils/format';
import {
  MODE_CONFIG,
  PHASE_CONFIG,
  PomodoroSettings,
  StudyMode,
} from '@/app/types/study';

export function StudyTimerTab() {
  const stats = useStudyStats();
  const subj = useSubjects();
  const timer = useStudyTimer(stats.refreshStats);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const hasStarted = timer.isRunning || timer.elapsedSeconds > 0;
  const isPomodoro = timer.mode === 'pomodoro';
  const phaseInfo = PHASE_CONFIG[timer.phase];

  const handleOpenAddSubject = () => {
    subj.cancelEdit();
    setShowSubjectModal(true);
  };

  const handleEditSubject = (s: Parameters<typeof subj.startEdit>[0]) => {
    subj.startEdit(s);
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = async (id: string) => {
    if (timer.selectedSubjectId === id) {
      timer.setSelectedSubjectId(null);
    }
    await subj.deleteSubject(id);
  };

  const handleSubmitSubject = async () => {
    if (subj.editingId) {
      await subj.saveEdit();
    } else {
      await subj.addSubject();
    }
    setShowSubjectModal(false);
  };

  const handleCloseSubjectModal = () => {
    subj.cancelEdit();
    setShowSubjectModal(false);
  };

  const updateSetting = (key: keyof PomodoroSettings, raw: string) => {
    const value = Math.floor(Number(raw));
    if (!Number.isFinite(value) || value < 1) return;
    const max = key === 'longBreakInterval' ? 12 : 180;
    const patch: Partial<PomodoroSettings> = { [key]: Math.min(value, max) };
    timer.updateSettings(patch);
  };

  const sortedSubjects = [...subj.subjects].sort(
    (a, b) => b.total_seconds - a.total_seconds
  );
  const maxSubjectSeconds = sortedSubjects[0]?.total_seconds ?? 0;

  const statCards = [
    {
      label: 'Hari Ini',
      value: fmtDurationHuman(stats.todaySeconds),
      icon: '🌅',
      color: '#F4A261',
    },
    {
      label: 'Minggu Ini',
      value: fmtDurationHuman(stats.stats.this_week_seconds),
      icon: '📅',
      color: '#219EBC',
    },
    {
      label: 'Bulan Ini',
      value: fmtDurationHuman(stats.stats.this_month_seconds),
      icon: '🏆',
      color: '#06D6A0',
    },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-7 animate-[fadeInUp_0.4s_ease-out] max-md:grid-cols-1">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl py-4.5 px-5 border border-border flex items-center gap-3.5"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${stat.color}12` }}
            >
              {stat.icon}
            </div>
            <div>
              <div className="text-[22px] font-bold text-dark leading-tight">
                {stat.value}
              </div>
              <div className="text-xs text-muted">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Timer Card */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-5 animate-[fadeInUp_0.5s_ease-out]">
        {/* Mode Toggle + Subject Picker */}
        <div className="flex items-center justify-between mb-6 max-md:flex-col max-md:gap-3">
          <div className="flex gap-1.5 bg-[#F0EDE8] rounded-[10px] p-1">
            {(Object.keys(MODE_CONFIG) as StudyMode[]).map((m) => (
              <button
                key={m}
                onClick={() => timer.setMode(m)}
                disabled={hasStarted}
                className={`py-2 px-4 border-none rounded-lg text-[13px] font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  timer.mode === m
                    ? 'bg-white text-dark shadow-[0_2px_6px_rgba(0,0,0,0.06)] cursor-default'
                    : hasStarted
                      ? 'bg-transparent text-muted-light cursor-not-allowed'
                      : 'bg-transparent text-muted cursor-pointer hover:bg-accent/[0.06]'
                }`}
              >
                {MODE_CONFIG[m].icon} {MODE_CONFIG[m].label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={timer.selectedSubjectId ?? ''}
              onChange={(e) =>
                timer.setSelectedSubjectId(e.target.value || null)
              }
              disabled={hasStarted}
              className="py-2 px-3 border-[1.5px] border-border-dark rounded-lg text-[13px] text-dark outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Tanpa mata pelajaran</option>
              {subj.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleOpenAddSubject}
              className="bg-gradient-accent text-white border-none rounded-[10px] py-2 px-4 text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 shadow-accent transition-all hover:shadow-accent-lg"
            >
              <span className="text-base leading-none">+</span>
              Subjek
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center py-4">
          {isPomodoro && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <span
                className="text-[11px] font-bold py-1 px-3 rounded-full"
                style={{ background: `${phaseInfo.color}15`, color: phaseInfo.color }}
              >
                {phaseInfo.label}
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: timer.settings.longBreakInterval }).map(
                  (_, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          i < timer.pomodoroCount % timer.settings.longBreakInterval
                            ? '#E76F51'
                            : '#E5E0D8',
                      }}
                    />
                  )
                )}
              </div>
            </div>
          )}

          <div className="text-[64px] font-bold text-dark leading-none tracking-tight tabular-nums max-md:text-[48px]">
            {isPomodoro
              ? fmtDuration(timer.phaseTimeLeft)
              : fmtDuration(timer.elapsedSeconds)}
          </div>

          {isPomodoro && timer.elapsedSeconds > 0 && (
            <div className="text-xs text-muted mt-3">
              Total fokus sesi ini: {fmtDuration(timer.elapsedSeconds)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          {!timer.isRunning && (
            <button
              onClick={timer.start}
              className="bg-gradient-accent text-white border-none rounded-[10px] py-2.5 px-7 text-[13px] font-semibold cursor-pointer shadow-accent transition-all hover:shadow-accent-lg"
            >
              {hasStarted ? '▶ Lanjutkan' : '▶ Mulai'}
            </button>
          )}

          {timer.isRunning && (
            <button
              onClick={timer.pause}
              className="py-2.5 px-7 border-[1.5px] border-border-dark rounded-[10px] bg-white text-[#6B6560] text-[13px] font-semibold cursor-pointer transition-all hover:bg-border/30"
            >
              ⏸ Pause
            </button>
          )}

          {isPomodoro && timer.phase !== 'work' && (
            <button
              onClick={timer.skipBreak}
              className="py-2.5 px-5 border-[1.5px] border-border-dark rounded-[10px] bg-white text-[#6B6560] text-[13px] font-semibold cursor-pointer transition-all hover:bg-border/30"
            >
              ⏭ Lewati Istirahat
            </button>
          )}

          {hasStarted && (
            <>
              <button
                onClick={timer.completeSession}
                className="py-2.5 px-5 border-none rounded-[10px] bg-[#06D6A0] text-white text-[13px] font-semibold cursor-pointer transition-all hover:opacity-90"
              >
                ✓ Selesai
              </button>
              <button
                onClick={timer.cancelSession}
                className="py-2.5 px-5 border-none rounded-[10px] bg-[#E76F51] text-white text-[13px] font-semibold cursor-pointer transition-all hover:opacity-90"
              >
                ✕ Batalkan
              </button>
            </>
          )}
        </div>

        {/* Pomodoro Settings */}
        {isPomodoro && !hasStarted && (
          <div className="mt-6 pt-5 border-t border-border grid grid-cols-4 gap-3 max-md:grid-cols-2">
            {(
              [
                { key: 'workMinutes', label: 'Fokus (menit)' },
                { key: 'shortBreakMinutes', label: 'Istirahat (menit)' },
                { key: 'longBreakMinutes', label: 'Istirahat Panjang' },
                { key: 'longBreakInterval', label: 'Long Break Setiap' },
              ] as { key: keyof PomodoroSettings; label: string }[]
            ).map((field) => (
              <div key={field.key}>
                <label className="block text-[11px] font-semibold text-muted mb-1.5">
                  {field.label}
                </label>
                <input
                  type="number"
                  min={1}
                  value={timer.settings[field.key]}
                  onChange={(e) => updateSetting(field.key, e.target.value)}
                  className="w-full py-2 px-3 border-[1.5px] border-border-dark rounded-lg text-[13px] text-dark outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 text-center"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subject Breakdown */}
      {subj.subjects.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-5 px-6 mb-5 animate-[fadeInUp_0.6s_ease-out]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-dark m-0">
              📚 Mata Pelajaran
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {sortedSubjects.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-[13px] font-medium text-dark w-32 truncate shrink-0">
                  {s.name}
                </span>
                <div className="flex-1 h-2 bg-[#F0EDE8] rounded-[10px] overflow-hidden">
                  <div
                    className="h-full rounded-[10px] transition-[width] duration-500"
                    style={{
                      width: `${maxSubjectSeconds > 0 ? (s.total_seconds / maxSubjectSeconds) * 100 : 0}%`,
                      background: s.color,
                    }}
                  />
                </div>
                <span className="text-[13px] font-semibold text-dark w-16 text-right shrink-0">
                  {fmtDurationHuman(s.total_seconds)}
                </span>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEditSubject(s)}
                    className="w-7 h-7 rounded-lg border-none bg-muted/[0.08] cursor-pointer text-xs text-muted flex items-center justify-center hover:bg-muted/15 transition-colors"
                    aria-label={`Edit ${s.name}`}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(s.id)}
                    className="w-7 h-7 rounded-lg border-none bg-[#E76F51]/10 cursor-pointer text-xs text-[#E76F51] flex items-center justify-center hover:bg-[#E76F51]/20 transition-colors"
                    aria-label={`Hapus ${s.name}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="animate-[fadeInUp_0.7s_ease-out]">
        <h3 className="text-[15px] font-semibold text-dark m-0 mb-3">
          🕘 Sesi Terbaru
        </h3>
        {stats.loading ? (
          <div className="text-center py-15 text-muted text-sm">
            <div className="w-9 h-9 border-3 border-accent/15 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            Memuat sesi belajar...
          </div>
        ) : stats.recentSessions.length === 0 ? (
          <div className="text-center py-15 bg-white rounded-2xl border border-border">
            <div className="text-5xl mb-4">📖</div>
            <h3 className="text-base font-semibold text-dark m-0 mb-2">
              Belum ada sesi belajar
            </h3>
            <p className="text-[13px] text-muted-light m-0">
              Mulai timer di atas untuk mencatat sesi belajarmu
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {stats.recentSessions.map((session) => {
              const startedAt = new Date(session.started_at);
              return (
                <div
                  key={session.id}
                  className="bg-white rounded-[14px] border border-border py-3.5 px-5 flex items-center gap-3.5"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{
                      background: session.subjects?.color
                        ? `${session.subjects.color}12`
                        : '#F0EDE8',
                    }}
                  >
                    {MODE_CONFIG[session.mode].icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-dark truncate">
                      {session.subjects?.name ?? 'Tanpa mata pelajaran'}
                    </div>
                    <div className="text-xs text-muted">
                      {startedAt.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      ,{' '}
                      {startedAt.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {MODE_CONFIG[session.mode].label}
                    </div>
                  </div>
                  <div className="text-[13px] font-bold text-dark shrink-0">
                    {fmtDurationHuman(session.duration_seconds)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject Modal */}
      {showSubjectModal && (
        <SubjectModal
          form={subj.form}
          onFormChange={subj.setForm}
          onSubmit={handleSubmitSubject}
          onClose={handleCloseSubjectModal}
          isEditing={!!subj.editingId}
        />
      )}
    </div>
  );
}
