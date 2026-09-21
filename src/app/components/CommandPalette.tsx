'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export interface Command {
  id: string;
  label: string;
  icon: string;
  hint?: string;
  run: () => void;
}

interface CommandPaletteProps {
  onClose: () => void;
  commands: Command[];
}

export function CommandPalette({ onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    // Fokus setelah overlay ter-render; komponen hanya di-mount saat dibuka.
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const runCommand = (index: number) => {
    const cmd = filtered[index];
    if (!cmd) return;
    cmd.run();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) =>
        filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(active);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-dark/40 pt-[15vh] px-4 animate-[fadeIn_0.12s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] bg-white rounded-2xl border border-border shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden animate-[slideUp_0.16s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <span className="text-muted-light text-base">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ketik perintah atau cari…"
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-dark placeholder:text-muted-lighter"
          />
          <kbd className="text-[10px] text-muted-lighter border border-border rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center text-[13px] text-muted-light py-8">
              Tidak ada perintah yang cocok
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => runCommand(i)}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl border-none cursor-pointer text-left transition-colors ${
                  i === active ? 'bg-accent/10' : 'bg-transparent'
                }`}
              >
                <span className="text-base w-6 text-center shrink-0">{cmd.icon}</span>
                <span className="flex-1 text-[14px] text-dark font-medium truncate">
                  {cmd.label}
                </span>
                {cmd.hint && (
                  <span className="text-[11px] text-muted-light shrink-0">{cmd.hint}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
