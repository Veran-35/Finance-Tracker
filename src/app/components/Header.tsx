'use client';

import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/app/data/initial-data";
import { useAuth } from "@/app/context/AuthContext";
import { DueSoonTodo } from "@/app/types/todo";

interface HeaderProps {
  activeTab: string;
  onOpenSidebar?: () => void;
  dueSoon: DueSoonTodo[];
  reminderDays: number;
}


export function Header({ activeTab, onOpenSidebar, dueSoon, reminderDays }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [date, setDate] = useState(new Date());


  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'FT';
  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 500);
    return () => clearInterval(interval);
  }, []);

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
            <div className="text-[15px] text-gray-500 tracking-wide bg-gray-100 px-2 py-1 rounded-lg font-mono font-medium">
              {date.getHours()}
              <span className={date.getMilliseconds() <900? "text-muted-light" : "text-transparent"}>:</span>
              {date.getMinutes().toString().padStart(2, "0")}
            </div>
            {dueSoon.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowNotif((v) => !v)}
                  aria-label={`Notifikasi todo mendekati tenggat (${dueSoon.length})`}
                  className="w-9 h-9 rounded-lg bg-[#F4A261]/10 border-none cursor-pointer flex items-center justify-center text-base hover:bg-[#F4A261]/20 transition-colors relative"
                >
                  🔔
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {dueSoon.length}
                  </span>
                </button>

                {showNotif && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotif(false)}
                    />
                    <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[300px] bg-white rounded-xl border border-border shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-3 animate-[fadeIn_0.15s_ease-out]">
                      <div className="text-[13px] font-semibold text-dark mb-2">
                        ⏰ {dueSoon.length} todo mendekati tenggat
                      </div>
                      <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto">
                        {dueSoon.map(({ todo: t, daysLeft }) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-2 py-2 px-2.5 rounded-lg bg-[#F4A261]/[0.08]"
                          >
                            <div className="flex-1 min-w-0 text-[13px] font-medium text-dark truncate">
                              {t.title}
                            </div>
                            <span className="text-[11px] font-semibold text-[#F4A261] shrink-0">
                              H-{daysLeft}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-muted-lighter mt-2">
                        Pengingat aktif H-{reminderDays} sebelum tenggat · atur di tab Todo
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
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
