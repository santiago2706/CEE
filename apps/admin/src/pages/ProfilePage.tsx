import { type ChangeEvent, type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import type { Setting, UserProfile } from '@cee/types';
import { Camera, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { profileService } from '@/services/profileService';
import { settingsService } from '@/services/settingsService';
import { cn } from '@/lib/utils';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'profile',  label: 'Mi perfil' },
  { key: 'security', label: 'Seguridad' },
  { key: 'cee',      label: 'Configuración CEE' },
] as const;
type TabKey = typeof TABS[number]['key'];

// ─── Inline feedback ──────────────────────────────────────────────────────────

function Feedback({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) {
  if (!msg) return null;
  return (
    <p className={cn(
      'rounded-lg px-4 py-2.5 text-sm',
      msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600',
    )}>
      {msg.text}
    </p>
  );
}

// ─── Settings KEYS config ─────────────────────────────────────────────────────

const SETTINGS_CONFIG: { key: string; label: string; type?: 'number' }[] = [
  { key: 'cee_name',              label: 'Nombre del centro' },
  { key: 'cee_phone',             label: 'Teléfono' },
  { key: 'cee_whatsapp',          label: 'WhatsApp' },
  { key: 'secretary_email',       label: 'Correo de notificaciones' },
  { key: 'min_students_default',  label: 'Mínimo de alumnos por defecto',    type: 'number' },
  { key: 'alert_days_default',    label: 'Días de anticipación para alertas', type: 'number' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { success: toastSuccess } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  // ── Profile tab ──────────────────────────────────────────────────────────────

  const [profile,       setProfile]       = useState<UserProfile | null>(null);
  const [name,          setName]          = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileMsg,     setProfileMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await profileService.getProfile();
      setProfile(res.data);
      setName(res.data.name);
    } catch { /* silently use authStore fallback */ }
    finally { setProfileLoading(false); }
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 3 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'La imagen no debe superar 3 MB.' });
      return;
    }
    setAvatarUploading(true);
    setProfileMsg(null);
    try {
      const res = await profileService.updateAvatar(file);
      setProfile(res.data);
      if (user) setUser({ ...user, avatarUrl: res.data.avatarUrl ?? '' });
      setProfileMsg({ type: 'success', text: 'Foto actualizada correctamente.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo subir la foto.' });
    } finally {
      setAvatarUploading(false);
      if (avatarRef.current) avatarRef.current.value = '';
    }
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setProfileMsg({ type: 'error', text: 'El nombre no puede estar vacío.' }); return; }
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await profileService.updateProfile({ name: name.trim() });
      setProfile(res.data);
      if (user) setUser({ ...user, name: res.data.name });
      setProfileMsg({ type: 'success', text: 'Perfil actualizado correctamente.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo guardar.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Security tab ─────────────────────────────────────────────────────────────

  const [currentPwd,   setCurrentPwd]   = useState('');
  const [newPwd,       setNewPwd]       = useState('');
  const [confirmPwd,   setConfirmPwd]   = useState('');
  const [showPwds,     setShowPwds]     = useState({ current: false, newPwd: false, confirm: false });
  const [pwdSaving,    setPwdSaving]    = useState(false);
  const [pwdMsg,       setPwdMsg]       = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (!currentPwd) { setPwdMsg({ type: 'error', text: 'Ingresa tu contraseña actual.' }); return; }
    if (newPwd.length < 8) { setPwdMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' }); return; }
    if (newPwd !== confirmPwd) { setPwdMsg({ type: 'error', text: 'Las contraseñas no coinciden.' }); return; }
    setPwdSaving(true);
    try {
      await profileService.changePassword(currentPwd, newPwd);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setPwdMsg({ type: 'success', text: '¡Contraseña cambiada! Por seguridad, vuelve a iniciar sesión.' });
      toastSuccess('Contraseña actualizada', 'Cierra sesión y vuelve a ingresar con tu nueva contraseña.');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.' });
    } finally {
      setPwdSaving(false);
    }
  };

  const toggleShow = (field: keyof typeof showPwds) =>
    setShowPwds((p) => ({ ...p, [field]: !p[field] }));

  // ── CEE Settings tab ──────────────────────────────────────────────────────────

  const [settingsValues,  setSettingsValues]  = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving,  setSettingsSaving]  = useState(false);
  const [settingsMsg,     setSettingsMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = (profile?.role ?? user?.role) === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    setSettingsLoading(true);
    settingsService.getSettings()
      .then(({ data }) => {
        const map: Record<string, string> = {};
        data.forEach((s: Setting) => { map[s.key] = s.value; });
        setSettingsValues(map);
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, [isAdmin]);

  const handleSettingsSave = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg(null);
    try {
      await Promise.all(
        SETTINGS_CONFIG.map((cfg) =>
          settingsService.updateSetting(cfg.key, settingsValues[cfg.key] ?? ''),
        ),
      );
      setSettingsMsg({ type: 'success', text: 'Configuración guardada correctamente.' });
    } catch (err) {
      setSettingsMsg({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo guardar.' });
    } finally {
      setSettingsSaving(false);
    }
  };

  // ── Avatar display ────────────────────────────────────────────────────────────

  const displayProfile = profile ?? { name: user?.name ?? 'A', email: user?.email ?? '', avatarUrl: user?.avatarUrl };
  const initials = displayProfile.name
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const inputCls = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40';
  const pwdInputCls = 'flex-1 rounded-l-md border border-input bg-background px-3 text-sm h-10 focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40 focus:ring-inset';

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perfil y configuración</h1>
        <p className="mt-0.5 text-sm text-[#A9A9A9]">Gestiona tu cuenta y la configuración general del CEE.</p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {/* ── Tab bar ── */}
        <div className="flex border-b border-gray-100">
          {TABS.filter((t) => t.key !== 'cee' || isAdmin).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'border-b-2 border-[#682222] text-[#682222]'
                  : 'text-gray-500 hover:text-gray-900',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* Tab: Mi perfil                                                       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="p-6">
            {profileLoading ? (
              <p className="text-sm text-[#A9A9A9]">Cargando perfil...</p>
            ) : (
              <form onSubmit={handleProfileSave} className="grid max-w-lg gap-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="group relative shrink-0">
                    <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full bg-[#682222] text-3xl font-bold text-white ring-4 ring-[#682222]/20">
                      {displayProfile.avatarUrl ? (
                        <img
                          src={displayProfile.avatarUrl}
                          alt={displayProfile.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    {/* Hover overlay */}
                    <button
                      type="button"
                      aria-label="Cambiar foto"
                      disabled={avatarUploading}
                      onClick={() => avatarRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                    >
                      <Camera className="h-7 w-7 text-white" />
                    </button>
                    <input
                      ref={avatarRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{avatarUploading ? 'Subiendo...' : 'Foto de perfil'}</p>
                    <p className="mt-0.5 text-xs text-[#A9A9A9]">JPG, PNG o WebP. Máximo 3 MB.</p>
                    <button
                      type="button"
                      onClick={() => avatarRef.current?.click()}
                      disabled={avatarUploading}
                      className="mt-2 text-xs font-medium text-[#682222] hover:underline disabled:opacity-50"
                    >
                      Cambiar foto
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus:border-[#682222] focus:ring-[#682222]/20"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="grid gap-1.5">
                  <div className="flex items-center gap-2">
                    <Label>Correo electrónico</Label>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      No editable
                    </span>
                  </div>
                  <input
                    type="email"
                    value={displayProfile.email}
                    readOnly
                    className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Role */}
                <div className="grid gap-1.5">
                  <Label>Rol</Label>
                  <div>
                    <span className="inline-flex rounded-full bg-[#682222] px-3 py-1 text-xs font-semibold text-white">
                      {(profile?.role ?? user?.role) === 'admin' ? 'Administrador' : 'Estudiante'}
                    </span>
                  </div>
                </div>

                <Feedback msg={profileMsg} />

                <Button
                  type="submit"
                  disabled={profileSaving}
                  className="w-fit bg-[#682222] text-white hover:bg-[#4F1A1A]"
                >
                  {profileSaving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* Tab: Seguridad                                                       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="p-6">
            <form onSubmit={handlePasswordChange} className="grid max-w-lg gap-5">
              {/* Current password */}
              <div className="grid gap-1.5">
                <Label htmlFor="currentPwd">Contraseña actual</Label>
                <div className="flex">
                  <input
                    id="currentPwd"
                    type={showPwds.current ? 'text' : 'password'}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    autoComplete="current-password"
                    className={cn(pwdInputCls, 'rounded-r-none border-r-0')}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('current')}
                    className="flex h-10 w-10 items-center justify-center rounded-r-md border border-input bg-gray-50 text-gray-400 hover:text-gray-700"
                    aria-label={showPwds.current ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPwds.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="grid gap-1.5">
                <Label htmlFor="newPwd">Nueva contraseña</Label>
                <div className="flex">
                  <input
                    id="newPwd"
                    type={showPwds.newPwd ? 'text' : 'password'}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    autoComplete="new-password"
                    className={cn(pwdInputCls, 'rounded-r-none border-r-0')}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('newPwd')}
                    className="flex h-10 w-10 items-center justify-center rounded-r-md border border-input bg-gray-50 text-gray-400 hover:text-gray-700"
                  >
                    {showPwds.newPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#A9A9A9]">Mínimo 8 caracteres.</p>
              </div>

              {/* Confirm password */}
              <div className="grid gap-1.5">
                <Label htmlFor="confirmPwd">Confirmar nueva contraseña</Label>
                <div className="flex">
                  <input
                    id="confirmPwd"
                    type={showPwds.confirm ? 'text' : 'password'}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    autoComplete="new-password"
                    className={cn(pwdInputCls, 'rounded-r-none border-r-0',
                      confirmPwd && newPwd !== confirmPwd && 'border-rose-400',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('confirm')}
                    className="flex h-10 w-10 items-center justify-center rounded-r-md border border-input bg-gray-50 text-gray-400 hover:text-gray-700"
                  >
                    {showPwds.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPwd && newPwd !== confirmPwd && (
                  <p className="text-[11px] text-rose-500">Las contraseñas no coinciden.</p>
                )}
              </div>

              <Feedback msg={pwdMsg} />

              <Button
                type="submit"
                disabled={pwdSaving}
                className="w-fit bg-[#682222] text-white hover:bg-[#4F1A1A]"
              >
                {pwdSaving ? 'Cambiando...' : 'Cambiar contraseña'}
              </Button>

              <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Por seguridad, se cerrará tu sesión tras cambiar la contraseña.</span>
              </div>
            </form>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* Tab: Configuración CEE (solo admin)                                 */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'cee' && isAdmin && (
          <div className="p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-900">Configuración general del CEE</p>
              <p className="mt-0.5 text-xs text-[#A9A9A9]">Estos valores afectan el comportamiento del sistema.</p>
            </div>

            {settingsLoading ? (
              <p className="text-sm text-[#A9A9A9]">Cargando configuración...</p>
            ) : (
              <form onSubmit={handleSettingsSave} className="grid max-w-lg gap-5">
                {SETTINGS_CONFIG.map((cfg) => (
                  <div key={cfg.key} className="grid gap-1.5">
                    <Label htmlFor={cfg.key}>{cfg.label}</Label>
                    <input
                      id={cfg.key}
                      type={cfg.type ?? 'text'}
                      value={settingsValues[cfg.key] ?? ''}
                      onChange={(e) =>
                        setSettingsValues((p) => ({ ...p, [cfg.key]: e.target.value }))
                      }
                      className={inputCls}
                    />
                  </div>
                ))}

                <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    El correo de notificaciones también debe actualizarse en{' '}
                    <strong>Supabase Dashboard → Edge Functions → Secrets → SECRETARY_EMAIL</strong>.
                  </span>
                </div>

                <Feedback msg={settingsMsg} />

                <Button
                  type="submit"
                  disabled={settingsSaving}
                  className="w-fit bg-[#682222] text-white hover:bg-[#4F1A1A]"
                >
                  {settingsSaving ? 'Guardando...' : 'Guardar configuración'}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
