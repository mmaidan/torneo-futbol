import React, { useState } from 'react';
import { Tournament } from '../types/tournament';
import { calculateTopScorers, calculateFairPlay, calculatePlayerCards } from '../utils/standingsCalculator';
import { Flame, ShieldCheck, ChevronDown } from 'lucide-react';
import { TeamBadge } from './TeamBadge';

interface StatsViewProps {
  tournament: Tournament;
}

/** Posición con empates: 1=, 1=, 3, 4, 5=, 5= ... */
function rankLabels(values: number[]): string[] {
  return values.map((v) => {
    const first = values.indexOf(v);
    const tied = values.filter((x) => x === v).length > 1;
    return `${first + 1}${tied ? '=' : ''}`;
  });
}

interface RankItem {
  key: string;
  title: string;
  subtitle: string;
  teamId: string;
  teamColor: string;
  value: number;
}

export const StatsView: React.FC<StatsViewProps> = ({ tournament }) => {
  const [tab, setTab] = useState<'scorers' | 'fairplay'>('scorers');
  const [openTeamId, setOpenTeamId] = useState<string | null>(null);
  const logoOf = (teamId: string) => tournament.teams.find((t) => t.id === teamId)?.logoUrl;

  const topScorers = calculateTopScorers(tournament.teams, tournament.matches);
  const fairPlayStats = calculateFairPlay(tournament.teams, tournament.matches);
  const playerCards = calculatePlayerCards(tournament.teams, tournament.matches);

  const scorerItems: RankItem[] = topScorers.map((s) => ({
    key: s.playerId,
    title: s.playerName,
    subtitle: s.teamName,
    teamId: s.teamId,
    teamColor: s.teamColor,
    value: s.goals,
  }));

  // Fair Play: menos puntos = mejor conducta (amarilla 1, roja 3). El mejor grupo va resaltado,
  // salvo que todos estén igualados (por ejemplo, si todavía no hay tarjetas).
  const fpLabels = rankLabels(fairPlayStats.map((f) => f.pointsDeducted));
  const fpBest = fairPlayStats.length > 0 ? fairPlayStats[0].pointsDeducted : 0;
  const fpWorst = fairPlayStats.length > 0 ? fairPlayStats[fairPlayStats.length - 1].pointsDeducted : 0;
  const fpHasBest = fpBest < fpWorst;

  /** Lista con el estilo de ranking: puesto, escudo, jugador + club y cantidad. El primer puesto va resaltado. */
  const RankList: React.FC<{
    title: string;
    valueLabel: string;
    items: RankItem[];
    empty: string;
  }> = ({ title, valueLabel, items, empty }) => {
    const labels = rankLabels(items.map((i) => i.value));
    const topValue = items.length > 0 ? items[0].value : 0;
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-ink">{title}</h2>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{valueLabel}</span>
        </div>
        {items.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">{empty}</div>
        ) : (
          <ul className="divide-y divide-slate-800/80">
            {items.map((it, idx) => {
              const isTop = it.value === topValue;
              return (
                <li
                  key={it.key}
                  className={`grid grid-cols-[2.25rem,auto,1fr,auto] items-center gap-3 px-3 ${
                    isTop ? 'py-3 bg-brand-600 text-white' : 'py-2 hover:bg-slate-800/40'
                  }`}
                >
                  <span className={`text-center font-mono font-bold ${isTop ? 'text-lg' : 'text-xs text-slate-400'}`}>
                    {labels[idx]}
                  </span>
                  <TeamBadge
                    logoUrl={logoOf(it.teamId)}
                    color={it.teamColor}
                    name={it.subtitle}
                    size={isTop ? 40 : 30}
                    fallbackClassName={isTop ? 'w-4 h-8 rounded-sm flex-shrink-0' : 'w-3 h-6 rounded-sm flex-shrink-0'}
                  />
                  <div className="min-w-0">
                    <div className={`truncate font-bold ${isTop ? 'text-base text-white' : 'text-sm text-ink'}`}>
                      {it.title}
                    </div>
                    <div className={`truncate ${isTop ? 'text-xs text-white/80' : 'text-[11px] text-slate-400'}`}>
                      {it.subtitle}
                    </div>
                  </div>
                  <span className={`font-mono font-black text-right ${isTop ? 'text-2xl text-white' : 'text-base text-ink'}`}>
                    {it.value}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  const tabClass = (active: boolean) =>
    `flex-1 py-2 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
      active ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <div className="space-y-3">
      {/* Selector */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        <button onClick={() => setTab('scorers')} className={tabClass(tab === 'scorers')}>
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Goleadores</span>
        </button>
        <button onClick={() => setTab('fairplay')} className={tabClass(tab === 'fairplay')}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fair Play</span>
        </button>
      </div>

      {tab === 'scorers' && (
        <RankList
          title="Goleadores"
          valueLabel="Goles"
          items={scorerItems}
          empty="Aún no hay goles registrados en este torneo."
        />
      )}

      {tab === 'fairplay' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-ink">Fair Play</h2>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Puntos</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Amarilla = 1 punto, roja = 3. Menos puntos, mejor conducta. Tocá un club para ver sus jugadores.
            </p>
          </div>

          {fairPlayStats.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">Aún no hay equipos en este torneo.</div>
          ) : (
            <ul className="divide-y divide-slate-800/80">
              {fairPlayStats.map((stat, idx) => {
                const isBest = fpHasBest && stat.pointsDeducted === fpBest;
                const isOpen = openTeamId === stat.teamId;
                const players = playerCards
                  .filter((c) => c.teamId === stat.teamId)
                  .sort(
                    (a, b) =>
                      b.yellowCards + b.redCards * 3 - (a.yellowCards + a.redCards * 3) ||
                      a.playerName.localeCompare(b.playerName)
                  );
                const hasCards = stat.yellowCards + stat.redCards > 0;
                return (
                  <li key={stat.teamId}>
                    <button
                      type="button"
                      onClick={() => setOpenTeamId(isOpen ? null : stat.teamId)}
                      aria-expanded={isOpen}
                      className={`w-full grid grid-cols-[2rem,auto,1fr,auto,auto,2.5rem,auto] items-center gap-2 sm:gap-3 px-3 text-left transition-colors ${
                        isBest ? 'py-3 bg-brand-600 text-white' : 'py-2.5 hover:bg-slate-800/40'
                      }`}
                    >
                      <span className={`text-center font-mono font-bold ${isBest ? 'text-lg' : 'text-xs text-slate-400'}`}>
                        {fpLabels[idx]}
                      </span>
                      <TeamBadge
                        logoUrl={logoOf(stat.teamId)}
                        color={stat.teamColor}
                        name={stat.teamName}
                        size={isBest ? 40 : 34}
                        fallbackClassName="w-3 h-7 rounded-sm flex-shrink-0"
                      />
                      <span className={`truncate font-bold ${isBest ? 'text-base text-white' : 'text-sm text-ink'}`}>
                        {stat.teamName}
                      </span>
                      <span className="flex items-center gap-1 font-mono font-bold text-sm">
                        <span className="inline-block w-2 h-3 rounded-[2px] bg-yellow-400" />
                        <span className={isBest ? 'text-white' : 'text-yellow-300'}>{stat.yellowCards}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono font-bold text-sm">
                        <span className="inline-block w-2 h-3 rounded-[2px] bg-red-600" />
                        <span className={isBest ? 'text-white' : 'text-rose-400'}>{stat.redCards}</span>
                      </span>
                      <span className={`text-right font-mono font-black ${isBest ? 'text-2xl text-white' : 'text-base text-ink'}`}>
                        {stat.pointsDeducted}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${
                          isBest ? 'text-white/80' : 'text-slate-500'
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="bg-slate-950/60 border-t border-slate-800/80 px-4 py-2">
                        {!hasCards || players.length === 0 ? (
                          <p className="py-2 text-xs text-slate-500">
                            {hasCards
                              ? 'Hay tarjetas, pero ninguna está asignada a un jugador.'
                              : 'Este club no tiene tarjetas. ¡Buena conducta!'}
                          </p>
                        ) : (
                          <ul className="divide-y divide-slate-800/60">
                            {players.map((pl) => (
                              <li key={pl.playerId} className="flex items-center justify-between gap-3 py-1.5 text-xs">
                                <span className="truncate font-semibold text-ink">{pl.playerName}</span>
                                <span className="flex items-center gap-3 font-mono font-bold flex-shrink-0">
                                  {pl.yellowCards > 0 && (
                                    <span className="flex items-center gap-1 text-yellow-300">
                                      <span className="inline-block w-2 h-3 rounded-[2px] bg-yellow-400" />
                                      {pl.yellowCards}
                                    </span>
                                  )}
                                  {pl.redCards > 0 && (
                                    <span className="flex items-center gap-1 text-rose-400">
                                      <span className="inline-block w-2 h-3 rounded-[2px] bg-red-600" />
                                      {pl.redCards}
                                    </span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
