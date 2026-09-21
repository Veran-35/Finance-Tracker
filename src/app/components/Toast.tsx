'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  push: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_STYLE: Record<ToastType, { icon: string; accent: string }> = {
  success: { icon: '✓', accent: '#06D6A0' },
  error: { icon: '✕', accent: '#E76F51' },
  info: { icon: 'ℹ', accent: '#219EBC' },
};

const AUTO_DISMISS_MS = 3600;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  const value: ToastContextValue = {
    push,
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-[340px] w-[calc(100vw-40px)] pointer-events-none">
      {toasts.map((t) => {
        const style = TOAST_STYLE[t.type];
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 bg-white border border-border rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] py-3 px-4 animate-[fadeInUp_0.25s_ease-out]"
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
              style={{ background: style.accent }}
            >
              {style.icon}
            </span>
            <div className="flex-1 min-w-0 text-[13px] text-dark leading-snug break-words">
              {t.message}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Tutup notifikasi"
              className="text-muted-light hover:text-dark bg-transparent border-none cursor-pointer text-base leading-none shrink-0 p-0"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
