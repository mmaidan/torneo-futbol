import React from 'react';
import { Tournament, StandingRow } from '../types/tournament';
import { calculateStandings } from '../utils/standingsCalculator';
import { Share2, Trophy, Check, X, Minus } from 'lucide-react';
import { TeamBadge } from './TeamBadge';
import { generateWhatsAppStandingsText } from '../utils/exportUtils';

interface StandingsViewProps {
  tournament: Tournament;
}

/** Últimos 5 resultados: verde = ganó, gris = empató, rojo = perdió. El más reciente va a la derecha y resaltado. */
const FormDots: React.FC<{ form: ('W' | 'D' | 'L')[] }> = ({ form }) => {
  const last = form.slice(-5);
  const slots: (('W' | 'D' | 'L') | null)[] = [
    ...Array.from({ length: 5 - last.length }, () => null),
    ...last,
  ];
  return (
    <div className="flex items-center justify-center gap-[3px] sm:gap-1">
      {slots.map((r, i) => {
        const isLatest = i === slots.length - 1 && r !== null;
        const ring = isLatest ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-slate-900' : '';
        if (r === null) {
          return <span key={i} className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full border border-slate-700/70" />;
        }
        const cfg =
          r === 'W'
            ? { bg: 'bg-emerald-500', label: 'Ganó', Icon: Check }
            : r === 'L'
            ? { bg: 'bg-rose-500', label: 'Perdió', Icon: X }
            : { bg: 'bg-slate-500', label: 'Empató', Icon: Minus };
        return (
          <span
            key={i}
            title={cfg.label}
            className={`w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full flex items-center justify-center text-white ${cfg.bg} ${ring}`}
          >
            <cfg.Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3.5} />
          </span>
        );
      })}
    </div>
  );
};

export const StandingsView: React.FC<StandingsViewProps> = ({ tournament }) => {
  const standings: StandingRow[] = calculateStandings(
    tournament.teams,
    tournament.matches,
    tournament.config
  );

  const copyWhatsApp = () => {
    const text = generateWhatsAppStandingsText(tournament);
    navigator.clipboard.writeText(text);
    alert('¡Tabla de posiciones copiada para WhatsApp!');
  };

  return (
    <div className="space-y-3">
      
      {/* Barra superior simple */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-brand-400" />
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
            Posiciones
          </h2>
        </div>

        <button
          onClick={copyWhatsApp}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          title="Copiar para WhatsApp"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir WhatsApp</span>
        </button>
      </div>

      {/* Tabla de posiciones */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] font-semibold">
              <th className="py-2.5 pl-3 pr-1 text-center w-7">#</th>
              <th className="py-2.5 px-2">Club</th>
              <th className="py-2.5 px-1.5 text-center" title="Partidos jugados">PJ</th>
              <th className="py-2.5 px-1.5 text-center hidden sm:table-cell" title="Ganados">G</th>
              <th className="py-2.5 px-1.5 text-center hidden sm:table-cell" title="Empatados">E</th>
              <th className="py-2.5 px-1.5 text-center hidden sm:table-cell" title="Perdidos">P</th>
              <th className="py-2.5 px-1.5 text-center hidden sm:table-cell" title="Goles a favor">GF</th>
              <th className="py-2.5 px-1.5 text-center hidden sm:table-cell" title="Goles en contra">GC</th>
              <th className="py-2.5 px-1.5 text-center" title="Diferencia de gol">DG</th>
              <th className="py-2.5 px-2 text-center font-black text-brand-400 bg-brand-500/10" title="Puntos">Pts</th>
              <th className="py-2.5 px-2 text-center" title="Últimos 5 partidos">
                <span className="hidden sm:inline">Últimos 5</span>
                <span className="sm:hidden">Últ. 5</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {standings.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-6 text-center text-slate-500 text-xs">
                  No hay partidos registrados aún.
                </td>
              </tr>
            ) : (
              standings.map((row, idx) => (
                <tr
                  key={row.teamId}
                  className={`hover:bg-slate-800/40 transition-colors ${idx === 0 ? 'bg-brand-500/5' : ''}`}
                >
                  {/* Posición */}
                  <td className="py-3 pl-3 pr-1 text-center font-mono text-slate-300">{idx + 1}</td>

                  {/* Club: escudo + nombre */}
                  <td className="py-3 px-2 font-semibold text-ink">
                    <div className="flex items-center gap-2">
                      <TeamBadge
                        logoUrl={tournament.teams.find((t) => t.id === row.teamId)?.logoUrl}
                        color={row.teamColor || '#3b82f6'}
                        name={row.teamName}
                        size={28}
                        fallbackClassName="w-3 h-6 rounded-sm flex-shrink-0"
                      />
                      <span className="truncate max-w-[84px] min-[400px]:max-w-[120px] sm:max-w-none text-xs sm:text-sm">
                        {row.teamName}
                      </span>
                    </div>
                  </td>

                  {/* Estadísticas */}
                  <td className="py-3 px-1.5 text-center text-slate-300 font-mono">{row.played}</td>
                  <td className="py-3 px-1.5 text-center text-slate-300 font-mono hidden sm:table-cell">{row.won}</td>
                  <td className="py-3 px-1.5 text-center text-slate-300 font-mono hidden sm:table-cell">{row.drawn}</td>
                  <td className="py-3 px-1.5 text-center text-slate-300 font-mono hidden sm:table-cell">{row.lost}</td>
                  <td className="py-3 px-1.5 text-center text-slate-300 font-mono hidden sm:table-cell">{row.goalsFor}</td>
                  <td className="py-3 px-1.5 text-center text-slate-300 font-mono hidden sm:table-cell">{row.goalsAgainst}</td>
                  <td className="py-3 px-1.5 text-center font-mono text-slate-300">
                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                  </td>

                  {/* Puntos */}
                  <td className="py-3 px-2 text-center bg-brand-500/10">
                    <span className="inline-block min-w-[2rem] px-2 py-0.5 rounded-md bg-brand-600 text-white font-mono font-black text-sm sm:text-base shadow-sm">
                      {row.points}
                    </span>
                  </td>

                  {/* Últimos 5 */}
                  <td className="py-3 px-2">
                    <FormDots form={row.form} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

    </div>
  );
};
