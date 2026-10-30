import React, { useState } from 'react';
import { X, ShieldCheck, Loader2, User, Lock } from 'lucide-react';
import { loginWithGoogle, loginWithPassword, authErrorMessage } from '../services/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError('');
    try {
      await fn();
      setPassword('');
      onClose();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !password) {
      setError('Completá el usuario y la contraseña.');
      return;
    }
    run(() => loginWithPassword(usuario, password));
  };

  const inputClass = 'w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-ink';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Acceso de administrador</h2>
              <p className="text-xs text-slate-400">Solo el admin puede editar el torneo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <form onSubmit={handlePassword} className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Usuario</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoCapitalize="none"
                  autoComplete="username"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{loading ? 'Ingresando...' : 'Ingresar'}</span>
            </button>
          </form>

          <div className="flex items-center gap-2 text-slate-500">
            <div className="flex-1 h-px bg-slate-800" />
            <span>o</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <button
            type="button"
            onClick={() => run(loginWithGoogle)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 disabled:opacity-60 text-club-ink"
          >
            <span>Ingresar con Google</span>
          </button>

          {error && (
            <p className="text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};
