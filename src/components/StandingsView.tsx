import React, { useState } from 'react';
import { Tournament, StandingRow } from '../types/tournament';
import { calculateStandings } from '../utils/standingsCalculator';
import { 
  Trophy, 
  Share2, 
  Printer, 
  Award, 
  TrendingUp, 
  Shield 
} from 'lucide-react';
import { generateWhatsAppStandingsText } from '../utils/exportUtils';

interface StandingsViewProps {
  tournament: Tournament;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ tournament }) => {
  const isGroupFormat = tournament.format === 'groups_playoffs' && tournament.groups && tournament.groups.length > 0;
  const [selectedGroup, setSelectedGroup] = useState<string>(
    isGroupFormat ? tournament.groups![0].name : ''
  );

  const standings: StandingRow[] = calculateStandings(
    tournament.teams,
    tournament.matches,
    tournament.config,
    isGroupFormat ? selectedGroup : undefined
  );

  const copyWhatsApp = () => {
    const text = generateWhatsAppStandingsText(tournament);
    navigator.clipboard.writeText(text);
    alert('¡Tabla de posiciones copiada para WhatsApp!');
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Group Tabs if any, Share & Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
        
        {/* Groups switcher */}
        {isGroupFormat ? (
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {tournament.groups!.map((grp) => (
              <button
                key={grp.name}
                onClick={() => setSelectedGroup(grp.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedGroup === grp.name
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {grp.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-300">
            <Trophy className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Tabla General de Posiciones
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Imprimir tabla"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={copyWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm shadow-emerald-600/20"
            title="Copiar texto para WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copiar para WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold text-[11px] sm:text-xs uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-10">Pos</th>
                <th className="py-3.5 px-3 sm:px-4">Equipo</th>
                <th className="py-3.5 px-2 text-center" title="Partidos Jugados">PJ</th>
                <th className="py-3.5 px-2 text-center" title="Partidos Ganados">PG</th>
                <th className="py-3.5 px-2 text-center" title="Partidos Empatados">PE</th>
                <th className="py-3.5 px-2 text-center" title="Partidos Perdidos">PP</th>
                <th className="py-3.5 px-2 text-center hidden md:table-cell" title="Goles a Favor">GF</th>
                <th className="py-3.5 px-2 text-center hidden md:table-cell" title="Goles en Contra">GC</th>
                <th className="py-3.5 px-2 text-center" title="Diferencia de Goles">DG</th>
                <th className="py-3.5 px-3 text-center font-bold text-white" title="Puntos">PTS</th>
                <th className="py-3.5 px-3 text-center hidden sm:table-cell" title="Últimos 5 partidos">Forma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {standings.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 text-xs">
                    No hay equipos registrados o partidos finalizados en este grupo aún.
                  </td>
                </tr>
              ) : (
                standings.map((row, idx) => {
                  const isLeader = idx === 0;
                  const isPlayoffZone = idx > 0 && idx < 4; // Top 4 advance
                  
                  return (
                    <tr 
                      key={row.teamId}
                      className={`transition-colors hover:bg-slate-800/50 ${
                        isLeader ? 'bg-brand-500/5' : ''
                      }`}
                    >
                      {/* Position */}
                      <td className="py-3 px-3 text-center font-bold font-mono">
                        <div className="flex items-center justify-center">
                          {isLeader ? (
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs">
                              1
                            </span>
                          ) : isPlayoffZone ? (
                            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs">
                              {idx + 1}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team Name and Badge */}
                      <td className="py-3 px-3 sm:px-4 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-3.5 h-6 sm:w-4 sm:h-7 rounded-sm flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: row.teamColor || '#3b82f6' }}
                          />
                          <div className="min-w-0">
                            <span className="block truncate max-w-[150px] sm:max-w-none text-sm">
                              {row.teamName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono sm:hidden">
                              {row.teamShortName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="py-3 px-2 text-center text-slate-300 font-mono">{row.played}</td>
                      <td className="py-3 px-2 text-center text-emerald-400 font-mono font-medium">{row.won}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-mono">{row.drawn}</td>
                      <td className="py-3 px-2 text-center text-rose-400 font-mono">{row.lost}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-mono hidden md:table-cell">{row.goalsFor}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-mono hidden md:table-cell">{row.goalsAgainst}</td>
                      
                      {/* Goal Difference */}
                      <td className="py-3 px-2 text-center font-mono font-bold">
                        <span className={row.goalDiff > 0 ? 'text-emerald-400' : row.goalDiff < 0 ? 'text-rose-400' : 'text-slate-400'}>
                          {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-950 font-black text-sm sm:text-base text-brand-400 font-mono border border-brand-500/20">
                          {row.points}
                        </span>
                      </td>

                      {/* Recent Form (W/D/L) */}
                      <td className="py-3 px-3 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {row.form.length === 0 ? (
                            <span className="text-slate-600 text-xs">-</span>
                          ) : (
                            row.form.map((res, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                                  res === 'W'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : res === 'D'
                                      ? 'bg-amber-400 text-slate-950'
                                      : 'bg-rose-500 text-white'
                                }`}
                                title={res === 'W' ? 'Ganado' : res === 'D' ? 'Empatado' : 'Perdido'}
                              >
                                {res}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>1° Puesto / Campeón</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>Zona Clasificación Playoffs (Top 4)</span>
          </div>
          <div className="ml-auto text-slate-500">
            Criterio desempate: PTS &gt; DG &gt; GF &gt; Fair Play
          </div>
        </div>
      </div>
    </div>
  );
};
