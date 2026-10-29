import React from 'react';
import { Match, Team, Tournament } from '../types/tournament';
import { Trophy, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { TeamBadge } from './TeamBadge';

interface BracketViewProps {
  tournament: Tournament;
  isAdmin: boolean;
  onEditMatch: (match: Match) => void;
}

export const BracketView: React.FC<BracketViewProps> = ({
  tournament,
  isAdmin,
  onEditMatch,
}) => {
  const teams = tournament.teams;

  // Filter knockout matches
  const quarters = tournament.matches.filter((m) => m.stage === 'quarter');
  const semis = tournament.matches.filter((m) => m.stage === 'semi');
  const finals = tournament.matches.filter((m) => m.stage === 'final');
  const thirdPlaces = tournament.matches.filter((m) => m.stage === 'third_place');

  const getTeam = (teamId: string) => {
    return teams.find((t) => t.id === teamId) || {
      id: teamId,
      name: teamId === 'BYE' ? 'Libre' : teamId ? 'Por definir' : 'TBD',
      shortName: 'TBD',
      color: '#475569',
      logoUrl: undefined as string | undefined,
      players: []
    };
  };

  const renderMatchBox = (m: Match) => {
    const home = getTeam(m.homeTeamId);
    const away = getTeam(m.awayTeamId);
    const isFinished = m.status === 'finished';
    const homeWon = isFinished && ((m.homeScore ?? 0) > (m.awayScore ?? 0) || ((m.homePenalties ?? 0) > (m.awayPenalties ?? 0)));
    const awayWon = isFinished && ((m.awayScore ?? 0) > (m.homeScore ?? 0) || ((m.awayPenalties ?? 0) > (m.homePenalties ?? 0)));

    return (
      <div 
        key={m.id}
        onClick={() => isAdmin && onEditMatch(m)}
        className={`w-64 bg-slate-900 border rounded-xl overflow-hidden shadow-lg transition-all ${
          isAdmin ? 'cursor-pointer hover:border-brand-500 hover:scale-[1.02]' : ''
        } ${isFinished ? 'border-slate-800' : 'border-slate-700/80'}`}
      >
        {/* Info header */}
        <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{m.pitch || 'Cancha'}</span>
          <span>{m.date ? `${m.date.split('-')[2]}/${m.date.split('-')[1]}` : ''} {m.time || ''}</span>
        </div>

        {/* Home Team Row */}
        <div className={`px-3 py-2 flex items-center justify-between border-b border-slate-800/60 ${homeWon ? 'bg-brand-500/10 font-bold' : ''}`}>
          <div className="flex items-center gap-2 min-w-0">
            <TeamBadge logoUrl={home.logoUrl} color={home.color} name={home.name} size={20} fallbackClassName="w-2.5 h-2.5 rounded-full" />
            <span className="text-xs text-white truncate max-w-[140px]">{home.name}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-sm">
            {isFinished ? (
              <span className={homeWon ? 'text-brand-400 font-bold' : 'text-slate-400'}>
                {m.homeScore ?? 0}
              </span>
            ) : (
              <span className="text-slate-600">-</span>
            )}
            {m.homePenalties !== undefined && (
              <span className="text-[10px] text-amber-400">({m.homePenalties})</span>
            )}
          </div>
        </div>

        {/* Away Team Row */}
        <div className={`px-3 py-2 flex items-center justify-between ${awayWon ? 'bg-brand-500/10 font-bold' : ''}`}>
          <div className="flex items-center gap-2 min-w-0">
            <TeamBadge logoUrl={away.logoUrl} color={away.color} name={away.name} size={20} fallbackClassName="w-2.5 h-2.5 rounded-full" />
            <span className="text-xs text-white truncate max-w-[140px]">{away.name}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-sm">
            {isFinished ? (
              <span className={awayWon ? 'text-brand-400 font-bold' : 'text-slate-400'}>
                {m.awayScore ?? 0}
              </span>
            ) : (
              <span className="text-slate-600">-</span>
            )}
            {m.awayPenalties !== undefined && (
              <span className="text-[10px] text-amber-400">({m.awayPenalties})</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const hasKnockouts = quarters.length > 0 || semis.length > 0 || finals.length > 0;

  if (!hasKnockouts) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
        <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">
          No hay llaves de eliminación configuradas
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Este torneo está configurado como Liga regular o aún no se han generado los cruces de playoffs (Cuartos, Semifinal y Final).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Cuadro de Eliminación Directa / Playoffs
          </h2>
        </div>
        {isAdmin && (
          <span className="text-xs text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
            💡 Haz click en cualquier partido para cargar el resultado
          </span>
        )}
      </div>

      <div className="overflow-x-auto pb-6">
        <div className="flex items-center gap-8 min-w-[750px] p-4">
          
          {/* Cuartos de Final if any */}
          {quarters.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider">
                Cuartos de Final
              </h3>
              <div className="space-y-6">
                {quarters.map(renderMatchBox)}
              </div>
            </div>
          )}

          {/* Semifinales */}
          {semis.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider">
                Semifinales
              </h3>
              <div className="space-y-12">
                {semis.map(renderMatchBox)}
              </div>
            </div>
          )}

          {/* Gran Final */}
          {finals.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-amber-400 text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Gran Final
              </h3>
              <div className="space-y-6">
                {finals.map(renderMatchBox)}

                {thirdPlaces.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-slate-800">
                    <h4 className="text-[11px] font-semibold text-slate-400 text-center mb-2">
                      3er y 4to Puesto
                    </h4>
                    {thirdPlaces.map(renderMatchBox)}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
