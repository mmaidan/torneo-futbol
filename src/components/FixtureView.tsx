import React, { useState } from 'react';
import { Tournament, Match, Team } from '../types/tournament';
import { MatchCard } from './MatchCard';
import { Calendar, Plus, Share2, X, Swords } from 'lucide-react';
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
  onUpdateMatches,
}) => {
  const allRounds = Array.from(new Set(tournament.matches.map((m) => m.round))).sort((a, b) => a - b);
  
  // Default to first round with non-finished matches or round 1
  const activeInitialRound = allRounds.find((r) => 
    tournament.matches.some((m) => m.round === r && m.status !== 'finished')
  ) || allRounds[0] || 1;

  const [selectedRound, setSelectedRound] = useState<number>(activeInitialRound);
  const [isCreatingCruce, setIsCreatingCruce] = useState(false);

  // Form state for creating a cruce
  const [cruceRound, setCruceRound] = useState<number>(activeInitialRound);
  const [cruceHomeTeamId, setCruceHomeTeamId] = useState<string>(tournament.teams[0]?.id || '');
  const [cruceAwayTeamId, setCruceAwayTeamId] = useState<string>(tournament.teams[1]?.id || '');
  const [cruceDate, setCruceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [cruceTime, setCruceTime] = useState<string>('20:00');
  const [crucePitch, setCrucePitch] = useState<string>('Cancha 1');

  const currentMatches = tournament.matches.filter((m) => m.round === selectedRound);

  const handleShareRound = () => {
    const text = generateWhatsAppRoundFixtureText(tournament, selectedRound);
    navigator.clipboard.writeText(text);
    alert(`¡Programación de la Fecha ${selectedRound} copiada para WhatsApp!`);
  };

  const handleSaveCruce = () => {
    if (!cruceHomeTeamId || !cruceAwayTeamId) {
      alert('Debes seleccionar ambos equipos.');
      return;
    }
    if (cruceHomeTeamId === cruceAwayTeamId) {
      alert('El equipo local y visitante no pueden ser el mismo.');
      return;
    }

    const newMatch: Match = {
      id: `cruce_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      tournamentId: tournament.id,
      round: cruceRound,
      homeTeamId: cruceHomeTeamId,
      awayTeamId: cruceAwayTeamId,
      status: 'scheduled',
      date: cruceDate,
      time: cruceTime,
      pitch: crucePitch,
      events: []
    };

    const updated = [...tournament.matches, newMatch];
    onUpdateMatches(updated);
    setSelectedRound(cruceRound);
    setIsCreatingCruce(false);
  };

  const handleDeleteMatch = (matchId: string) => {
    if (window.confirm('¿Deseas eliminar este cruce / partido?')) {
      const updated = tournament.matches.filter((m) => m.id !== matchId);
      onUpdateMatches(updated);
    }
  };

  return (
    <div className="space-y-3">
      
      {/* Selector de Fechas (Carrusel táctil para celulares) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Cruces & Fixture
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
                onClick={() => {
                  setCruceRound(selectedRound);
                  setIsCreatingCruce(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Cruce</span>
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

      {/* Modal para Crear Cruce (Admin) */}
      {isCreatingCruce && (
        <div className="bg-slate-900 border border-brand-500/60 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Swords className="w-4 h-4 text-brand-400" />
              <span>Armar Nuevo Cruce (Fútbol 6)</span>
            </div>
            <button 
              onClick={() => setIsCreatingCruce(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Número de Fecha</label>
              <input
                type="number"
                min={1}
                value={cruceRound}
                onChange={(e) => setCruceRound(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cancha</label>
              <input
                type="text"
                placeholder="Cancha 1"
                value={crucePitch}
                onChange={(e) => setCrucePitch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Equipo Local</label>
              <select
                value={cruceHomeTeamId}
                onChange={(e) => setCruceHomeTeamId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium"
              >
                {tournament.teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Equipo Visitante</label>
              <select
                value={cruceAwayTeamId}
                onChange={(e) => setCruceAwayTeamId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium"
              >
                {tournament.teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Día del Partido</label>
              <input
                type="date"
                value={cruceDate}
                onChange={(e) => setCruceDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Horario</label>
              <input
                type="time"
                value={cruceTime}
                onChange={(e) => setCruceTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsCreatingCruce(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveCruce}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
            >
              Confirmar Cruce
            </button>
          </div>
        </div>
      )}

      {/* Lista de partidos de la fecha seleccionada */}
      {currentMatches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
          No hay partidos programados para la Fecha {selectedRound}.
          {isAdmin && (
            <div className="mt-2">
              <button
                onClick={() => {
                  setCruceRound(selectedRound);
                  setIsCreatingCruce(true);
                }}
                className="text-brand-400 font-semibold hover:underline"
              >
                + Armar el primer cruce de esta fecha
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentMatches.map((match) => (
            <div key={match.id} className="relative group">
              <MatchCard
                match={match}
                teams={tournament.teams}
                isAdmin={isAdmin}
                onEditMatch={onEditMatch}
              />
              {isAdmin && (
                <button
                  onClick={() => handleDeleteMatch(match.id)}
                  className="absolute top-2.5 right-2 sm:opacity-0 sm:group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 text-[11px] transition-all"
                  title="Eliminar este cruce"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
