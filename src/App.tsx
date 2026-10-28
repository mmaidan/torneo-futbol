import React, { useState, useEffect } from 'react';
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
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { FixtureView } from './components/FixtureView';
import { StandingsView } from './components/StandingsView';
import { BracketView } from './components/BracketView';
import { TeamsView } from './components/TeamsView';
import { StatsView } from './components/StatsView';
import { MatchModal } from './components/MatchModal';
import { TournamentSelectorModal } from './components/TournamentSelectorModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { ShareModal } from './components/ShareModal';
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  GitBranch, 
  Users, 
  BarChart3, 
  ShieldCheck 
} from 'lucide-react';

export const App: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>(() => loadAllTournaments());
  const [activeTournamentId, setActiveId] = useState<string>(() => getActiveTournamentId());
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'fixture' | 'standings' | 'bracket' | 'teams' | 'stats'>('overview');

  // Modals state
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isNewTournamentOpen, setIsNewTournamentOpen] = useState(false);
  const [isFirebaseOpen, setIsFirebaseOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
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
          setTournaments(cloudTournaments);
          setActiveId((prevId) => {
            const exists = cloudTournaments.some((t) => t.id === prevId);
            return exists ? prevId : cloudTournaments[0].id;
          });
        }
      });
      return () => {
        if (unsub) unsub();
      };
    }
  }, []);

  // Handlers for modifying tournament
  const handleUpdateTournament = (updated: Tournament) => {
    saveTournament(updated);
    setTournaments((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleCreateTournament = (newTournament: Tournament) => {
    saveTournament(newTournament);
    setTournaments((prev) => [newTournament, ...prev]);
    setActiveTournamentId(newTournament.id);
    setActiveId(newTournament.id);
    setActiveTab('overview');
  };

  const handleDeleteTournament = (id: string) => {
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

  const hasBracket = currentTournament?.format === 'knockout' || 
    (currentTournament?.format === 'groups_playoffs' && currentTournament.matches.some((m) => m.stage && m.stage !== 'group'));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Sticky Navigation Header */}
      <Navbar
        tournament={currentTournament}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
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

      {/* Main Tab Bar for Desktop */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 sticky top-16 z-30 backdrop-blur-md hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 py-2 overflow-x-auto no-scrollbar">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => setActiveTab('fixture')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'fixture'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Fixture & Partidos</span>
            </button>

            <button
              onClick={() => setActiveTab('standings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'standings'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Tabla de Posiciones</span>
            </button>

            {hasBracket && (
              <button
                onClick={() => setActiveTab('bracket')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'bracket'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>Llaves Playoffs</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'teams'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Equipos & Planteles</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Goleadores & Fair Play</span>
            </button>

          </nav>
        </div>
      </div>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 sm:pb-12">
        {activeTab === 'overview' && (
          <DashboardOverview
            tournament={currentTournament}
            isAdmin={isAdmin}
            onNavigate={(tab) => setActiveTab(tab)}
            onEditMatch={(m) => setEditingMatch(m)}
          />
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

        {activeTab === 'standings' && (
          <StandingsView tournament={currentTournament} />
        )}

        {activeTab === 'bracket' && (
          <BracketView
            tournament={currentTournament}
            isAdmin={isAdmin}
            onEditMatch={(m) => setEditingMatch(m)}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsView
            tournament={currentTournament}
            isAdmin={isAdmin}
            onUpdateTeams={handleUpdateTeams}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView tournament={currentTournament} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 sm:hidden px-2 py-1 shadow-2xl">
        <div className="grid grid-cols-5 gap-1 text-[10px]">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              activeTab === 'overview' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('fixture')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              activeTab === 'fixture' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span>Fixture</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              activeTab === 'standings' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-4 h-4 mb-0.5" />
            <span>Posiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              activeTab === 'teams' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>Equipos</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              activeTab === 'stats' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span>Stats</span>
          </button>

        </div>
      </div>

      {/* Modals */}
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
      />

      <FirebaseConfigModal
        isOpen={isFirebaseOpen}
        onClose={() => setIsFirebaseOpen(false)}
        onConfigSaved={() => setIsCloudSynced(!!getSavedFirebaseConfig())}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        tournament={currentTournament}
      />

    </div>
  );
};
