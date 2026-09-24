import { useState } from "react";
import { Account, AccountType, Transaction } from "@/app/types";

interface AccountModalProps {
  accounts: Account[];
  transactions: Transaction[];
  onAdd: (input: Omit<Account, "id">) => void;
  onUpdate: (id: string, input: Omit<Account, "id">) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const EMPTY_FORM = {
  name: "",
  type: "bank" as AccountType,
  color: "#2A9D8F",
  icon: "🏦",
};

export function AccountModal({
  accounts,
  transactions,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: AccountModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    const payload = {
      name,
      type: form.type,
      color: form.color,
      icon: form.icon.trim() || "🏦",
    };
    if (editingId) {
      onUpdate(editingId, payload);
    } else {
      onAdd(payload);
    }
    resetForm();
  };

  const startEdit = (a: Account) => {
    setConfirmId(null);
    setEditingId(a.id);
    setForm({
      name: a.name,
      type: a.type,
      color: a.color,
      icon: a.icon || "🏦",
    });
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-dark/45 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="bg-cream rounded-2xl p-6 w-full max-w-[440px] mx-5 max-h-[85vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-[slideUp_0.3s_ease-out]">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-semibold font-display">Kelola Bank / E-Wallet</div>
          <button
            onClick={onClose}
            className="border-none bg-border rounded-lg w-8 h-8 cursor-pointer text-lg text-[#5A5550] leading-none hover:bg-border-dark transition-colors"
          >
            ×
          </button>
        </div>
        <div className="text-[11px] text-muted-lighter mb-4 leading-relaxed">
          Transaksi dari akun yang dihapus tetap tersimpan tapi tampil sebagai
          &ldquo;Tanpa Akun&rdquo;.
        </div>

        {/* Form tambah / edit */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border rounded-xl p-3.5 mb-4 flex flex-col gap-3 shrink-0"
        >
          <div className="grid grid-cols-[1fr_auto] gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
                NAMA *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="BCA, Dana, GoPay…"
                className="w-full py-2.5 px-3 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted-lighter"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
                IKON
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                maxLength={4}
                className="w-[58px] py-2.5 px-2 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark text-center outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
                TIPE
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as AccountType })}
                className="w-full py-2.5 px-3 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark bg-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
              >
                <option value="bank">Bank</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
                WARNA
              </label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-[58px] h-[42px] py-1 px-1 border-[1.5px] border-border-dark rounded-[10px] bg-white cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="submit"
              className="flex-1 py-2.5 border-none rounded-[10px] bg-gradient-accent text-white text-sm font-semibold cursor-pointer shadow-accent transition-all hover:shadow-accent-lg"
            >
              {editingId ? "Simpan Perubahan" : "Tambah Akun"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="py-2.5 px-4 border-[1.5px] border-border-dark rounded-[10px] bg-white text-[#6B6560] text-sm font-semibold cursor-pointer transition-all hover:bg-border/30"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Daftar akun */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
          {accounts.map((a) => {
            const usage = transactions.filter((t) => t.account_id === a.id).length;
            const confirming = confirmId === a.id;

            return (
              <div
                key={a.id}
                className="bg-white border border-border rounded-xl py-2.5 px-3.5 flex items-center gap-3"
              >
                <div
                  className="w-[34px] h-[34px] rounded-[9px] text-base flex items-center justify-center shrink-0"
                  style={{ background: a.color + "20" }}
                >
                  {a.icon || "🏦"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium text-dark truncate">{a.name}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-border text-muted-light shrink-0">
                      {a.type === "ewallet" ? "E-Wallet" : "Bank"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-light">{usage} transaksi</div>
                </div>

                {confirming ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onDelete(a.id);
                        setConfirmId(null);
                        if (editingId === a.id) resetForm();
                      }}
                      className="border-none bg-accent text-white rounded-lg py-1.5 px-2.5 text-[11px] font-semibold cursor-pointer hover:bg-accent/90 transition-colors"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="border border-border bg-white text-muted rounded-lg py-1.5 px-2.5 text-[11px] font-semibold cursor-pointer hover:bg-border/50 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => startEdit(a)}
                      aria-label={`Edit akun ${a.name}`}
                      className="border-none bg-transparent text-muted-lighter text-sm cursor-pointer px-1.5 hover:text-accent transition-colors"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => setConfirmId(a.id)}
                      aria-label={`Hapus akun ${a.name}`}
                      className="border-none bg-transparent text-muted-lighter text-sm cursor-pointer px-1.5 hover:text-accent transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {accounts.length === 0 && (
            <div className="text-xs text-muted text-center py-8">Belum ada akun</div>
          )}
        </div>
      </div>
    </div>
  );
}
