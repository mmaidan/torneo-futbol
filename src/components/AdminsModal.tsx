import React, { useCallback, useEffect, useState } from 'react';
import { X, UserCog, UserPlus, Trash2, Loader2, Crown, Eye, EyeOff } from 'lucide-react';
import { AdminEntry, addAdmin, entryLabel, isValidEmail, listAdmins, normalizeEmail, removeAdmin } from '../services/admins';
import {
  AdminRole,
  MIN_PASSWORD_LENGTH,
  authErrorMessage,
  createPasswordAccount,
  isValidUsername,
  normalizeUsername,
  usernameToEmail,
} from '../services/auth';

interface AdminsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

export const AdminsModal: React.FC<AdminsModalProps> = ({ isOpen, onClose, currentEmail }) => {
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const [mode, setMode] = useState<'password' | 'google'>('password');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<AdminRole>('admin');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');

  const me = normalizeEmail(currentEmail);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAdmins(await listAdmins());
    } catch (err) {
      setError('No se pudo cargar la lista. ¿Publicaste las reglas de Firestore?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  if (!isOpen) return null;

  const resetForm = () => {
    setNombre('');
    setUsuario('');
    setPassword('');
    setGoogleEmail('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOk('');

    if (mode === 'password') {
      if (!nombre.trim()) return setError('Ingresá el nombre y apellido.');
      if (!isValidUsername(usuario)) {
        return setError('El usuario debe tener de 3 a 20 caracteres: letras, números, punto, guion o guion bajo.');
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      }
    } else if (!isValidEmail(googleEmail)) {
      return setError('Ingresá un email válido (el de la cuenta de Google de esa persona).');
    }

    setSaving(true);
    try {
      if (mode === 'password') {
        await createPasswordAccount(usuario, password);
        await addAdmin(
          { email: usernameToEmail(usuario), rol, nombre, usuario: normalizeUsername(usuario) },
          me
        );
        setOk(`Listo: ${normalizeUsername(usuario)} ya puede ingresar.`);
      } else {
        await addAdmin({ email: googleEmail, rol, nombre }, me);
        setOk(`Listo: ${normalizeEmail(googleEmail)} ya puede ingresar con Google.`);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(authErrorMessage(err));
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (entry: AdminEntry) => {
    if (!window.confirm(`¿Dar de baja a ${entry.nombre || entryLabel(entry)}? Pierde el acceso de inmediato.`)) return;
    setError('');
    setOk('');
    try {
      await removeAdmin(entry.email);
      await load();
    } catch (err) {
      setError('No se pudo dar de baja. Revisá los permisos.');
      console.error(err);
    }
  };

  const inputClass = 'w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-ink';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserCog className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Administradores</h2>
              <p className="text-xs text-slate-400">Altas y bajas de usuarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {(['password', 'google'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError('');
                  setOk('');
                }}
                className={`py-1.5 rounded-lg font-semibold transition-colors ${
                  mode === m ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'password' ? 'Usuario y contraseña' : 'Cuenta de Google'}
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nombre y apellido</label>
                <input
                  type="text"
                  placeholder="Ana Gómez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rol</label>
                <select value={rol} onChange={(e) => setRol(e.target.value as AdminRole)} className={inputClass}>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
            </div>

            {mode === 'password' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Usuario</label>
                  <input
                    type="text"
                    autoCapitalize="none"
                    placeholder="ana.gomez"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-9`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
                      title={showPassword ? 'Ocultar' : 'Mostrar'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Email de Google</label>
                <input
                  type="email"
                  placeholder="persona@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Dar de alta</span>
            </button>
          </form>

          {error && (
            <p className="text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">{error}</p>
          )}
          {ok && (
            <p className="text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded-lg px-3 py-2">{ok}</p>
          )}

          <div className="space-y-2">
            <span className="block text-slate-400 font-semibold">Usuarios con acceso</span>
            {loading ? (
              <div className="flex justify-center py-4 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              admins.map((a) => (
                <div
                  key={a.email}
                  className="flex items-center justify-between gap-2 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-ink font-semibold truncate">{a.nombre || entryLabel(a)}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                      {a.rol === 'superadmin' && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                      <span className="truncate">
                        {a.rol === 'superadmin' ? 'Superadmin' : 'Admin'} • {entryLabel(a)}
                        {a.email === me && ' • vos'}
                      </span>
                    </p>
                  </div>
                  {a.email !== me && (
                    <button
                      onClick={() => handleRemove(a)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 flex-shrink-0"
                      title="Dar de baja"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
