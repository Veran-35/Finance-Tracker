'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sesi berlaku 1 jam: lewat dari itu (tab ditutup maupun idle) wajib login ulang.
const SESSION_LIMIT_MS = 60 * 60 * 1000;
const ACTIVITY_KEY = 'ft_last_activity';

function readLastActivity(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(window.localStorage.getItem(ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeLastActivity(ts: number) {
  try {
    window.localStorage.setItem(ACTIVITY_KEY, String(ts));
  } catch {
    // storage penuh / private mode: abaikan, timer in-memory tetap jalan
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef<number>(0);

  const touch = () => {
    lastActivityRef.current = Date.now();
    writeLastActivity(lastActivityRef.current);
  };

  const forceSignOut = async () => {
    try {
      window.localStorage.removeItem(ACTIVITY_KEY);
    } catch {
      // abaikan
    }
    await supabase.auth.signOut();
  };

  useEffect(() => {
    // Get initial session; jika penanda aktivitas sudah lewat 1 jam, paksa keluar.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const stored = readLastActivity();
        if (stored && Date.now() - stored > SESSION_LIMIT_MS) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        lastActivityRef.current = Date.now();
        if (!stored) writeLastActivity(lastActivityRef.current);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (event === 'SIGNED_IN' && session) {
          // Login baru: mulai hitungan sesi dari nol.
          lastActivityRef.current = Date.now();
          writeLastActivity(lastActivityRef.current);
        }
        if (event === 'SIGNED_OUT') {
          try {
            window.localStorage.removeItem(ACTIVITY_KEY);
          } catch {
            // abaikan
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Watcher idle / tab-tutup: berlaku hanya saat ada user login.
  useEffect(() => {
    if (!user) return;
    if (!readLastActivity()) touch();

    const onActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ['click', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const persist = () => touch();
    window.addEventListener('pagehide', persist);

    const timer = window.setInterval(() => {
      // max() supaya aktivitas di tab lain juga dihitung.
      const effective = Math.max(lastActivityRef.current, readLastActivity());
      if (Date.now() - effective > SESSION_LIMIT_MS) {
        void forceSignOut();
        return;
      }
      lastActivityRef.current = effective;
      writeLastActivity(effective);
    }, 30_000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.removeEventListener('pagehide', persist);
      window.clearInterval(timer);
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
