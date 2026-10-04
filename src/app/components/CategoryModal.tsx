import { useState } from "react";
import { Category, Transaction } from "@/app/types";

interface CategoryModalProps {
  categories: Category[];
  transactions: Transaction[];
  onAdd: (input: Omit<Category, "id">) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const EMPTY_FORM = {
  name: "",
  color: "#6B7280",
  icon: "🏷️",
};

export function CategoryModal({
  categories,
  transactions,
  onAdd,
  onDelete,
  onClose,
}: CategoryModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    onAdd({ name, color: form.color, icon: form.icon.trim() || "🏷️" });
    setForm(EMPTY_FORM);
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-dark/45 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="bg-cream rounded-2xl p-6 w-full max-w-[440px] mx-5 max-h-[85vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-[slideUp_0.3s_ease-out]">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-semibold font-display">Kelola Kategori</div>
          <button
            onClick={onClose}
            className="border-none bg-border rounded-lg w-8 h-8 cursor-pointer text-lg text-[#5A5550] leading-none hover:bg-border-dark transition-colors"
          >
            ×
          </button>
        </div>
        <div className="text-[11px] text-muted-lighter mb-4 leading-relaxed">
          Transaksi dari kategori yang dihapus tetap tersimpan tapi tampil sebagai
          &ldquo;Lainnya&rdquo;, dan budget kategori itu ikut terhapus.
        </div>

        {/* Form tambah kategori */}
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
                placeholder="mis. Pendidikan, Hewan Peliharaan…"
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
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 border-none rounded-[10px] bg-gradient-accent text-white text-sm font-semibold cursor-pointer shadow-accent transition-all hover:shadow-accent-lg"
              >
                Tambah Kategori
              </button>
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
        </form>

        {/* Daftar kategori */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
          {categories.map((c) => {
            const isBase = c.name === "Lainnya";
            const usage = transactions.filter((t) => t.category_id === c.id).length;
            const confirming = confirmId === c.id;

            return (
              <div
                key={c.id}
                className="bg-white border border-border rounded-xl py-2.5 px-3.5 flex items-center gap-3"
              >
                <div
                  className="w-[34px] h-[34px] rounded-[9px] text-base flex items-center justify-center shrink-0"
                  style={{ background: c.color + "20" }}
                >
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-dark truncate">{c.name}</div>
                  <div className="text-[11px] text-muted-light">
                    {usage} transaksi{isBase ? " · bawaan, tidak bisa dihapus" : ""}
                  </div>
                </div>

                {isBase ? null : confirming ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onDelete(c.id);
                        setConfirmId(null);
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
                  <button
                    onClick={() => setConfirmId(c.id)}
                    aria-label={`Hapus kategori ${c.name}`}
                    className="border-none bg-transparent text-muted-lighter text-sm cursor-pointer px-1.5 shrink-0 hover:text-accent transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}

          {categories.length === 0 && (
            <div className="text-xs text-muted text-center py-8">Belum ada kategori</div>
          )}
        </div>
      </div>
    </div>
  );
}
