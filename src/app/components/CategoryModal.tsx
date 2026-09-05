import { useState } from "react";
import { Category, Transaction } from "@/app/types";

interface CategoryModalProps {
  categories: Category[];
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function CategoryModal({
  categories,
  transactions,
  onDelete,
  onClose,
}: CategoryModalProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
