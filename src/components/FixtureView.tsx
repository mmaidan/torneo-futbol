import React, { useState } from 'react';
import { Tournament, Match, Team } from '../types/tournament';
import { MatchCard } from './MatchCard';
import { 
  Calendar, 
  Plus, 
  Share2, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { generateLeagueFixture, generateGroupsFixture } from '../utils/fixtureGenerator';
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
  onAddNewMatch,
}) => {
  // Find all distinct round numbers
  const allRounds = Array.from(new Set(tournament.matches.map((m) => m.round))).sort((a, b) => a - b);
  
  // Default to the first round with non-finished matches, or round 1
  const activeInitialRound = allRounds.find((r) => 
    tournament.matches.some((m) => m.round === r && m.status !== 'finished')
  ) || allRounds[0] || 1;

  const [selectedRound, setSelectedRound] = useState<number | 'all'>(activeInitialRound);
  const [filterTeamId, setFilterTeamId] = useState<string>('all');
  const [filterPitch, setFilterPitch] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter matches
  const filteredMatches = tournament.matches.filter((m) => {
    if (selectedRound !== 'all' && m.round !== selectedRound) return false;
    if (filterTeamId !== 'all' && m.homeTeamId !== filterTeamId && m.awayTeamId !== filterTeamId) return false;
    if (filterPitch !== 'all' && m.pitch !== filterPitch) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    return true;
  });

  // Extract distinct pitches
  const pitches = Array.from(
    new Set(tournament.matches.map((m) => m.pitch).filter(Boolean) as string[])
  );

  const handleShareRound = () => {
    if (typeof selectedRound === 'number') {
      const text = generateWhatsAppRoundFixtureText(tournament, selectedRound);
      navigator.clipboard.writeText(text);
      alert(`¡Programación de la Fecha ${selectedRound} copiada para WhatsApp!`);
    } else {
      alert('Por favor selecciona una fecha específica para copiar su programación.');
    }
  };

  const handleRegenerateFixture = () => {
    if (window.confirm('¿Deseas generar el fixture automático para todos los equipos? (Los partidos actuales se reemplazarán)')) {
      let newMatches: Match[] = [];
      if (tournament.format === 'groups_playoffs' && tournament.groups) {
        newMatches = generateGroupsFixture(tournament.id, tournament.groups, tournament.teams);
      } else {
        newMatches = generateLeagueFixture(tournament.id, tournament.teams, {
          startDate: new Date().toISOString().split('T')[0],
        });
      }
      onUpdateMatches(newMatches);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Bar: Round Navigator & Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Calendario & Fixture
            </h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {tournament.matches.length} partidos
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {typeof selectedRound === 'number' && (
              <button
                onClick={handleShareRound}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                title="Copiar programación de esta fecha para WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir Fecha {selectedRound}</span>
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={onAddNewMatch}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Partido</span>
                </button>

                <button
                  onClick={handleRegenerateFixture}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Generar fixture automático con algoritmo Round Robin"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
                  <span className="hidden md:inline">Auto-Fixture</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Round Tabs (Pills) */}
        {allRounds.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => setSelectedRound('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedRound === 'all'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todas las Fechas
            </button>

            {allRounds.map((rnd) => {
              const isFinishedRound = tournament.matches
                .filter((m) => m.round === rnd)
                .every((m) => m.status === 'finished');

              return (
                <button
                  key={rnd}
                  onClick={() => setSelectedRound(rnd)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedRound === rnd
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>Fecha {rnd}</span>
                  {isFinishedRound && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Fecha completa" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          {/* Team filter */}
          <div>
            <select
              value={filterTeamId}
              onChange={(e) => setFilterTeamId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
            >
              <option value="all">🔍 Filtrar por Equipo (Todos)</option>
              {tournament.teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Pitch filter */}
          <div>
            <select
              value={filterPitch}
              onChange={(e) => setFilterPitch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
            >
              <option value="all">📍 Todas las Canchas</option>
              {pitches.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
            >
              <option value="all">⚡ Todos los Estados</option>
              <option value="scheduled">Programados</option>
              <option value="live">En Vivo (Live)</option>
              <option value="finished">Finalizados</option>
            </select>
          </div>
        </div>

      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            No se encontraron partidos
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            No hay partidos programados con los filtros seleccionados.
          </p>
          {isAdmin && (
            <button
              onClick={handleRegenerateFixture}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generar Fixture Automático</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match) => (
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
