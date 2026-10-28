import React, { useState } from 'react';
import { Tournament } from '../types/tournament';
import { 
  calculateTopScorers, 
  calculateFairPlay, 
  calculateBestDefense 
} from '../utils/standingsCalculator';
import { 
  Flame, 
  ShieldCheck, 
  Award, 
  Trophy, 
  AlertTriangle,
  Medal
} from 'lucide-react';

interface StatsViewProps {
  tournament: Tournament;
}

export const StatsView: React.FC<StatsViewProps> = ({ tournament }) => {
  const [activeTab, setActiveTab] = useState<'scorers' | 'fairplay' | 'defense'>('scorers');

  const topScorers = calculateTopScorers(tournament.teams, tournament.matches);
  const fairPlayStats = calculateFairPlay(tournament.teams, tournament.matches);
  const bestDefenseStats = calculateBestDefense(tournament.teams, tournament.matches);

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('scorers')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'scorers'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Tabla de Goleadores</span>
        </button>

        <button
          onClick={() => setActiveTab('fairplay')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'fairplay'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Fair Play & Disciplina</span>
        </button>

        <button
          onClick={() => setActiveTab('defense')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'defense'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-blue-400" />
          <span>Valla Menos Vencida</span>
        </button>
      </div>

      {/* Tab 1: Top Scorers */}
      {activeTab === 'scorers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Máximos Anotadores
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {topScorers.length} goleadores
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4 text-center w-12">Pos</th>
                  <th className="py-3 px-4">Jugador</th>
                  <th className="py-3 px-4">Equipo</th>
                  <th className="py-3 px-4 text-center font-bold text-white w-20">Goles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {topScorers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                      Aún no se han registrado goles en este torneo.
                    </td>
                  </tr>
                ) : (
                  topScorers.map((scorer, idx) => {
                    const isPodium = idx < 3;
                    return (
                      <tr key={scorer.playerId} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-center font-bold font-mono">
                          {idx === 0 ? (
                            <span className="inline-flex w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 items-center justify-center text-xs">
                              🥇
                            </span>
                          ) : idx === 1 ? (
                            <span className="inline-flex w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/30 items-center justify-center text-xs">
                              🥈
                            </span>
                          ) : idx === 2 ? (
                            <span className="inline-flex w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/30 items-center justify-center text-xs">
                              🥉
                            </span>
                          ) : (
                            <span className="text-slate-500">{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{scorer.playerName}</span>
                            {scorer.playerNumber && (
                              <span className="text-[10px] font-mono text-slate-500">
                                #{scorer.playerNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: scorer.teamColor }}
                            />
                            <span>{scorer.teamName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 font-mono font-black text-sm sm:text-base border border-amber-500/20">
                            {scorer.goals}
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
      )}

      {/* Tab 2: Fair Play */}
      {activeTab === 'fairplay' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Ranking de Conducta y Fair Play
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              🟨 = 1 pt penalización | 🟥 = 3 pts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4 text-center w-12">Pos</th>
                  <th className="py-3 px-4">Equipo</th>
                  <th className="py-3 px-4 text-center text-yellow-400">🟨 Amarillas</th>
                  <th className="py-3 px-4 text-center text-rose-400">🟥 Rojas</th>
                  <th className="py-3 px-4 text-center font-bold text-white">Pts Descuento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {fairPlayStats.map((stat, idx) => (
                  <tr key={stat.teamId} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: stat.teamColor }}
                        />
                        <span>{stat.teamName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-yellow-300">
                      {stat.yellowCards}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-rose-400">
                      {stat.redCards}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-950 font-mono font-bold text-xs text-slate-300 border border-slate-800">
                        {stat.pointsDeducted} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Best Defense */}
      {activeTab === 'defense' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Valla Menos Vencida
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Promedio de goles recibidos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4 text-center w-12">Pos</th>
                  <th className="py-3 px-4">Equipo</th>
                  <th className="py-3 px-4 text-center">Partidos</th>
                  <th className="py-3 px-4 text-center text-slate-300">Goles en Contra</th>
                  <th className="py-3 px-4 text-center font-bold text-blue-400">Promedio / Partido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bestDefenseStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                      No hay partidos finalizados aún.
                    </td>
                  </tr>
                ) : (
                  bestDefenseStats.map((def, idx) => (
                    <tr key={def.teamId} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-center font-bold font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: def.teamColor }}
                          />
                          <span>{def.teamName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {def.matchesPlayed}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                        {def.goalsConceded}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-400">
                        {def.averageGoalsConceded}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
