import type { ApiResponse, Setting } from '@cee/types';
import { mockSettings } from '@/mocks/settings.mock';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// In-memory cache for mock mode (mutations persist for the session)
let settingsCache: Setting[] = [...mockSettings];

interface SettingRow {
  key: string;
  value: string;
  description?: string | null;
  updated_at?: string | null;
}

function rowToSetting(row: SettingRow): Setting {
  return {
    key:         row.key,
    value:       row.value,
    description: row.description ?? undefined,
    updatedAt:   row.updated_at ?? undefined,
  };
}

export const settingsService = {
  async getSettings(): Promise<ApiResponse<Setting[]>> {
    if (USE_MOCKS) {
      return delay({ data: [...settingsCache] });
    }
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key', { ascending: true });
    if (error) throw new Error('No se pudieron cargar la configuración.');
    return { data: (data ?? []).map((r) => rowToSetting(r as SettingRow)) };
  },

  async updateSetting(key: string, value: string): Promise<ApiResponse<Setting>> {
    if (USE_MOCKS) {
      const now = new Date().toISOString();
      const idx = settingsCache.findIndex((s) => s.key === key);
      if (idx !== -1) {
        settingsCache[idx] = { ...settingsCache[idx], value, updatedAt: now };
        return delay({ data: settingsCache[idx] });
      }
      const newSetting: Setting = { key, value, updatedAt: now };
      settingsCache = [...settingsCache, newSetting];
      return delay({ data: newSetting });
    }
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: now })
      .select('*')
      .single();
    if (error || !data) throw new Error(`No se pudo actualizar la configuración: ${key}`);
    return { data: rowToSetting(data as SettingRow) };
  },

  async getSettingValue(key: string): Promise<string> {
    if (USE_MOCKS) {
      return settingsCache.find((s) => s.key === key)?.value ?? '';
    }
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();
    return (data as { value: string } | null)?.value ?? '';
  },
};
