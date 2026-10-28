import React from 'react';
import { Match, Team } from '../types/tournament';
import { 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Trophy, 
  Edit3, 
  CheckCircle2, 
  CircleDot,
  Radio
} from 'lucide-react';

interface MatchCardProps {
  match: Match;
  teams: Team[];
  isAdmin: boolean;
  onEditMatch: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  teams,
  isAdmin,
  onEditMatch,
}) => {
  const homeTeam = teams.find((t) => t.id === match.homeTeamId) || {
    name: 'Equipo Local',
    shortName: 'LOC',
    color: '#3b82f6',
    players: [],
  };

  const awayTeam = teams.find((t) => t.id === match.awayTeamId) || {
    name: 'Equipo Visitante',
    shortName: 'VIS',
    color: '#ef4444',
    players: [],
  };

  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const isPostponed = match.status === 'postponed';

  // Group goals and cards by team
  const homeGoals = (match.events || []).filter((e) => e.teamId === match.homeTeamId && e.type === 'goal');
  const awayGoals = (match.events || []).filter((e) => e.teamId === match.awayTeamId && e.type === 'goal');
  const cards = (match.events || []).filter((e) => e.type === 'yellow_card' || e.type === 'red_card');

  const getPlayerName = (playerId: string) => {
    const p1 = homeTeam.players?.find((p) => p.id === playerId);
    if (p1) return p1.name.split(' ')[0] + ' ' + (p1.name.split(' ')[1] ? p1.name.split(' ')[1][0] + '.' : '');
    const p2 = awayTeam.players?.find((p) => p.id === playerId);
    if (p2) return p2.name.split(' ')[0] + ' ' + (p2.name.split(' ')[1] ? p2.name.split(' ')[1][0] + '.' : '');
    return 'Jugador';
  };

  return (
    <div className={`relative bg-slate-900 border rounded-2xl overflow-hidden shadow-md transition-all duration-200 hover:border-slate-600 ${
      isLive 
        ? 'border-brand-500/60 shadow-brand-500/10 ring-1 ring-brand-500/30' 
        : isFinished 
          ? 'border-slate-800' 
          : 'border-slate-800/80 hover:bg-slate-850'
    }`}>
      {/* Top Bar: Round/Group, Date, Time, Pitch, Status */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          {match.groupName ? (
            <span className="font-semibold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
              {match.groupName}
            </span>
          ) : match.stage && match.stage !== 'group' ? (
            <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 capitalize">
              {match.stage === 'round_16' ? 'Octavos' :
               match.stage === 'quarter' ? 'Cuartos' :
               match.stage === 'semi' ? 'Semifinal' :
               match.stage === 'final' ? 'Gran Final' : 'Tercer Puesto'}
            </span>
          ) : (
            <span className="font-semibold text-slate-400">
              Fecha {match.round}
            </span>
          )}

          {match.pitch && (
            <div className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span className="truncate max-w-[120px]">{match.pitch}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {match.time && (
            <div className="flex items-center gap-1 text-slate-300 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{match.time} hs</span>
            </div>
          )}

          {isLive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
              <Radio className="w-3 h-3" />
              EN VIVO
            </span>
          )}

          {isFinished && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              Finalizado
            </span>
          )}

          {isPostponed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Postergado
            </span>
          )}
        </div>
      </div>

      {/* Main Scoreboard */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 sm:gap-4">
          
          {/* Home Team */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div 
              className="w-4 h-9 sm:w-5 sm:h-11 rounded-md flex-shrink-0 shadow-inner"
              style={{ backgroundColor: homeTeam.color || '#3b82f6' }}
              title={`Color: ${homeTeam.color}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-base font-bold text-white truncate" title={homeTeam.name}>
                {homeTeam.name}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {homeTeam.shortName}
              </div>
            </div>
          </div>

          {/* Central Score Display */}
          <div className="flex flex-col items-center px-2 sm:px-4">
            {isFinished || isLive ? (
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-wider ${
                  (match.homeScore || 0) > (match.awayScore || 0) ? 'text-brand-400' : 'text-white'
                }`}>
                  {match.homeScore ?? 0}
                </span>
                <span className="text-slate-600 font-bold">:</span>
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-wider ${
                  (match.awayScore || 0) > (match.homeScore || 0) ? 'text-brand-400' : 'text-white'
                }`}>
                  {match.awayScore ?? 0}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
                  {match.date ? new Date(match.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) : 'VS'}
                </div>
              </div>
            )}

            {/* Penalties if any */}
            {(match.homePenalties !== undefined || match.awayPenalties !== undefined) && (
              <div className="text-[11px] text-amber-400 font-mono mt-1 font-semibold">
                (Pen. {match.homePenalties} - {match.awayPenalties})
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 min-w-0 text-right">
            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-base font-bold text-white truncate" title={awayTeam.name}>
                {awayTeam.name}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {awayTeam.shortName}
              </div>
            </div>
            <div 
              className="w-4 h-9 sm:w-5 sm:h-11 rounded-md flex-shrink-0 shadow-inner"
              style={{ backgroundColor: awayTeam.color || '#ef4444' }}
              title={`Color: ${awayTeam.color}`}
            />
          </div>

        </div>

        {/* Goals detail if match has events */}
        {(homeGoals.length > 0 || awayGoals.length > 0) && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="space-y-0.5">
              {homeGoals.map((g) => (
                <div key={g.id} className="flex items-center gap-1 truncate">
                  <span>⚽</span>
                  <span className="text-slate-300 font-medium">{getPlayerName(g.playerId)}</span>
                  {g.minute && <span className="text-slate-500 font-mono">({g.minute}')</span>}
                </div>
              ))}
            </div>
            <div className="space-y-0.5 text-right">
              {awayGoals.map((g) => (
                <div key={g.id} className="flex items-center justify-end gap-1 truncate">
                  {g.minute && <span className="text-slate-500 font-mono">({g.minute}')</span>}
                  <span className="text-slate-300 font-medium">{getPlayerName(g.playerId)}</span>
                  <span>⚽</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cards and MVP summary */}
        {(cards.length > 0 || match.mvpPlayerId) && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-slate-800/50">
            {cards.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {cards.map((c) => (
                  <span 
                    key={c.id} 
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      c.type === 'yellow_card' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {c.type === 'yellow_card' ? '🟨' : '🟥'} {getPlayerName(c.playerId)}
                  </span>
                ))}
              </div>
            )}

            {match.mvpPlayerId && (
              <div className="ml-auto inline-flex items-center gap-1 text-amber-400 font-medium text-[11px]">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Figura: {getPlayerName(match.mvpPlayerId)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Action Button Bar */}
      {isAdmin && (
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            ID: <span className="font-mono">{match.id.slice(-6)}</span>
          </div>
          <button
            onClick={() => onEditMatch(match)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-600/90 hover:bg-brand-500 text-white transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Cargar Planilla / Resultado</span>
          </button>
        </div>
      )}
    </div>
  );
};
