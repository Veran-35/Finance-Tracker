import { useState } from "react";
import { CategoryModal } from "@/app/components/CategoryModal";
import { AccountModal } from "@/app/components/AccountModal";
import { ProfileForm } from "@/app/components/ProfileForm";
import { UseTransactionsReturn } from "@/app/hooks/useTransactions";
import { useProfile } from "@/app/hooks/useProfile";

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
  const { profile, loading, saving, error, saveProfile, uploadAvatar } = useProfile();

  return (
    <div className="max-w-[640px]">
      <div className="text-[13px] font-semibold text-muted mb-2.5 uppercase tracking-[0.06em]">
        Profil Saya
      </div>
      <div className="mb-6">
        {loading ? (
          <div className="text-xs text-muted-light bg-white border border-border rounded-xl p-4">
            Memuat profil…
          </div>
        ) : error ? (
          <div className="text-xs text-accent bg-accent/[0.06] border border-accent/25 rounded-xl p-4 leading-relaxed">
            Gagal memuat profil: {error}
            <br />
            Jika menyebut kolom <code>birth_date</code> atau <code>gender</code>, jalankan
            dulu <code>migration_profile.sql</code> di Supabase SQL Editor lalu muat ulang
            halaman ini.
          </div>
        ) : profile ? (
          <ProfileForm
            initial={profile}
            saving={saving}
            onSave={saveProfile}
            onUpload={uploadAvatar}
          />
        ) : (
          <div className="text-xs text-muted-light bg-white border border-border rounded-xl p-4">
            Profil tidak ditemukan.
          </div>
        )}
      </div>

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
