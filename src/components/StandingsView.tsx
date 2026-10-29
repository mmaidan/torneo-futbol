import React from 'react';
import { Tournament, StandingRow } from '../types/tournament';
import { calculateStandings } from '../utils/standingsCalculator';
import { Share2, Trophy } from 'lucide-react';
import { TeamBadge } from './TeamBadge';
import { generateWhatsAppStandingsText } from '../utils/exportUtils';

interface StandingsViewProps {
  tournament: Tournament;
}

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
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
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

      {/* Tabla limpia optimizada para celular */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-2.5 text-center w-8">#</th>
              <th className="py-2.5 px-2">Equipo</th>
              <th className="py-2.5 px-2 text-center" title="Partidos Jugados">PJ</th>
              <th className="py-2.5 px-2 text-center hidden sm:table-cell" title="Ganados">PG</th>
              <th className="py-2.5 px-2 text-center hidden sm:table-cell" title="Empatados">PE</th>
              <th className="py-2.5 px-2 text-center hidden sm:table-cell" title="Perdidos">PP</th>
              <th className="py-2.5 px-2 text-center" title="Diferencia de Gol">DG</th>
              <th className="py-2.5 px-3 text-center font-bold text-white w-12" title="Puntos">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {standings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500 text-xs">
                  No hay partidos registrados aún.
                </td>
              </tr>
            ) : (
              standings.map((row, idx) => {
                const isFirst = idx === 0;
                return (
                  <tr 
                    key={row.teamId}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isFirst ? 'bg-brand-500/5' : ''
                    }`}
                  >
                    {/* Posición */}
                    <td className="py-2.5 px-2 text-center font-bold font-mono">
                      {idx + 1}
                    </td>

                    {/* Equipo */}
                    <td className="py-2.5 px-2 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <TeamBadge
                          logoUrl={tournament.teams.find((t) => t.id === row.teamId)?.logoUrl}
                          color={row.teamColor || '#3b82f6'}
                          name={row.teamName}
                          size={24}
                          fallbackClassName="w-2.5 h-4 sm:w-3 sm:h-5 rounded-xs flex-shrink-0"
                        />
                        <span className="truncate max-w-[130px] sm:max-w-none text-xs sm:text-sm">
                          {row.teamName}
                        </span>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-2.5 px-2 text-center text-slate-300 font-mono">{row.played}</td>
                    <td className="py-2.5 px-2 text-center text-emerald-400 font-mono hidden sm:table-cell">{row.won}</td>
                    <td className="py-2.5 px-2 text-center text-slate-400 font-mono hidden sm:table-cell">{row.drawn}</td>
                    <td className="py-2.5 px-2 text-center text-rose-400 font-mono hidden sm:table-cell">{row.lost}</td>
                    
                    {/* DG */}
                    <td className="py-2.5 px-2 text-center font-mono font-medium">
                      <span className={row.goalDiff > 0 ? 'text-emerald-400' : row.goalDiff < 0 ? 'text-rose-400' : 'text-slate-400'}>
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </span>
                    </td>

                    {/* PTS */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-950 font-black text-xs sm:text-sm text-brand-400 font-mono border border-brand-500/20">
                        {row.points}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
