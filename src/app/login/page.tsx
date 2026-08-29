'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!email.trim() || !password.trim()) {
      setError('Email dan password harus diisi');
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      setSubmitting(false);
      return;
    }

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        router.push('/dashboard');
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setSuccess('Registrasi berhasil! Cek email untuk verifikasi, atau langsung login jika email confirmation dimatikan.');
        setMode('login');
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex bg-cream">

      {/* Left Panel - Branding */}
      <div className="flex-1 bg-dark flex flex-col items-center justify-center relative overflow-hidden p-12 max-lg:hidden">
        {/* Decorative blobs */}
        <div className="absolute w-[300px] h-[300px] rounded-full top-[10%] left-[10%] animate-[floatBlob_8s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(circle, rgba(231,111,81,0.15) 0%, transparent 70%)' }} />
        <div className="absolute w-[250px] h-[250px] rounded-full bottom-[15%] right-[5%] animate-[floatBlob_10s_ease-in-out_infinite_reverse]"
          style={{ background: 'radial-gradient(circle, rgba(244,162,97,0.12) 0%, transparent 70%)' }} />
        <div className="absolute w-[180px] h-[180px] rounded-full top-1/2 right-[30%] animate-[floatBlob_12s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(circle, rgba(6,214,160,0.1) 0%, transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-10 text-center max-w-[400px] animate-[fadeInUp_0.8s_ease-out]">
          <div className="w-20 h-20 rounded-[22px] bg-gradient-accent flex items-center justify-center text-[40px] mx-auto mb-7 shadow-[0_12px_40px_rgba(231,111,81,0.35)]">
            💰
          </div>
          <h1 className="text-4xl font-bold font-display text-cream m-0 mb-3 leading-tight">
            FinTrack
          </h1>
          <p className="text-base text-muted-light m-0 mb-10 leading-relaxed">
            Kelola keuanganmu dengan mudah dan pantau setiap pengeluaran dalam satu dashboard yang elegan.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-col gap-4 text-left">
            {[
              { icon: '📊', text: 'Dashboard keuangan real-time' },
              { icon: '✅', text: 'Todo list terintegrasi' },
              { icon: '🎯', text: 'Budget tracking per kategori' },
              { icon: '🔒', text: 'Data aman dengan enkripsi' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3.5 py-3 px-4 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm text-muted-lighter">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="min-w-[480px] max-lg:min-w-full flex items-center justify-center py-12 px-10">
        <div className="w-full max-w-[400px] animate-[fadeInUp_0.6s_ease-out]">
          {/* Header */}
          <div className="mb-9">
            <h2 className="text-[28px] font-bold font-display text-dark m-0 mb-2">
              {mode === 'login' ? 'Selamat Datang!' : 'Buat Akun Baru'}
            </h2>
            <p className="text-sm text-muted m-0">
              {mode === 'login'
                ? 'Masuk ke akun untuk melanjutkan'
                : 'Daftar untuk mulai menggunakan FinTrack'
              }
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-[#F0EDE8] rounded-xl p-1 mb-7">
            {(['login', 'register'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className={`flex-1 py-2.5 border-none rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all duration-250 ${
                  mode === m
                    ? "bg-white text-dark shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    : "bg-transparent text-muted"
                }`}
              >
                {m === 'login' ? '🔑 Masuk' : '✨ Daftar'}
              </button>
            ))}
          </div>

          {/* Error / Success Message */}
          {error && (
            <div className="py-3 px-4 bg-accent/[0.08] border border-accent/20 rounded-[10px] mb-5 text-[13px] text-accent flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="py-3 px-4 bg-green/[0.08] border border-green/20 rounded-[10px] mb-5 text-[13px] text-green flex items-center gap-2">
              <span>✅</span> {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                className="w-full py-3.5 px-4 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark bg-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted-lighter"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full py-3.5 pl-4 pr-12 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark bg-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted-lighter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-base text-muted-light p-1 transition-colors hover:text-dark"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`mt-2 py-3.5 px-6 text-white border-none rounded-xl text-[15px] font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${
                submitting
                  ? "bg-muted-lighter shadow-none cursor-not-allowed"
                  : "bg-gradient-accent shadow-accent hover:-translate-y-0.5 hover:shadow-accent-lg active:translate-y-0"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Masuk →' : 'Daftar Sekarang →'}</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 text-center text-[13px] text-muted">
            {mode === 'login' ? (
              <span>
                Belum punya akun?{' '}
                <button
                  onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                  className="bg-transparent border-none text-accent font-semibold cursor-pointer text-[13px] p-0 transition-colors hover:text-accent-light"
                >
                  Daftar di sini
                </button>
              </span>
            ) : (
              <span>
                Sudah punya akun?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                  className="bg-transparent border-none text-accent font-semibold cursor-pointer text-[13px] p-0 transition-colors hover:text-accent-light"
                >
                  Masuk di sini
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
