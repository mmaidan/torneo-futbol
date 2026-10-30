import React from 'react';
import { Match, Team } from '../types/tournament';
import { Clock, MapPin, Edit3 } from 'lucide-react';
import { TeamBadge } from './TeamBadge';

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
    name: 'Local',
    shortName: 'LOC',
    color: '#3b82f6',
    logoUrl: undefined as string | undefined,
    players: [],
  };

  const awayTeam = teams.find((t) => t.id === match.awayTeamId) || {
    name: 'Visitante',
    shortName: 'VIS',
    color: '#ef4444',
    logoUrl: undefined as string | undefined,
    players: [],
  };

  const isFinished = match.status === 'finished';

  // Group goals
  const homeGoals = (match.events || []).filter((e) => e.teamId === match.homeTeamId && e.type === 'goal');
  const awayGoals = (match.events || []).filter((e) => e.teamId === match.awayTeamId && e.type === 'goal');

  const getPlayerName = (playerId: string) => {
    const p = [...homeTeam.players, ...awayTeam.players].find((item) => item.id === playerId);
    return p ? p.name.split(' ')[0] : 'Gol';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition-colors">
      
      {/* Header: Fecha, Cancha, Horario */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-brand-400 font-bold">Fecha {match.round}</span>
          {match.pitch && (
            <>
              <span>•</span>
              <span className="truncate max-w-[120px]">{match.pitch}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          {match.time && (
            <span className="font-mono">{match.time} hs</span>
          )}
          {isFinished ? (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-semibold">
              Final
            </span>
          ) : (
            <span className="text-[10px] bg-slate-800/60 text-slate-400 px-1.5 py-0.5 rounded">
              Por jugar
            </span>
          )}
        </div>
      </div>

      {/* Main Match Row: Home Team - Score - Away Team */}
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 py-1">
        
        {/* Local Team */}
        <div className="flex items-center gap-2 min-w-0">
          <TeamBadge
            logoUrl={homeTeam.logoUrl}
            color={homeTeam.color || '#3b82f6'}
            name={homeTeam.name}
            size={28}
            fallbackClassName="w-3 h-6 rounded-sm flex-shrink-0"
          />
          <span className="text-sm font-bold text-ink truncate" title={homeTeam.name}>
            {homeTeam.name}
          </span>
        </div>

        {/* Score or VS */}
        <div className="px-2 text-center">
          {isFinished ? (
            <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-mono font-black text-lg text-ink">
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-500 uppercase px-2 py-1">
              VS
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-end gap-2 min-w-0 text-right">
          <span className="text-sm font-bold text-ink truncate" title={awayTeam.name}>
            {awayTeam.name}
          </span>
          <TeamBadge
            logoUrl={awayTeam.logoUrl}
            color={awayTeam.color || '#ef4444'}
            name={awayTeam.name}
            size={28}
            fallbackClassName="w-3 h-6 rounded-sm flex-shrink-0"
          />
        </div>

      </div>

      {/* Goles resumen en texto pequeño si el partido terminó y tiene goles */}
      {isFinished && (homeGoals.length > 0 || awayGoals.length > 0) && (
        <div className="mt-2 pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="truncate">
            {homeGoals.length > 0 && (
              <span>⚽ {homeGoals.map((g) => getPlayerName(g.playerId)).join(', ')}</span>
            )}
          </div>
          <div className="text-right truncate">
            {awayGoals.length > 0 && (
              <span>⚽ {awayGoals.map((g) => getPlayerName(g.playerId)).join(', ')}</span>
            )}
          </div>
        </div>
      )}

      {/* Botón para Administrador */}
      {isAdmin && (
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => onEditMatch(match)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isFinished ? 'Modificar Resultado' : 'Cargar Resultado'}</span>
          </button>
        </div>
      )}

    </div>
  );
};
