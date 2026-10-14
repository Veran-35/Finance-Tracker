import { useRef, useState } from "react";
import Image from "next/image";
import type { ProfileInfo } from "@/app/hooks/useProfile";

interface ProfileFormProps {
  initial: ProfileInfo;
  saving: boolean;
  onSave: (input: ProfileInfo) => void;
  onUpload: (file: File) => Promise<string | null>;
}

const inputClass =
  "w-full py-2.5 px-3 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark bg-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10";

export function ProfileForm({ initial, saving, onSave, onUpload }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileInfo>(initial);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const url = await onUpload(file);
    if (url) setForm((prev) => ({ ...prev, avatar: url }));
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.username.trim();
    if (name.length < 3) {
      setError("Username minimal 3 karakter");
      return;
    }
    setError(null);
    onSave({ ...form, username: name });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-xl p-4 flex flex-col gap-3.5"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-full bg-cream border border-border overflow-hidden flex items-center justify-center shrink-0">
          {form.avatar ? (
            <Image
              src={form.avatar}
              alt="Avatar profil"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-semibold text-muted-lighter uppercase">Foto</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
            AVATAR (GAMBAR, MAKS 2 MB)
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="py-2 px-4 border-[1.5px] border-border-dark rounded-[10px] bg-white text-[#6B6560] text-[13px] font-semibold cursor-pointer transition-all hover:bg-border/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? "Mengunggah…" : form.avatar ? "Ganti Foto" : "Pilih Foto"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
          USERNAME *
        </label>
        <input
          type="text"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          maxLength={24}
          placeholder="Nama tampilan"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
            TANGGAL LAHIR
          </label>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
            JENIS KELAMIN
          </label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Pilih…</option>
            <option value="laki-laki">Laki-laki</option>
            <option value="perempuan">Perempuan</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="text-[12px] text-accent font-medium">{error}</div>
      )}

      <button
        type="submit"
        disabled={saving || uploading}
        className="self-start py-2.5 px-5 border-none rounded-[10px] bg-gradient-accent text-white text-sm font-semibold cursor-pointer shadow-accent transition-all hover:shadow-accent-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? "Menyimpan…" : "Simpan Profil"}
      </button>
    </form>
  );
}
