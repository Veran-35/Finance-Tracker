'use client';

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const targetHref = user ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4">
      <div className="w-16 h-16 rounded-[18px] bg-gradient-accent flex items-center justify-center text-[32px] shadow-accent-lg">
        💰
      </div>
      <h1 className="text-[28px] font-semibold font-display text-dark m-0">
        FinTrack
      </h1>
      <p className="text-sm text-muted m-0">
        Kelola keuanganmu dengan mudah
      </p>
      <Link
        href={targetHref}
        className={`mt-2 bg-gradient-accent text-white border-none rounded-xl py-3.5 px-8 text-[15px] font-semibold no-underline shadow-accent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-accent-lg ${
          loading ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {loading ? 'Memuat...' : user ? 'Masuk ke Dashboard →' : 'Login →'}
      </Link>
    </div>
  );
}
