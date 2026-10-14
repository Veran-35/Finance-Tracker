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

export function useProfile() {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    } else if (data) {
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

  return { profile, loading, saving, saveProfile };
}
