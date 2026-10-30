import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Tournament, Match, Team } from './types/tournament';
import { 
  loadAllTournaments, 
  saveTournament, 
  deleteTournament, 
  getActiveTournamentId, 
  setActiveTournamentId 
} from './services/storageService';
import { 
  getSavedFirebaseConfig, 
  subscribeToAllTournamentsCloud,
  deleteTournamentFromCloud
} from './services/firebase';
import { subscribeToAuth, checkAdminRole, describeRoleCheck, logoutAdmin, AdminRole, RoleCheck } from './services/auth';
import { Navbar } from './components/Navbar';
import { FixtureView } from './components/FixtureView';
import { StandingsView } from './components/StandingsView';
import { TeamsView } from './components/TeamsView';
import { StatsView } from './components/StatsView';
import { MatchModal } from './components/MatchModal';
import { TournamentSelectorModal } from './components/TournamentSelectorModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { ShareModal } from './components/ShareModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminsModal } from './components/AdminsModal';
import { RecoveryModal } from './components/RecoveryModal';
import { 
  Calendar, 
  Trophy, 
  Users, 
  Flame 
} from 'lucide-react';

export const App: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>(() => loadAllTournaments());
  const [activeTournamentId, setActiveId] = useState<string>(() => getActiveTournamentId());
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [roleCheck, setRoleCheck] = useState<RoleCheck | null>(null);
  const isAdmin = adminRole !== null;
  const isSuperAdmin = adminRole === 'superadmin';
  const [activeTab, setActiveTab] = useState<'standings' | 'fixture' | 'stats' | 'teams'>('standings');

  // Modals state
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isNewTournamentOpen, setIsNewTournamentOpen] = useState(false);
  const [isFirebaseOpen, setIsFirebaseOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  // Se abre con la dirección ...?recuperar=1 (herramienta para rescatar resultados)
  const [isRecoveryOpen, setIsRecoveryOpen] = useState<boolean>(() => {
    try {
      return new URLSearchParams(window.location.search).has('recuperar');
    } catch {
      return false;
    }
  });
  const [isAdminsOpen, setIsAdminsOpen] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(() => !!getSavedFirebaseConfig());

  // Active tournament object
  const currentTournament = tournaments.find((t) => t.id === activeTournamentId) || tournaments[0];

  // Subscribe to real-time Cloud updates if Firebase is configured
  useEffect(() => {
    const config = getSavedFirebaseConfig();
    setIsCloudSynced(!!config);

    if (config) {
      const unsub = subscribeToAllTournamentsCloud((cloudTournaments) => {
        if (cloudTournaments && cloudTournaments.length > 0) {
          // Si este dispositivo tiene resultados más nuevos que la nube (por ejemplo, porque
          // no llegaron a subirse), no se los pisa con la copia vieja. Se exige que tenga
          // MÁS partidos con resultado, para que un torneo vacío recién creado nunca gane.
          const finished = (t: Tournament) => t.matches.filter((m) => m.status === 'finished').length;
          const local = loadAllTournaments();
          const merged = cloudTournaments.map((c) => {
            const l = local.find((t) => t.id === c.id);
            return l && (l.updatedAt || '') > (c.updatedAt || '') && finished(l) > finished(c) ? l : c;
          });
          setTournaments(merged);
          setActiveId((prevId) => {
            const exists = merged.some((t) => t.id === prevId);
            return exists ? prevId : merged[0].id;
          });
        }
      });
      return () => {
        if (unsub) unsub();
      };
    }
  }, []);

  // Sesión de administrador (Firebase Auth)
  useEffect(() => {
    let cancelled = false;
    const unsub = subscribeToAuth((user) => {
      setAuthUser(user);
      if (!user) {
        setAdminRole(null);
        setRoleCheck(null);
        return;
      }
      checkAdminRole(user).then((res) => {
        if (cancelled) return;
        setAdminRole(res.role);
        setRoleCheck(res);
      });
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const handleAdminButton = () => {
    if (authUser) {
      logoutAdmin().catch(console.error);
    } else {
      setIsLoginOpen(true);
    }
  };

  // Handlers for modifying tournament
  const handleUpdateTournament = (updated: Tournament) => {
    if (!isAdmin) return;
    saveTournament(updated);
    setTournaments((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleCreateTournament = (newTournament: Tournament) => {
    if (!isAdmin) return;
    saveTournament(newTournament);
    setTournaments((prev) => [newTournament, ...prev]);
    setActiveTournamentId(newTournament.id);
    setActiveId(newTournament.id);
    setActiveTab('standings');
  };

  const handleDeleteTournament = (id: string) => {
    if (!isAdmin) return;
    deleteTournamentFromCloud(id).catch(console.error);
    const updated = deleteTournament(id);
    setTournaments(updated);
    setActiveId(updated[0]?.id || '');
  };

  const handleSelectTournament = (id: string) => {
    setActiveTournamentId(id);
    setActiveId(id);
  };

  const handleSaveMatch = (updatedMatch: Match) => {
    if (!currentTournament) return;
    const updatedMatches = currentTournament.matches.map((m) =>
      m.id === updatedMatch.id ? updatedMatch : m
    );
    handleUpdateTournament({
      ...currentTournament,
      matches: updatedMatches,
    });
  };

  const handleUpdateMatches = (matches: Match[]) => {
    if (!currentTournament) return;
    handleUpdateTournament({
      ...currentTournament,
      matches,
    });
  };

  const handleUpdateTeams = (teams: Team[]) => {
    if (!currentTournament) return;
    handleUpdateTournament({
      ...currentTournament,
      teams,
    });
  };

  const handleAddNewManualMatch = () => {
    if (!currentTournament || currentTournament.teams.length < 2) {
      alert('Necesitas al menos 2 equipos para programar un partido.');
      return;
    }
    const maxRound = Math.max(0, ...currentTournament.matches.map((m) => m.round));
    const newMatch: Match = {
      id: `match_manual_${Date.now()}`,
      tournamentId: currentTournament.id,
      round: maxRound > 0 ? maxRound : 1,
      homeTeamId: currentTournament.teams[0].id,
      awayTeamId: currentTournament.teams[1].id,
      status: 'scheduled',
      date: new Date().toISOString().split('T')[0],
      time: '20:00',
      pitch: 'Cancha 1',
      events: [],
    };
    const updated = [...currentTournament.matches, newMatch];
    handleUpdateMatches(updated);
    setEditingMatch(newMatch);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Encabezado compacto */}
      <Navbar
        tournament={currentTournament}
        isAdmin={isAdmin}
        isLoggedIn={!!authUser}
        isSuperAdmin={isSuperAdmin}
        onOpenAdmins={() => setIsAdminsOpen(true)}
        onToggleAdmin={handleAdminButton}
        onOpenSelector={() => {
          setIsNewTournamentOpen(false);
          setIsSelectorOpen(true);
        }}
        onOpenNewTournament={() => {
          setIsNewTournamentOpen(true);
          setIsSelectorOpen(true);
        }}
        onOpenFirebaseConfig={() => setIsFirebaseOpen(true)}
        onOpenShareModal={() => setIsShareOpen(true)}
        isCloudSynced={isCloudSynced}
      />

      {authUser && roleCheck && !roleCheck.role && (
        <div className="bg-rose-950/70 border-b border-rose-900 text-rose-200 text-xs px-4 py-2 text-center">
          {describeRoleCheck(roleCheck)}
        </div>
      )}

      {/* Pestañas de navegación para PC y tablets */}
      <div className="bg-slate-900 border-b border-slate-800 hidden sm:block">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex space-x-2 py-2">
            
            <button
              onClick={() => setActiveTab('standings')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'standings'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-ink hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Posiciones</span>
            </button>

            <button
              onClick={() => setActiveTab('fixture')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'fixture'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-ink hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Fixture & Partidos</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'stats'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-ink hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Goleadores</span>
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'teams'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-ink hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Equipos</span>
            </button>

          </nav>
        </div>
      </div>

      {/* Contenido principal (Centrado y ancho ideal para leer y navegar en móvil o PC) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 pb-20 sm:pb-8">
        {activeTab === 'standings' && (
          <StandingsView tournament={currentTournament} />
        )}

        {activeTab === 'fixture' && (
          <FixtureView
            tournament={currentTournament}
            isAdmin={isAdmin}
            onEditMatch={(m) => setEditingMatch(m)}
            onUpdateMatches={handleUpdateMatches}
            onAddNewMatch={handleAddNewManualMatch}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView tournament={currentTournament} />
        )}

        {activeTab === 'teams' && (
          <TeamsView
            tournament={currentTournament}
            isAdmin={isAdmin}
            onUpdateTeams={handleUpdateTeams}
          />
        )}
      </main>

      {/* Barra inferior para Celulares (Fácil de pulsar con el pulgar) */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 sm:hidden px-2 pt-1 shadow-lg"
        style={{ paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-4 gap-1 text-[11px]">
          
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              activeTab === 'standings' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span>Posiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('fixture')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              activeTab === 'fixture' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span>Fixture</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              activeTab === 'stats' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Flame className="w-5 h-5 mb-0.5" />
            <span>Goles</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              activeTab === 'teams' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Equipos</span>
          </button>

        </div>
      </div>

      {/* Modales */}
      <MatchModal
        match={editingMatch}
        teams={currentTournament.teams}
        onClose={() => setEditingMatch(null)}
        onSave={handleSaveMatch}
      />

      <TournamentSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        tournaments={tournaments}
        activeTournamentId={currentTournament.id}
        onSelectTournament={handleSelectTournament}
        onCreateTournament={handleCreateTournament}
        onDeleteTournament={handleDeleteTournament}
        onImportTournament={handleCreateTournament}
        initiallyOpenCreate={isNewTournamentOpen}
        isAdmin={isAdmin}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseOpen}
        onClose={() => setIsFirebaseOpen(false)}
        onConfigSaved={() => setIsCloudSynced(!!getSavedFirebaseConfig())}
      />

      <RecoveryModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        currentTournament={currentTournament}
        isAdmin={isAdmin}
        onRecover={handleUpdateTournament}
        onRequestLogin={() => setIsLoginOpen(true)}
      />

      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <AdminsModal
        isOpen={isAdminsOpen && isSuperAdmin}
        onClose={() => setIsAdminsOpen(false)}
        currentEmail={authUser?.email || ''}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        tournament={currentTournament}
      />

    </div>
  );
};
