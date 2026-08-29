import { SubjectFormData, SUBJECT_COLORS } from '@/app/types/study';

interface SubjectModalProps {
  form: SubjectFormData;
  onFormChange: (form: SubjectFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
  isEditing: boolean;
}

export function SubjectModal({ form, onFormChange, onSubmit, onClose, isEditing }: SubjectModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
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
            {isEditing ? '✏️ Edit Mata Pelajaran' : '📚 Mata Pelajaran Baru'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border-none bg-muted/[0.08] cursor-pointer text-base text-muted flex items-center justify-center hover:bg-muted/15 transition-colors">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-4.5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">NAMA *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                placeholder="Contoh: Matematika"
                autoFocus
                className="w-full py-3 px-3.5 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted-lighter"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1.5 tracking-[0.04em]">WARNA</label>
              <div className="flex flex-wrap gap-2.5">
                {SUBJECT_COLORS.map((color) => {
                  const isActive = form.color === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onFormChange({ ...form, color })}
                      aria-label={`Pilih warna ${color}`}
                      className="w-9 h-9 rounded-full border-none cursor-pointer transition-all duration-200 flex items-center justify-center text-white text-sm"
                      style={{
                        background: color,
                        boxShadow: isActive ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : 'none',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      {isActive ? '✓' : ''}
                    </button>
                  );
                })}
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
              {isEditing ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
