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

  // Línea de tiempo: goles y tarjetas ordenados por minuto
  const allPlayers = [...homeTeam.players, ...awayTeam.players];
  const sortedEvents = (match.events || [])
    .map((e, idx) => ({ e, idx }))
    .sort((x, y) => (x.e.minute ?? 999) - (y.e.minute ?? 999) || x.idx - y.idx)
    .map(({ e }) => e);

  // Un bloque por tipo de evento (goles, amarillas, rojas, azules). Dentro de cada bloque,
  // los eventos de un mismo jugador se agrupan en una línea: "Sanchez Ruben (4)".
  const BLOCK_TYPES = ['goal', 'yellow_card', 'red_card', 'blue_card'] as const;
  type Row = { key: string; playerId: string; count: number };
  const buildRows = (type: string, teamId: string): Row[] => {
    const rows = new Map<string, Row>();
    sortedEvents
      .filter((e) => e.type === type && e.teamId === teamId)
      .forEach((e, i) => {
        const key = e.playerId || `sin-jugador-${i}`;
        const existing = rows.get(key);
        if (existing) existing.count += 1;
        else rows.set(key, { key, playerId: e.playerId, count: 1 });
      });
    return Array.from(rows.values());
  };
  const eventBlocks = BLOCK_TYPES.map((type) => ({
    type,
    home: buildRows(type, match.homeTeamId),
    away: buildRows(type, match.awayTeamId),
  })).filter((blk) => blk.home.length > 0 || blk.away.length > 0);

  const getPlayerName = (playerId: string, type: string) => {
    const p = allPlayers.find((item) => item.id === playerId);
    return p ? p.name : type === 'goal' ? 'Gol' : 'Tarjeta';
  };

  const EventIcon: React.FC<{ type: string }> = ({ type }) => {
    if (type === 'goal') return <span className="text-sm leading-none" aria-label="Gol">⚽</span>;
    const color = type === 'red_card' ? 'bg-red-600' : type === 'blue_card' ? 'bg-blue-500' : 'bg-yellow-400';
    const label = type === 'red_card' ? 'Roja' : type === 'blue_card' ? 'Azul' : 'Amarilla';
    return <span className={`inline-block w-2.5 h-3.5 rounded-[2px] ${color}`} aria-label={label} />;
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

      {/* Main Match Row: Escudo grande con el nombre abajo - Marcador - Escudo grande con el nombre abajo */}
      <div className="grid grid-cols-[1fr,auto,1fr] items-start gap-2 py-1">

        {/* Local Team */}
        <div className="flex flex-col items-center gap-1.5 min-w-0 text-center">
          <TeamBadge
            logoUrl={homeTeam.logoUrl}
            color={homeTeam.color || '#3b82f6'}
            name={homeTeam.name}
            size={56}
            fallbackClassName="w-6 h-12 rounded-sm flex-shrink-0"
          />
          <span className="text-xs font-bold text-ink leading-tight break-words" title={homeTeam.name}>
            {homeTeam.name}
          </span>
        </div>

        {/* Score or VS */}
        <div className="px-2 text-center mt-3">
          {isFinished ? (
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono font-black text-xl text-ink">
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-500 uppercase px-2 py-1">
              VS
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-1.5 min-w-0 text-center">
          <TeamBadge
            logoUrl={awayTeam.logoUrl}
            color={awayTeam.color || '#ef4444'}
            name={awayTeam.name}
            size={56}
            fallbackClassName="w-6 h-12 rounded-sm flex-shrink-0"
          />
          <span className="text-xs font-bold text-ink leading-tight break-words" title={awayTeam.name}>
            {awayTeam.name}
          </span>
        </div>

      </div>

      {/* Goles y tarjetas: un bloque por tipo, con el ícono una sola vez en el centro */}
      {isFinished && eventBlocks.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-800/60 space-y-2">
          {eventBlocks.map((blk) => (
            <div key={blk.type} className="grid grid-cols-[1fr,auto,1fr] items-start gap-3">
              <ul className="space-y-0.5 text-left">
                {blk.home.map((r) => (
                  <li key={r.key} className="text-[11px] leading-snug text-slate-300 break-words">
                    <span className="font-semibold">{getPlayerName(r.playerId, blk.type)}</span>
                    {r.count > 1 && <span className="text-slate-400"> ({r.count})</span>}
                  </li>
                ))}
              </ul>
              <div className="flex justify-center w-4 pt-0.5">
                <EventIcon type={blk.type} />
              </div>
              <ul className="space-y-0.5 text-right">
                {blk.away.map((r) => (
                  <li key={r.key} className="text-[11px] leading-snug text-slate-300 break-words">
                    <span className="font-semibold">{getPlayerName(r.playerId, blk.type)}</span>
                    {r.count > 1 && <span className="text-slate-400"> ({r.count})</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
