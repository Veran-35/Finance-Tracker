import { TransactionFormData, Category } from "@/app/types";

interface TransactionModalProps {
  form: TransactionFormData;
  categories: Category[];
  isEditing?: boolean;
  onFormChange: React.Dispatch<React.SetStateAction<TransactionFormData>>;
  onSubmit: () => void;
  onClose: () => void;
}

export function TransactionModal({ form, categories, isEditing = false, onFormChange, onSubmit, onClose }: TransactionModalProps) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-dark/45 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="bg-cream rounded-2xl p-6 w-full max-w-[480px] mx-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="text-lg font-semibold font-['Playfair_Display',serif]">
            {isEditing ? '✏️ Edit Transaksi' : 'Tambah Transaksi'}
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
        <div className="flex flex-col gap-2.5">
          <input
            type="number"
            placeholder="Jumlah (Rp)"
            value={form.amount}
            onChange={(e) => onFormChange((f) => ({ ...f, amount: e.target.value }))}
            className="border border-border rounded-[10px] py-3.5 px-4 text-base text-dark bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
          <input
            type="text"
            placeholder="Keterangan transaksi"
            value={form.description}
            onChange={(e) => onFormChange((f) => ({ ...f, description: e.target.value }))}
            className="border border-border rounded-[10px] py-3.5 px-4 text-sm text-dark bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.category_id}
              onChange={(e) => onFormChange((f) => ({ ...f, category_id: e.target.value }))}
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
              value={form.date}
              onChange={(e) => onFormChange((f) => ({ ...f, date: e.target.value }))}
              className="border border-border rounded-[10px] py-3.5 px-4 text-sm text-dark bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
            />
          </div>
          <button
            onClick={onSubmit}
            className={`mt-1 py-3.5 text-[15px] font-semibold cursor-pointer border-none rounded-xl transition-colors ${
              isEditing
                ? "bg-teal text-white hover:bg-teal/90"
                : "bg-dark text-cream hover:bg-dark/90"
            }`}
          >
            {isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>
        </div>
      </div>
    </div>
  );
}
