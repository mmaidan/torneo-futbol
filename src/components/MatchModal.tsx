import React, { useState } from 'react';
import { Match, Team, MatchEvent, EventType } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { 
  X, 
  Save, 
  Plus, 
  Minus, 
  Trash2, 
  Trophy, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchModalProps {
  match: Match | null;
  teams: Team[];
  onClose: () => void;
  onSave: (updatedMatch: Match) => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  match,
  teams,
  onClose,
  onSave,
}) => {
  if (!match) return null;

  const homeTeam = teams.find((t) => t.id === match.homeTeamId) || {
    id: match.homeTeamId,
    name: 'Equipo Local',
    shortName: 'LOC',
    color: '#3b82f6',
    logoUrl: undefined as string | undefined,
    players: [],
  };

  const awayTeam = teams.find((t) => t.id === match.awayTeamId) || {
    id: match.awayTeamId,
    name: 'Equipo Visitante',
    shortName: 'VIS',
    color: '#ef4444',
    logoUrl: undefined as string | undefined,
    players: [],
  };

  const [homeScore, setHomeScore] = useState<number>(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match.awayScore ?? 0);
  const [homePenalties, setHomePenalties] = useState<string>(
    match.homePenalties !== undefined ? String(match.homePenalties) : ''
  );
  const [awayPenalties, setAwayPenalties] = useState<string>(
    match.awayPenalties !== undefined ? String(match.awayPenalties) : ''
  );
  const [status, setStatus] = useState<Match['status']>(match.status || 'scheduled');
  const [date, setDate] = useState<string>(match.date || '');
  const [time, setTime] = useState<string>(match.time || '');
  const [pitch, setPitch] = useState<string>(match.pitch || 'Cancha 1');
  const [referee, setReferee] = useState<string>(match.referee || '');
  const [events, setEvents] = useState<MatchEvent[]>(match.events || []);
  const [mvpPlayerId, setMvpPlayerId] = useState<string>(match.mvpPlayerId || '');

  // State to quickly add new event
  const [selectedTeamId, setSelectedTeamId] = useState<string>(homeTeam.id);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [eventType, setEventType] = useState<EventType>('goal');
  const [eventMinute, setEventMinute] = useState<string>('');

  const activeTeam = selectedTeamId === homeTeam.id ? homeTeam : awayTeam;

  const handleAddEvent = () => {
    if (!selectedPlayerId) return;

    const newEvent: MatchEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      matchId: match.id,
      teamId: selectedTeamId,
      playerId: selectedPlayerId,
      type: eventType,
      minute: eventMinute ? parseInt(eventMinute, 10) : undefined,
    };

    setEvents((prev) => [...prev, newEvent]);

    // Automatically update score if it's a goal
    if (eventType === 'goal') {
      if (selectedTeamId === homeTeam.id) {
        setHomeScore((s) => s + 1);
      } else {
        setAwayScore((s) => s + 1);
      }
    }

    setEventMinute('');
  };

  const handleRemoveEvent = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId);
    if (ev && ev.type === 'goal') {
      if (ev.teamId === homeTeam.id) {
        setHomeScore((s) => Math.max(0, s - 1));
      } else {
        setAwayScore((s) => Math.max(0, s - 1));
      }
    }
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleSave = () => {
    if (status === 'finished' && match.stage === 'final') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    const updated: Match = {
      ...match,
      homeScore,
      awayScore,
      homePenalties: homePenalties !== '' ? parseInt(homePenalties, 10) : undefined,
      awayPenalties: awayPenalties !== '' ? parseInt(awayPenalties, 10) : undefined,
      status,
      date,
      time,
      pitch,
      referee,
      events,
      mvpPlayerId: mvpPlayerId || undefined,
    };

    onSave(updated);
    onClose();
  };

  const allPlayers = [
    ...(homeTeam.players || []).map((p) => ({ ...p, teamName: homeTeam.name })),
    ...(awayTeam.players || []).map((p) => ({ ...p, teamName: awayTeam.name }))
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Planilla de Partido & Resultados
              </h2>
              <p className="text-xs text-slate-400">
                {match.stage && match.stage !== 'group' ? match.stage.toUpperCase() : `Fecha ${match.round}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Status and Scheduling row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Match['status'])}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="scheduled">Programado</option>
                <option value="finished">Finalizado</option>
                <option value="postponed">Postergado</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cancha</label>
              <input
                type="text"
                placeholder="Cancha 1"
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Big Scoreboard Controls */}
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="grid grid-cols-2 gap-4 items-center">
              
              {/* Home Team Score Control */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <TeamBadge logoUrl={homeTeam.logoUrl} color={homeTeam.color} name={homeTeam.name} size={28} fallbackClassName="w-3.5 h-3.5 rounded-full" />
                  <span className="font-bold text-sm sm:text-base text-white text-center truncate max-w-[140px]">
                    {homeTeam.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 my-2">
                  <button
                    type="button"
                    onClick={() => setHomeScore((s) => Math.max(0, s - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-4xl sm:text-5xl font-mono font-black text-white w-14 text-center">
                    {homeScore}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHomeScore((s) => s + 1)}
                    className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">Local</span>
              </div>

              {/* Away Team Score Control */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <TeamBadge logoUrl={awayTeam.logoUrl} color={awayTeam.color} name={awayTeam.name} size={28} fallbackClassName="w-3.5 h-3.5 rounded-full" />
                  <span className="font-bold text-sm sm:text-base text-white text-center truncate max-w-[140px]">
                    {awayTeam.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 my-2">
                  <button
                    type="button"
                    onClick={() => setAwayScore((s) => Math.max(0, s - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-4xl sm:text-5xl font-mono font-black text-white w-14 text-center">
                    {awayScore}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAwayScore((s) => s + 1)}
                    className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">Visitante</span>
              </div>

            </div>

            {/* Penalties shootout inputs if applicable */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-4 text-xs">
              <span className="text-slate-400">¿Definición por Penales?</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Pen. Loc"
                  value={homePenalties}
                  onChange={(e) => setHomePenalties(e.target.value)}
                  className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center font-mono text-white text-xs"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  placeholder="Pen. Vis"
                  value={awayPenalties}
                  onChange={(e) => setAwayPenalties(e.target.value)}
                  className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center font-mono text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Add Match Event Section (Goals, Cards) */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚽</span> Cargar Evento (Goles, Tarjetas)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {/* Select Team */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Equipo</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    setSelectedPlayerId('');
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value={homeTeam.id}>{homeTeam.name}</option>
                  <option value={awayTeam.id}>{awayTeam.name}</option>
                </select>
              </div>

              {/* Select Player */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Jugador</label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="">-- Seleccionar --</option>
                  {(activeTeam.players || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.number ? `#${p.number} ` : ''}{p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tipo de Evento</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="goal">⚽ Gol</option>
                  <option value="yellow_card">🟨 Tarjeta Amarilla</option>
                  <option value="red_card">🟥 Tarjeta Roja</option>
                </select>
              </div>

              {/* Minute & Add button */}
              <div className="flex items-end gap-2">
                <div className="w-1/2">
                  <label className="block text-[11px] text-slate-400 mb-1">Minuto</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={eventMinute}
                    onChange={(e) => setEventMinute(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddEvent}
                  disabled={!selectedPlayerId}
                  className="w-1/2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold py-2 px-2 rounded-lg transition-colors"
                >
                  + Agregar
                </button>
              </div>
            </div>

            {/* Events List */}
            {events.length > 0 && (
              <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto">
                {events.map((ev) => {
                  const player = allPlayers.find((p) => p.id === ev.playerId);
                  const isHome = ev.teamId === homeTeam.id;
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 rounded-lg text-xs border border-slate-700/60"
                    >
                      <div className="flex items-center gap-2">
                        <span>
                          {ev.type === 'goal' ? '⚽' : ev.type === 'yellow_card' ? '🟨' : '🟥'}
                        </span>
                        <span className="font-semibold text-white">
                          {player ? player.name : 'Jugador'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({isHome ? homeTeam.shortName : awayTeam.shortName})
                        </span>
                        {ev.minute && (
                          <span className="text-slate-400 font-mono">
                            {ev.minute}'
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(ev.id)}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                        title="Eliminar evento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MVP and Referee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Figura del Partido (MVP)
              </label>
              <select
                value={mvpPlayerId}
                onChange={(e) => setMvpPlayerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="">-- Sin asignar --</option>
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.teamName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Árbitro Designado
              </label>
              <input
                type="text"
                placeholder="Nombre del árbitro"
                value={referee}
                onChange={(e) => setReferee(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Planilla</span>
          </button>
        </div>

      </div>
    </div>
  );
};
