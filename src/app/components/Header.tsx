'use client';

import { NAV_ITEMS } from "@/app/data/initial-data";
import { useAuth } from "@/app/context/AuthContext";

interface HeaderProps {
  activeTab: string;
}

export function Header({ activeTab }: HeaderProps) {
  const { user, signOut } = useAuth();

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'FT';

  return (
    <header className="bg-white border-b border-border sticky top-0 z-10 flex items-center justify-between py-4.5 px-8">
      <div>
        <div className="text-[11px] font-medium text-muted-light tracking-[0.08em] uppercase">
          {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
        </div>
        <div className="text-[22px] font-semibold font-['Playfair_Display',serif] text-dark leading-tight">
          Financial Tracker
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="text-xs text-muted max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
              {user.email}
            </div>
            <button
              onClick={signOut}
              className="py-1.5 px-3.5 border border-border-dark rounded-lg bg-white text-muted text-xs font-medium cursor-pointer transition-all duration-200 flex items-center gap-1 hover:border-accent hover:text-accent"
            >
              🚪 Logout
            </button>
          </div>
        )}
        <div className="w-10 h-10 rounded-full bg-gradient-avatar flex items-center justify-center text-white font-semibold text-sm">
          {userInitials}
        </div>
      </div>
    </header>
  );
}
