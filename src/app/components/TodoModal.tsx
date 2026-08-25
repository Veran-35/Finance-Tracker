import { TodoFormData, TodoPriority, PRIORITY_CONFIG } from '@/app/types/todo';

interface TodoModalProps {
  form: TodoFormData;
  onFormChange: (form: TodoFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
  isEditing: boolean;
}

export function TodoModal({ form, onFormChange, onSubmit, onClose, isEditing }: TodoModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit();
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
            {isEditing ? '✏️ Edit Todo' : '✨ Todo Baru'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border-none bg-muted/[0.08] cursor-pointer text-base text-muted flex items-center justify-center hover:bg-muted/15 transition-colors">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-4.5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">JUDUL *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => onFormChange({ ...form, title: e.target.value })}
                placeholder="Contoh: Review laporan keuangan"
                autoFocus
                className="w-full py-3 px-3.5 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted-lighter"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">DESKRIPSI</label>
              <textarea
                value={form.description}
                onChange={(e) => onFormChange({ ...form, description: e.target.value })}
                placeholder="Tambahkan detail (opsional)"
                rows={3}
                className="w-full py-3 px-3.5 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark outline-none resize-y transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted-lighter"
              />
            </div>

            {/* Priority & Due Date Row */}
            <div className="flex gap-3.5">
              {/* Priority */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">PRIORITAS</label>
                <div className="flex gap-1.5">
                  {(Object.keys(PRIORITY_CONFIG) as TodoPriority[]).map((p) => {
                    const config = PRIORITY_CONFIG[p];
                    const isActive = form.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onFormChange({ ...form, priority: p })}
                        className="flex-1 py-2 px-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-0.5 border-[1.5px]"
                        style={{
                          borderColor: isActive ? config.color : '#E5E0D8',
                          background: isActive ? config.bg : '#fff',
                          color: isActive ? config.color : '#8B8680',
                        }}
                      >
                        {config.icon} {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Date */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">TENGGAT</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => onFormChange({ ...form, due_date: e.target.value })}
                  className="w-full py-2 px-3 border-[1.5px] border-border-dark rounded-lg text-[13px] text-dark outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
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
              {isEditing ? 'Simpan Perubahan' : 'Tambah Todo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
