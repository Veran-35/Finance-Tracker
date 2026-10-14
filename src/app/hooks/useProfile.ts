'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/app/components/Toast';

export interface ProfileInfo {
  username: string;
  avatar: string;
  birthDate: string;
  gender: string;
}

// SVG sengaja tidak diizinkan: berkas SVG dapat memuat skrip (risiko XSS).
const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export function useProfile() {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, birth_date, gender')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Gagal memuat profil:', error.message);
      setError(error.message);
    } else if (data) {
      setError(null);
      setProfile({
        username: data.username || '',
        avatar: data.avatar_url || '',
        birthDate: data.birth_date || '',
        gender: data.gender || '',
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // Fetch saat mount; setState terjadi setelah await, bukan cascade derived-state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  async function saveProfile(input: ProfileInfo): Promise<boolean> {
    if (!user) return false;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        username: input.username,
        avatar_url: input.avatar,
        birth_date: input.birthDate || null,
        gender: input.gender || null,
      })
      .eq('id', user.id);

    if (error) {
      setSaving(false);
      if (error.code === '23505') {
        toast.error('Username sudah dipakai');
      } else {
        console.error('Gagal menyimpan profil:', error.message);
        toast.error('Gagal menyimpan profil');
      }
      return false;
    }

    // Sinkronkan metadata auth supaya Header langsung menampilkan nama/avatar baru.
    await supabase.auth.updateUser({
      data: { username: input.username, avatar: input.avatar },
    });

    setProfile(input);
    setSaving(false);
    toast.success('Profil disimpan');
    return true;
  }

  async function uploadAvatar(file: File): Promise<string | null> {
    if (!user) return null;
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      toast.error('Format avatar harus JPG, PNG, WEBP, atau GIF');
      return null;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error('Ukuran avatar maksimal 2 MB');
      return null;
    }

    const path = `${user.id}/avatar`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      console.error('Gagal mengunggah avatar:', error.message);
      toast.error('Gagal mengunggah avatar');
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  }

  return { profile, loading, saving, error, saveProfile, uploadAvatar };
}
