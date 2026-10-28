import React, { useState } from 'react';
import { Tournament } from '../types/tournament';
import { calculateTopScorers, calculateFairPlay } from '../utils/standingsCalculator';
import { Flame, ShieldCheck } from 'lucide-react';

interface StatsViewProps {
  tournament: Tournament;
}

export const StatsView: React.FC<StatsViewProps> = ({ tournament }) => {
  const [tab, setTab] = useState<'scorers' | 'fairplay'>('scorers');

  const topScorers = calculateTopScorers(tournament.teams, tournament.matches);
  const fairPlayStats = calculateFairPlay(tournament.teams, tournament.matches);

  return (
    <div className="space-y-3">
      {/* Selector simple */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setTab('scorers')}
          className={`flex-1 py-2 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'scorers' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Tabla de Goleadores</span>
        </button>
        <button
          onClick={() => setTab('fairplay')}
          className={`flex-1 py-2 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'fairplay' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fair Play / Tarjetas</span>
        </button>
      </div>

      {tab === 'scorers' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 text-center w-8">#</th>
                <th className="py-2.5 px-3">Jugador</th>
                <th className="py-2.5 px-3">Equipo</th>
                <th className="py-2.5 px-3 text-center font-bold text-white w-14">Goles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {topScorers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                    Aún no hay goles registrados en este torneo.
                  </td>
                </tr>
              ) : (
                topScorers.map((scorer, idx) => (
                  <tr key={scorer.playerId} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-center font-bold font-mono">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white truncate max-w-[140px]">
                      {scorer.playerName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: scorer.teamColor }}
                        />
                        <span className="truncate max-w-[110px] sm:max-w-none">{scorer.teamName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-black text-sm">
                        {scorer.goals}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 text-center w-8">#</th>
                <th className="py-2.5 px-3">Equipo</th>
                <th className="py-2.5 px-3 text-center text-yellow-400">🟨</th>
                <th className="py-2.5 px-3 text-center text-rose-400">🟥</th>
                <th className="py-2.5 px-3 text-center">Pts Sanción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {fairPlayStats.map((stat, idx) => (
                <tr key={stat.teamId} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stat.teamColor }}
                      />
                      <span>{stat.teamName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-yellow-300 font-bold">{stat.yellowCards}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-rose-400 font-bold">{stat.redCards}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300 font-bold">{stat.pointsDeducted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
