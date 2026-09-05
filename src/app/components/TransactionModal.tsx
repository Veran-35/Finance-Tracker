import { useState } from "react";
import { TransactionFormData, Category } from "@/app/types";
import { fmt } from "@/app/utils/format";

interface TransactionModalProps {
  form: TransactionFormData;
  categories: Category[];
  isEditing?: boolean;
  onFormChange: React.Dispatch<React.SetStateAction<TransactionFormData>>;
  onSubmit: (rows: TransactionFormData[]) => void;
  onClose: () => void;
}

export function TransactionModal({
  form,
  categories,
  isEditing = false,
  onFormChange,
  onSubmit,
  onClose,
}: TransactionModalProps) {
  const [drafts, setDrafts] = useState<TransactionFormData[]>([]);

  const isCurrentValid = form.amount !== "" && form.description.trim() !== "";
  const rowCount = isEditing ? 1 : drafts.length + (isCurrentValid ? 1 : 0);
  const submitLabel = isEditing
    ? "Simpan Perubahan"
    : rowCount > 1
      ? `Simpan ${rowCount} Transaksi`
      : "Simpan Transaksi";

  const otherCategory = categories.find((c) => c.name === "Lainnya");
  const showCustomInput = !!otherCategory && form.category_id === otherCategory.id;

  function categoryLabel(categoryId: string, custom: string) {
    const base = categories.find((c) => c.id === categoryId)?.name || "Lainnya";
    const name = custom.trim();
    return name && base === "Lainnya" ? `Lainnya (${name})` : base;
  }

  function addDraft() {
    if (!isCurrentValid) return;
    setDrafts((prev) => [...prev, { ...form }]);
    onFormChange((f) => ({ ...f, amount: "", description: "" }));
  }

  function removeDraft(index: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (isEditing) {
      onSubmit([form]);
      return;
    }
    const rows = isCurrentValid ? [...drafts, form] : drafts;
    if (rows.length === 0) return;
    onSubmit(rows);
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-dark/45 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="bg-cream rounded-2xl p-6 w-full max-w-[480px] mx-5 max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="text-lg font-semibold font-display">
            {isEditing ? "✏️ Edit Transaksi" : "Tambah Transaksi"}
          </div>
          <button
            onClick={onClose}
            className="border-none bg-border rounded-lg w-8 h-8 cursor-pointer text-lg text-[#5A5550] leading-none hover:bg-border-dark transition-colors"
          >
            ×
          </button>
        </div>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-3.5">
          {(["expense", "income"] as const).map((tp) => {
            const isActive = form.type === tp;
            return (
              <button
                key={tp}
                onClick={() => onFormChange((f) => ({ ...f, type: tp }))}
                className={`p-3 rounded-[10px] font-semibold text-sm cursor-pointer transition-all duration-150 border-[1.5px] ${
                  isActive
                    ? tp === "income"
                      ? "border-teal bg-[#E8F7F5] text-teal"
                      : "border-accent bg-[#FDEEE9] text-accent"
                    : "border-border bg-white text-muted"
                }`}
              >
                {tp === "income" ? "💰 Pemasukan" : "💸 Pengeluaran"}
              </button>
            );
          })}
        </div>

        {/* Form Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-2.5"
        >
          <input
            type="number"
            placeholder="Jumlah (Rp)"
            min="1"
            value={form.amount}
            onChange={(e) => onFormChange((f) => ({ ...f, amount: e.target.value }))}
            className="border border-border rounded-[10px] py-3.5 px-4 text-base text-dark bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
          <input
            type="text"
            placeholder="Keterangan transaksi"
            value={form.description}
            onChange={(e) =>
              onFormChange((f) => ({ ...f, description: e.target.value }))
            }
            className="border border-border rounded-[10px] py-3.5 px-4 text-sm text-dark bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.category_id}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, category_id: e.target.value }))
              }
              className="border border-border rounded-[10px] py-3.5 px-4 text-sm text-dark bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => onFormChange((f) => ({ ...f, date: e.target.value }))}
              className="border border-border rounded-[10px] py-3.5 px-4 text-sm text-dark bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
            />
          </div>

          {showCustomInput && (
            <input
              type="text"
              placeholder="Nama kategori custom, mis. Hewan Peliharaan"
              maxLength={40}
              value={form.custom_category}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, custom_category: e.target.value }))
              }
              className="border border-border rounded-[10px] py-3.5 px-4 text-sm text-dark bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
            />
          )}

          {/* Daftar transaksi yang akan disimpan */}
          {!isEditing && drafts.length > 0 && (
            <div className="mt-1 bg-white border border-border rounded-[10px] max-h-[180px] overflow-y-auto">
              {drafts.map((d, i) => {
                return (
                  <div
                    key={`${d.description}-${d.date}-${d.amount}-${i}`}
                    className="flex items-center gap-2.5 py-2.5 px-3.5 border-b border-border last:border-b-0"
                  >
                    <span className="text-base shrink-0">
                      {d.type === "income" ? "💰" : "💸"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-dark truncate">
                        {d.description}
                      </div>
                      <div className="text-[11px] text-muted-light">
                        {categoryLabel(d.category_id, d.custom_category)} · {d.date}
                      </div>
                    </div>
                    <div
                      className={`text-[13px] font-semibold shrink-0 ${
                        d.type === "income" ? "text-teal" : "text-accent"
                      }`}
                    >
                      {d.type === "income" ? "+" : "-"}
                      {fmt(Number(d.amount) || 0)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDraft(i)}
                      aria-label={`Hapus ${d.description} dari daftar`}
                      className="border-none bg-transparent text-muted-lighter text-sm cursor-pointer px-1 shrink-0 hover:text-accent transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-2 mt-1">
            {!isEditing && (
              <button
                type="button"
                onClick={addDraft}
                disabled={!isCurrentValid}
                className="flex-1 py-3.5 text-[14px] font-semibold cursor-pointer rounded-xl transition-colors border-[1.5px] border-dark bg-white text-dark hover:bg-dark/5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                + Tambah ke Daftar
              </button>
            )}
            <button
              type="submit"
              disabled={rowCount === 0}
              className={`flex-1 py-3.5 text-[15px] font-semibold cursor-pointer border-none rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                isEditing
                  ? "bg-teal text-white hover:bg-teal/90"
                  : "bg-dark text-cream hover:bg-dark/90"
              }`}
            >
              {submitLabel}
            </button>
          </div>

          {!isEditing && (
            <div className="text-[11px] text-muted-lighter text-center">
              Klik &ldquo;+ Tambah ke Daftar&rdquo; untuk menyimpan beberapa transaksi sekaligus.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
