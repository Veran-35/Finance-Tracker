import { BudgetFormData, Category } from '@/app/types';

interface BudgetModalProps {
  form: BudgetFormData;
  categories: Category[];
  onFormChange: (form: BudgetFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
  isEditing: boolean;
}

export function BudgetModal({ form, categories, onFormChange, onSubmit, onClose, isEditing }: BudgetModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id || !form.limit) return;
    onSubmit();
  };

  const selectedCat = categories.find(c => c.id === form.category_id);

  const formatPreview = (val: string) => {
    if (!val) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parseInt(val));
  };

  return (
    <div
      className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-6 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-[480px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] animate-[slideUp_0.3s_ease-out] overflow-hidden"
      >
        {/* Header */}
        <div className="py-5 px-6 border-b border-border flex items-center justify-between">
          <h3 className="text-[17px] font-semibold text-dark m-0">
            {isEditing ? '✏️ Edit Budget' : '🎯 Budget Baru'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border-none bg-muted/[0.08] cursor-pointer text-base text-muted flex items-center justify-center hover:bg-muted/15 transition-colors">
            ✕
          </button>
        </div>

        {/* Preview Card */}
        <div
          className="mx-6 mt-5 p-4 rounded-[14px] flex items-center gap-3 border-[1.5px]"
          style={{ background: `${selectedCat?.color || '#aaa'}08`, borderColor: `${selectedCat?.color || '#aaa'}30` }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0"
            style={{ background: `${selectedCat?.color || '#aaa'}20` }}
          >
            {selectedCat?.icon || '📦'}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-dark">{selectedCat?.name || 'Pilih Kategori'}</div>
            <div className="text-xs text-muted-light">Batas: {formatPreview(form.limit)} / bulan</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-4.5">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">KATEGORI *</label>
              <select
                value={form.category_id}
                onChange={(e) => onFormChange({ ...form, category_id: e.target.value })}
                className="w-full py-3 px-3.5 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark bg-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Limit */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">BATAS BUDGET (Rp) *</label>
              <input
                type="number"
                value={form.limit}
                onChange={(e) => onFormChange({ ...form, limit: e.target.value })}
                placeholder="500000"
                min="0"
                className="w-full py-3 px-3.5 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted-lighter"
              />
            </div>

            {/* Period */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">PERIODE</label>
              <select
                value={form.period}
                onChange={(e) => onFormChange({ ...form, period: e.target.value })}
                className="w-full py-3 px-3.5 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark bg-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
              >
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="yearly">Tahunan</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">MULAI</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => onFormChange({ ...form, start_date: e.target.value })}
                  className="w-full py-3 px-3.5 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">SELESAI</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => onFormChange({ ...form, end_date: e.target.value })}
                  className="w-full py-3 px-3.5 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-[1.5px] border-border-dark rounded-[10px] bg-white text-[#6B6560] text-sm font-semibold cursor-pointer transition-all hover:bg-border/30"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 border-none rounded-[10px] bg-gradient-accent text-white text-sm font-semibold cursor-pointer shadow-accent transition-all hover:shadow-accent-lg"
            >
              {isEditing ? 'Simpan Perubahan' : 'Tambah Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
