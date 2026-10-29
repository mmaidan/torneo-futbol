import React, { useCallback, useEffect, useState } from 'react';
import { X, UserCog, UserPlus, Trash2, Loader2, Crown } from 'lucide-react';
import { AdminEntry, addAdmin, isValidEmail, listAdmins, normalizeEmail, removeAdmin } from '../services/admins';
import type { AdminRole } from '../services/auth';

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
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('admin');

  const me = normalizeEmail(currentEmail);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(newEmail)) {
      setError('Ingresá un email válido (el de la cuenta de Google de esa persona).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addAdmin(newEmail, newRole, me);
      setNewEmail('');
      await load();
    } catch (err) {
      setError('No se pudo dar de alta. Revisá los permisos.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (entry: AdminEntry) => {
    if (!window.confirm(`¿Dar de baja a ${entry.email}?`)) return;
    setError('');
    try {
      await removeAdmin(entry.email);
      await load();
    } catch (err) {
      setError('No se pudo dar de baja. Revisá los permisos.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserCog className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Administradores</h2>
              <p className="text-xs text-slate-400">Altas y bajas de usuarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-slate-400 font-semibold">Dar de alta (email de Google)</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="persona@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as AdminRole)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-white"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
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
                    <p className="text-white font-semibold truncate">{a.email}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      {a.rol === 'superadmin' && <Crown className="w-3 h-3 text-amber-400" />}
                      {a.rol === 'superadmin' ? 'Superadmin' : 'Admin'}
                      {a.email === me && ' • vos'}
                    </p>
                  </div>
                  {a.email !== me && (
                    <button
                      onClick={() => handleRemove(a)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700"
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
