import React, { useState } from 'react';
import { Tournament } from '../types/tournament';
import { calculateTopScorers, calculateFairPlay, calculatePlayerCards } from '../utils/standingsCalculator';
import { Flame, ShieldCheck } from 'lucide-react';
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
  const [tab, setTab] = useState<'scorers' | 'cards' | 'fairplay'>('scorers');
  const [cardType, setCardType] = useState<'yellow' | 'red'>('yellow');
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

  const cardItems: RankItem[] = playerCards
    .map((c) => ({
      key: c.playerId,
      title: c.playerName,
      subtitle: c.teamName,
      teamId: c.teamId,
      teamColor: c.teamColor,
      value: cardType === 'yellow' ? c.yellowCards : c.redCards,
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value || a.title.localeCompare(b.title));

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
        <button onClick={() => setTab('cards')} className={tabClass(tab === 'cards')}>
          <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-yellow-400" />
          <span>Tarjetas</span>
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

      {tab === 'cards' && (
        <div className="space-y-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-fit">
            <button
              onClick={() => setCardType('yellow')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                cardType === 'yellow' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-yellow-400" />
              Amarillas
            </button>
            <button
              onClick={() => setCardType('red')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                cardType === 'red' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-red-600" />
              Rojas
            </button>
          </div>
          <RankList
            title={cardType === 'yellow' ? 'Tarjetas amarillas' : 'Tarjetas rojas'}
            valueLabel="Cantidad"
            items={cardItems}
            empty={cardType === 'yellow' ? 'Aún no hay tarjetas amarillas.' : 'Aún no hay tarjetas rojas.'}
          />
        </div>
      )}

      {tab === 'fairplay' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 text-center w-8">#</th>
                <th className="py-2.5 px-3">Club</th>
                <th className="py-2.5 px-3 text-center" title="Amarillas">
                  <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-yellow-400 align-middle" />
                </th>
                <th className="py-2.5 px-3 text-center" title="Rojas">
                  <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-red-600 align-middle" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {fairPlayStats.map((stat, idx) => (
                <tr key={stat.teamId} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-ink">
                    <div className="flex items-center gap-3">
                      <TeamBadge
                        logoUrl={logoOf(stat.teamId)}
                        color={stat.teamColor}
                        name={stat.teamName}
                        size={32}
                        fallbackClassName="w-3 h-6 rounded-sm flex-shrink-0"
                      />
                      <span className="text-sm">{stat.teamName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-yellow-300 font-bold">{stat.yellowCards}</td>
                  <td className="py-3 px-3 text-center font-mono text-rose-400 font-bold">{stat.redCards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
