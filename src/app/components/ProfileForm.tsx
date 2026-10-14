import { useState } from "react";
import { AVATAR_PRESETS } from "@/app/data/avatar-presets";
import type { ProfileInfo } from "@/app/hooks/useProfile";

interface ProfileFormProps {
  initial: ProfileInfo;
  saving: boolean;
  onSave: (input: ProfileInfo) => void;
}

const inputClass =
  "w-full py-2.5 px-3 border-[1.5px] border-border-dark rounded-[10px] text-sm text-dark bg-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10";

export function ProfileForm({ initial, saving, onSave }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileInfo>(initial);
  const [error, setError] = useState<string | null>(null);

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

      <div>
        <label className="block text-[10px] font-semibold text-[#6B6560] mb-1 tracking-[0.04em]">
          AVATAR
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {AVATAR_PRESETS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setForm({ ...form, avatar: em })}
              aria-label={`Pilih avatar ${em}`}
              className={`w-9 h-9 rounded-[10px] cursor-pointer text-base flex items-center justify-center transition-all border-[1.5px] ${
                form.avatar === em
                  ? "border-accent bg-accent/10"
                  : "border-border bg-white hover:bg-border/40"
              }`}
            >
              {em}
            </button>
          ))}
        </div>
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
        disabled={saving}
        className="self-start py-2.5 px-5 border-none rounded-[10px] bg-gradient-accent text-white text-sm font-semibold cursor-pointer shadow-accent transition-all hover:shadow-accent-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? "Menyimpan…" : "Simpan Profil"}
      </button>
    </form>
  );
}
