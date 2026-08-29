'use client';

import { NAV_ITEMS } from "@/app/data/initial-data";
import { useAuth } from "@/app/context/AuthContext";

interface HeaderProps {
  activeTab: string;
  onOpenSidebar?: () => void;
}

export function Header({ activeTab, onOpenSidebar }: HeaderProps) {
  const { user, signOut } = useAuth();

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'FT';

  return (
    <header className="bg-white border-b border-border sticky top-0 z-10 flex items-center justify-between py-4.5 px-8 max-lg:px-4">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="w-9 h-9 rounded-lg bg-dark/5 border-none cursor-pointer flex items-center justify-center text-lg hover:bg-dark/10 transition-colors lg:hidden"
          >
            ☰
          </button>
        )}
        <div>
          <div className="text-[11px] font-medium text-muted-light tracking-[0.08em] uppercase">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
          </div>
          <div className="text-[22px] font-semibold font-display text-dark leading-tight max-lg:text-lg">
            Financial Tracker
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="text-xs text-muted max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap max-lg:hidden">
              {user.email}
            </div>
            <button
              onClick={signOut}
              className="py-1.5 px-3.5 border border-border-dark rounded-lg bg-white text-muted text-xs font-medium cursor-pointer transition-all duration-200 flex items-center gap-1 hover:border-accent hover:text-accent"
            >
              🚪 <span className="max-lg:hidden">Logout</span>
            </button>
          </div>
        )}
        <div className="w-10 h-10 rounded-full bg-gradient-avatar flex items-center justify-center text-white font-semibold text-sm max-lg:w-8 max-lg:h-8 max-lg:text-xs">
          {userInitials}
        </div>
      </div>
    </header>
  );
}
