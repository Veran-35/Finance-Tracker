import { useState } from "react";
import { CategoryModal } from "@/app/components/CategoryModal";
import { AccountModal } from "@/app/components/AccountModal";
import { UseTransactionsReturn } from "@/app/hooks/useTransactions";

interface SettingsTabProps {
  txn: UseTransactionsReturn;
}

type Panel = "categories" | "accounts";

const ENTRIES: { key: Panel; icon: string; title: string; desc: string }[] = [
  {
    key: "categories",
    icon: "🏷️",
    title: "Kelola Kategori",
    desc: "Tambah atau hapus kategori yang dipakai transaksi dan budget.",
  },
  {
    key: "accounts",
    icon: "🏦",
    title: "Kelola Bank / E-Wallet",
    desc: "Tambah, edit, atau hapus rekening tempat transaksi tercatat.",
  },
];

export function SettingsTab({ txn }: SettingsTabProps) {
  const [open, setOpen] = useState<Panel | null>(null);

  return (
    <div className="max-w-[640px]">
      <div className="text-[13px] font-semibold text-muted mb-2.5 uppercase tracking-[0.06em]">
        Data master
      </div>
      <div className="flex flex-col gap-2">
        {ENTRIES.map((e) => (
          <div
            key={e.key}
            className="bg-white border border-border rounded-xl p-4 flex items-center gap-3.5"
          >
            <div className="w-[42px] h-[42px] rounded-[11px] text-xl flex items-center justify-center shrink-0 bg-cream">
              {e.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-dark">{e.title}</div>
              <div className="text-xs text-muted-light mt-0.5">{e.desc}</div>
            </div>
            <button
              onClick={() => setOpen(e.key)}
              className="shrink-0 rounded-[10px] py-2 px-4 text-[13px] font-medium cursor-pointer transition-all duration-150 border border-border bg-white text-[#5A5550] hover:bg-border/50"
            >
              Buka
            </button>
          </div>
        ))}
      </div>

      {open === "categories" && (
        <CategoryModal
          categories={txn.categories}
          transactions={txn.transactions}
          onAdd={txn.addCategory}
          onDelete={txn.deleteCategory}
          onClose={() => setOpen(null)}
        />
      )}

      {open === "accounts" && (
        <AccountModal
          accounts={txn.accounts}
          transactions={txn.transactions}
          onAdd={txn.addAccount}
          onUpdate={txn.updateAccount}
          onDelete={txn.deleteAccount}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
