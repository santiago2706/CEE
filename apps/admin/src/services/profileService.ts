import type { ApiResponse, UserProfile } from '@cee/types';
import { mockAdminUser } from '@/mocks/auth';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// In-memory mock profile (mutable for the session)
let mockProfile: UserProfile = {
  id:        mockAdminUser.id,
  name:      mockAdminUser.name,
  email:     mockAdminUser.email,
  role:      mockAdminUser.role as 'admin' | 'student',
  avatarUrl: mockAdminUser.avatarUrl,
};

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  avatar_url: string | null;
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id:        row.id,
    name:      row.name,
    email:     row.email,
    role:      row.role,
    avatarUrl: row.avatar_url,
  };
}

export const profileService = {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    if (USE_MOCKS) {
      return delay({ data: { ...mockProfile } });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No hay sesión activa.');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error || !data) throw new Error('No se pudo cargar el perfil.');
    return { data: rowToProfile(data as ProfileRow) };
  },

  async updateProfile(input: { name: string }): Promise<ApiResponse<UserProfile>> {
    if (USE_MOCKS) {
      mockProfile = { ...mockProfile, name: input.name };
      return delay({ data: { ...mockProfile } });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');

    const { data, error } = await supabase
      .from('profiles')
      .update({ name: input.name })
      .eq('id', user.id)
      .select('*')
      .single();
    if (error || !data) throw new Error('No se pudo actualizar el perfil.');
    return { data: rowToProfile(data as ProfileRow) };
  },

  async updateAvatar(file: File): Promise<ApiResponse<UserProfile>> {
    if (USE_MOCKS) {
      // Return a temporary object URL for preview in mock mode
      const avatarUrl = URL.createObjectURL(file);
      mockProfile = { ...mockProfile, avatarUrl };
      return delay({ data: { ...mockProfile } });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');

    // Upload to 'avatars' bucket (upsert to replace existing)
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { contentType: file.type, upsert: true });
    if (uploadError) throw new Error('No se pudo subir la imagen.');

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = urlData.publicUrl;

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)
      .select('*')
      .single();
    if (error || !data) throw new Error('No se pudo actualizar el avatar.');
    return { data: rowToProfile(data as ProfileRow) };
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    if (USE_MOCKS) {
      if (!currentPassword) throw new Error('Ingresa tu contraseña actual.');
      if (newPassword.length < 8) throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
      return delay({ data: undefined as void });
    }
    // Re-authenticate to verify current password
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('No hay sesión activa.');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email:    user.email,
      password: currentPassword,
    });
    if (signInError) throw new Error('La contraseña actual es incorrecta.');

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error('No se pudo cambiar la contraseña. Intenta nuevamente.');
    return { data: undefined as void };
  },
};
