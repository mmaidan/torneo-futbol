import React from 'react';
import { 
  Trophy, 
  ShieldCheck, 
  Eye, 
  Cloud, 
  CloudOff, 
  Share2, 
  PlusCircle, 
  Layers, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Tournament } from '../types/tournament';

interface NavbarProps {
  tournament: Tournament;
  isAdmin: boolean;
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
  onToggleAdmin,
  onOpenSelector,
  onOpenNewTournament,
  onOpenFirebaseConfig,
  onOpenShareModal,
  isCloudSynced,
}) => {
  const modalityLabel = {
    f5: 'Fútbol 5',
    f7: 'Fútbol 7',
    f8: 'Fútbol 8',
    f11: 'Fútbol 11',
  }[tournament.modality] || 'Fútbol';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Current Tournament Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={onOpenSelector}
              className="flex items-center gap-2 group text-left focus:outline-none"
              title="Cambiar de torneo"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <Trophy className="w-5 h-5 text-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-white truncate group-hover:text-brand-400 transition-colors">
                    {tournament.name}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {modalityLabel}
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400">
                    {tournament.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-slate-300">
                  <Layers className="w-3 h-3" />
                  <span>Click para cambiar o gestionar torneos</span>
                </p>
              </div>
            </button>
          </div>

          {/* Right actions: Cloud Status, Share, Admin Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Cloud Sync Status */}
            <button
              onClick={onOpenFirebaseConfig}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isCloudSynced 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900/50' 
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 text-xs'
              }`}
              title={isCloudSynced ? 'Conectado a Firebase Cloud Firestore' : 'Modo Local - Click para conectar Firebase'}
            >
              {isCloudSynced ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="hidden md:inline">Nube Activa</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline">Modo Local</span>
                </>
              )}
            </button>

            {/* Share / WhatsApp Button */}
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Compartir tabla o fixture por WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            {/* New Tournament Button */}
            <button
              onClick={onOpenNewTournament}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm shadow-brand-600/30"
              title="Crear un nuevo torneo"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nuevo Torneo</span>
            </button>

            {/* Admin vs Public View Toggle */}
            <button
              onClick={onToggleAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isAdmin 
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 shadow-sm shadow-amber-500/10' 
                  : 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
              }`}
              title={isAdmin ? 'Estás en modo Administrador (puedes editar todo)' : 'Estás en vista de solo lectura (pública)'}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Admin</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Vista Pública</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
