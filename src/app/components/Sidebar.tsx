import { fmt } from "@/app/utils/format";
import { NAV_ITEMS } from "@/app/data/initial-data";

interface SidebarProps {
  activeTab: string;
  sidebarOpen: boolean;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
  onAddNew?: () => void;
}

export function Sidebar({
  activeTab,
  sidebarOpen,
  balance,
  totalIncome,
  totalExpense,
  onTabChange,
  onToggleSidebar,
  onAddNew,
}: SidebarProps) {
  return (
    <aside
      className={`min-h-screen bg-dark text-cream py-6 px-4 flex flex-col sticky top-0 h-screen shrink-0 transition-all duration-300 ease-in-out relative z-20 ${!sidebarOpen ? "cursor-pointer" : ""}`}
      style={{ width: sidebarOpen ? 260 : 72 }}
      onClick={!sidebarOpen ? onToggleSidebar : undefined}
    >
      {/* Absolute Toggle Button */}
      <button
        onClick={onToggleSidebar}
        className="absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-black border border-white/[0.5] text-muted-light hover:text-cream cursor-pointer flex items-center justify-center transition-all duration-200 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
      >
        <span
          className="text-sm inline-block transition-transform duration-300"
          style={{ transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)" }}
        >
          ‹
        </span>
      </button>

      {/* Brand */}
      <div className="flex items-center gap-3 mb-8 px-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center text-xl shrink-0">
          💰
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden whitespace-nowrap">
            <div className="text-[17px] font-semibold font-['Playfair_Display',serif] leading-tight">
              FinTrack
            </div>
            <div className="text-[11px] text-muted-light tracking-wide">
              Mei 2025
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1 mb-6">
        {sidebarOpen && (
          <div className="text-[10px] font-semibold text-muted tracking-[0.12em] uppercase px-3 mb-1.5">
            Menu
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 rounded-[10px] text-[13px] font-medium cursor-pointer transition-all duration-200 border ${
                active
                  ? "bg-accent/15 text-accent-light border-accent-light/25"
                  : "bg-transparent text-muted-lighter border-transparent hover:bg-white/[0.04]"
              }`}
              style={{
                padding: sidebarOpen ? "11px 14px" : "11px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
              }}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Mini Stats */}
      {sidebarOpen && (
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-[14px] p-3.5 mb-4">
          <div className="text-[10px] font-semibold text-muted tracking-[0.12em] uppercase mb-2.5">
            Saldo
          </div>
          <div
            className={`text-xl font-semibold mb-3 leading-tight ${balance >= 0 ? "text-green" : "text-accent"}`}
          >
            {fmt(balance)}
          </div>
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] text-muted-light">Masuk</span>
            <span className="text-[11px] text-green font-semibold">
              {fmt(totalIncome)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-muted-light">Keluar</span>
            <span className="text-[11px] text-accent font-semibold">
              {fmt(totalExpense)}
            </span>
          </div>
        </div>
      )}

      {/* Add Button */}
      
    </aside>
  );
}
