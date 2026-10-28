import React from 'react';
import { Tournament, Match } from '../types/tournament';
import { calculateStandings, calculateTopScorers } from '../utils/standingsCalculator';
import { 
  Trophy, 
  Flame, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Radio, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';
import { MatchCard } from './MatchCard';

interface DashboardOverviewProps {
  tournament: Tournament;
  isAdmin: boolean;
  onNavigate: (tab: 'fixture' | 'standings' | 'teams' | 'stats' | 'bracket') => void;
  onEditMatch: (match: Match) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tournament,
  isAdmin,
  onNavigate,
  onEditMatch,
}) => {
  const standings = calculateStandings(tournament.teams, tournament.matches, tournament.config);
  const topScorers = calculateTopScorers(tournament.teams, tournament.matches);
  
  const leader = standings[0];
  const topScorer = topScorers[0];

  const liveMatches = tournament.matches.filter((m) => m.status === 'live');
  const upcomingMatches = tournament.matches
    .filter((m) => m.status === 'scheduled')
    .slice(0, 4);

  const finishedCount = tournament.matches.filter((m) => m.status === 'finished').length;
  const totalMatches = tournament.matches.length;
  const progressPercent = totalMatches > 0 ? Math.round((finishedCount / totalMatches) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Hero Tournament Status Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Torneo Activo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {tournament.name}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Fútbol {tournament.modality.replace('f', '')} • {tournament.category} • Formato: {tournament.format === 'league' ? 'Liga Todos contra Todos' : tournament.format === 'groups_playoffs' ? 'Fase de Grupos + Playoffs' : 'Eliminación Directa'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigate('fixture')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Ver Fixture Completo</span>
            </button>
            <button
              onClick={() => onNavigate('standings')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Ver Tabla de Posiciones</span>
            </button>
          </div>
        </div>

        {/* Tournament Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Progreso del Torneo ({finishedCount} de {totalMatches} partidos jugados)</span>
            <span className="font-mono font-bold text-brand-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-brand-600 to-emerald-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Leader */}
        <div 
          onClick={() => onNavigate('standings')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Líder Actual</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          {leader ? (
            <div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: leader.teamColor }} />
                <h4 className="text-base font-black text-white truncate">{leader.teamName}</h4>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                <span className="font-bold text-amber-400">{leader.points} pts</span> • {leader.played} PJ • Dif: {leader.goalDiff > 0 ? `+${leader.goalDiff}` : leader.goalDiff}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Sin datos</p>
          )}
        </div>

        {/* Card 2: Top Scorer */}
        <div 
          onClick={() => onNavigate('stats')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Goleador Estrella</span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          {topScorer ? (
            <div>
              <h4 className="text-base font-black text-white truncate">{topScorer.playerName}</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                <span className="font-bold text-orange-400">{topScorer.goals} goles</span> • {topScorer.teamName}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Aún sin goles</p>
          )}
        </div>

        {/* Card 3: Teams Count */}
        <div 
          onClick={() => onNavigate('teams')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Equipos & Planteles</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-black text-white">{tournament.teams.length}</h4>
            <p className="text-xs text-slate-400 mt-1">
              {tournament.teams.reduce((acc, t) => acc + (t.players?.length || 0), 0)} jugadores registrados
            </p>
          </div>
        </div>

        {/* Card 4: Knockout or Format Status */}
        <div 
          onClick={() => onNavigate(tournament.format === 'knockout' || tournament.format === 'groups_playoffs' ? 'bracket' : 'standings')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Fase del Torneo</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-black text-white">
              {tournament.format === 'league' ? 'Liga Regular' : 'Playoffs'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {liveMatches.length > 0 ? `🔴 ${liveMatches.length} en juego ahora` : 'Próxima fecha programada'}
            </p>
          </div>
        </div>

      </div>

      {/* Live Matches Spotlight (if any) */}
      {liveMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Partidos en Directo Ahora
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                teams={tournament.teams}
                isAdmin={isAdmin}
                onEditMatch={onEditMatch}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Matches Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Próximos Partidos en Agenda
            </h3>
          </div>
          <button
            onClick={() => onNavigate('fixture')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>Ver todo el fixture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingMatches.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
            No hay partidos programados pendientes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                teams={tournament.teams}
                isAdmin={isAdmin}
                onEditMatch={onEditMatch}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
