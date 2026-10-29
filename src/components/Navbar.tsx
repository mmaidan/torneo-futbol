import React from 'react';
import { 
  Trophy, 
  ShieldCheck, 
  Eye, 
  Cloud, 
  Layers, 
  Plus,
  UserCog
} from 'lucide-react';
import { Tournament } from '../types/tournament';

interface NavbarProps {
  tournament: Tournament;
  isAdmin: boolean;
  isLoggedIn?: boolean;
  isSuperAdmin?: boolean;
  onOpenAdmins?: () => void;
  onToggleAdmin: () => void;
  onOpenSelector: () => void;
  onOpenNewTournament: () => void;
  onOpenFirebaseConfig: () => void;
  onOpenShareModal: () => void;
  isCloudSynced: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  tournament,
  isAdmin,
  isLoggedIn = false,
  isSuperAdmin = false,
  onOpenAdmins,
  onToggleAdmin,
  onOpenSelector,
  onOpenNewTournament,
  onOpenFirebaseConfig,
  isCloudSynced,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 gap-2">
          
          {/* Logo & Current Tournament Info */}
          <button 
            onClick={onOpenSelector}
            className="flex items-center gap-2 group text-left min-w-0"
            title="Cambiar torneo"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-slate-950 font-black flex-shrink-0">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-brand-400 transition-colors">
                {tournament.name}
              </h1>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Cambiar torneo</span>
              </p>
            </div>
          </button>

          {/* Right actions: Cloud Sync, Admin toggle, New */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Cloud Status */}
            <button
              onClick={onOpenFirebaseConfig}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isCloudSynced 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={isCloudSynced ? 'Conectado a Firebase Nube' : 'Configurar Firebase Nube'}
            >
              <Cloud className="w-4 h-4" />
            </button>

            {/* Nuevo Torneo (solo admin) */}
            {isAdmin && (
              <button
                onClick={onOpenNewTournament}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="Crear nuevo torneo"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

            {/* Gestión de usuarios (solo superadmin) */}
            {isSuperAdmin && (
              <button
                onClick={onOpenAdmins}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                title="Administrar usuarios"
              >
                <UserCog className="w-4 h-4" />
              </button>
            )}

            {/* Admin Toggle */}
            <button
              onClick={onToggleAdmin}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isAdmin 
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={isAdmin ? 'Administrador: tocá para cerrar sesión' : isLoggedIn ? 'Esta cuenta no es administradora: tocá para cerrar sesión' : 'Modo lectura: tocá para ingresar como admin'}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Admin</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isLoggedIn ? 'Sin permiso' : 'Ingresar'}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
