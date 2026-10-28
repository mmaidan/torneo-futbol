import React, { useState } from 'react';
import { Tournament, Match } from '../types/tournament';
import { MatchCard } from './MatchCard';
import { Calendar, Plus, Share2 } from 'lucide-react';
import { generateWhatsAppRoundFixtureText } from '../utils/exportUtils';

interface FixtureViewProps {
  tournament: Tournament;
  isAdmin: boolean;
  onEditMatch: (match: Match) => void;
  onUpdateMatches: (matches: Match[]) => void;
  onAddNewMatch: () => void;
}

export const FixtureView: React.FC<FixtureViewProps> = ({
  tournament,
  isAdmin,
  onEditMatch,
  onAddNewMatch,
}) => {
  const allRounds = Array.from(new Set(tournament.matches.map((m) => m.round))).sort((a, b) => a - b);
  
  // Default to first round with non-finished matches or round 1
  const activeInitialRound = allRounds.find((r) => 
    tournament.matches.some((m) => m.round === r && m.status !== 'finished')
  ) || allRounds[0] || 1;

  const [selectedRound, setSelectedRound] = useState<number>(activeInitialRound);

  const currentMatches = tournament.matches.filter((m) => m.round === selectedRound);

  const handleShareRound = () => {
    const text = generateWhatsAppRoundFixtureText(tournament, selectedRound);
    navigator.clipboard.writeText(text);
    alert(`¡Programación de la Fecha ${selectedRound} copiada para WhatsApp!`);
  };

  return (
    <div className="space-y-3">
      
      {/* Selector de Fechas (Carrusel táctil para celulares) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Fixture
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareRound}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              title="Copiar programación para WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {isAdmin && (
              <button
                onClick={onAddNewMatch}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Partido</span>
              </button>
            )}
          </div>
        </div>

        {/* Botones de Fecha */}
        {allRounds.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {allRounds.map((rnd) => (
              <button
                key={rnd}
                onClick={() => setSelectedRound(rnd)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedRound === rnd
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Fecha {rnd}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Lista de partidos de la fecha seleccionada */}
      {currentMatches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
          No hay partidos programados para la Fecha {selectedRound}.
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              teams={tournament.teams}
              isAdmin={isAdmin}
              onEditMatch={onEditMatch}
            />
          ))}
        </div>
      )}

    </div>
  );
};
