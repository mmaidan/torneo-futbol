import React, { useState } from 'react';
import { Tournament, TournamentFormat, TournamentModality, Team } from '../types/tournament';
import { 
  X, 
  Plus, 
  Trophy, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  Layers, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { generateLeagueFixture, generateGroupsFixture } from '../utils/fixtureGenerator';
import { exportTournamentToJson } from '../services/storageService';

interface TournamentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournaments: Tournament[];
  activeTournamentId: string;
  onSelectTournament: (id: string) => void;
  onCreateTournament: (tournament: Tournament) => void;
  onDeleteTournament: (id: string) => void;
  onImportTournament: (tournament: Tournament) => void;
  initiallyOpenCreate?: boolean;
  isAdmin?: boolean;
}

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#ec4899', '#64748b', '#f97316', '#14b8a6',
  '#6366f1', '#84cc16'
];

export const TournamentSelectorModal: React.FC<TournamentSelectorModalProps> = ({
  isOpen,
  onClose,
  tournaments,
  activeTournamentId,
  onSelectTournament,
  onCreateTournament,
  onDeleteTournament,
  onImportTournament,
  initiallyOpenCreate = false,
  isAdmin = false,
}) => {
  if (!isOpen) return null;

  const [isCreating, setIsCreating] = useState(initiallyOpenCreate && isAdmin);

  // New Tournament form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Categoría Libre');
  const [modality, setModality] = useState<TournamentModality>('f7');
  const [format, setFormat] = useState<TournamentFormat>('league');
  const [teamsText, setTeamsText] = useState(
    'Los Galácticos\nLa Maquinita\nDep. Birra y Furia\nAtlético Quilmes\nReal Barril\nInter de Milán'
  );
  const [matchDuration, setMatchDuration] = useState(50);
  const [pitchesText, setPitchesText] = useState('Cancha 1, Cancha 2');

  const handleCreate = () => {
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para el torneo.');
      return;
    }

    // Parse team lines
    const teamNames = teamsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (teamNames.length < 2) {
      alert('Debes ingresar al menos 2 equipos para armar el torneo.');
      return;
    }

    const newTeams: Team[] = teamNames.map((teamName, idx) => ({
      id: `team_${Date.now()}_${idx}`,
      name: teamName,
      shortName: teamName.substring(0, 3).toUpperCase(),
      color: PRESET_COLORS[idx % PRESET_COLORS.length],
      players: [
        { id: `p_${idx}_1`, name: `Capitán ${teamName.split(' ')[0]}`, teamId: `team_${Date.now()}_${idx}`, number: 10, isCaptain: true }
      ]
    }));

    const tournamentId = `torneo_${Date.now()}`;
    const pitches = pitchesText.split(',').map((p) => p.trim()).filter(Boolean);

    let initialMatches = [];
    let groupsConfig = undefined;

    if (format === 'groups_playoffs' && newTeams.length >= 4) {
      // Split into 2 groups (Grupo A and Grupo B)
      const half = Math.ceil(newTeams.length / 2);
      const groupA = newTeams.slice(0, half).map((t) => t.id);
      const groupB = newTeams.slice(half).map((t) => t.id);
      groupsConfig = [
        { name: 'Grupo A', teamIds: groupA, advancingTeamsCount: 2 },
        { name: 'Grupo B', teamIds: groupB, advancingTeamsCount: 2 }
      ];
      initialMatches = generateGroupsFixture(tournamentId, groupsConfig, newTeams, { pitches });
    } else {
      // Default Round Robin League
      initialMatches = generateLeagueFixture(tournamentId, newTeams, {
        startDate: new Date().toISOString().split('T')[0],
        pitches
      });
    }

    const newTournament: Tournament = {
      id: tournamentId,
      name: name.trim(),
      category: category.trim(),
      modality,
      format,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
        matchDurationMinutes: matchDuration,
        tieBreaker: 'goal_diff',
      },
      teams: newTeams,
      matches: initialMatches,
      groups: groupsConfig,
    };

    onCreateTournament(newTournament);
    setIsCreating(false);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.id && parsed.name && Array.isArray(parsed.teams)) {
          onImportTournament(parsed);
          onClose();
          alert(`¡Torneo "${parsed.name}" importado exitosamente!`);
        } else {
          alert('El archivo no contiene un formato de torneo válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isCreating ? 'Crear Nuevo Torneo de Fútbol' : 'Mis Torneos'}
              </h2>
              <p className="text-xs text-slate-400">
                {isCreating ? 'Configura el formato, equipos y fixture automático' : 'Selecciona o administra tus competencias'}
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {isCreating ? (
            /* Creation Form */
            <div className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre del Torneo *</label>
                  <input
                    type="text"
                    placeholder="Ej. Torneo Apertura Fútbol 7 - 2026"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Categoría</label>
                  <input
                    type="text"
                    placeholder="Libre, +30, Femenino, etc."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Modalidad de Cancha</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as TournamentModality)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="f5">Fútbol 5 (Sintético / Sala)</option>
                    <option value="f6">Fútbol 6 (Amateur / 6 vs 6)</option>
                    <option value="f7">Fútbol 7 (Amateur)</option>
                    <option value="f8">Fútbol 8</option>
                    <option value="f11">Fútbol 11 (Cancha Grande)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Formato de Competencia</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as TournamentFormat)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold text-brand-400"
                  >
                    <option value="league">Liga Todos contra Todos (Round Robin)</option>
                    <option value="groups_playoffs">Fase de Grupos + Cuartos/Semis/Final</option>
                    <option value="knockout">Eliminación Directa / Copa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Duración de Partido (minutos)</label>
                  <input
                    type="number"
                    value={matchDuration}
                    onChange={(e) => setMatchDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Teams Quick Entry */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400 font-semibold">
                    Equipos Participantes (uno por línea)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {teamsText.split('\n').filter((s) => s.trim()).length} equipos
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={teamsText}
                  onChange={(e) => setTeamsText(e.target.value)}
                  placeholder="Escribe cada equipo en una línea..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono leading-relaxed"
                />
              </div>

              {/* Pitches */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Canchas disponibles (separadas por coma)
                </label>
                <input
                  type="text"
                  value={pitchesText}
                  onChange={(e) => setPitchesText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

            </div>
          ) : (
            /* Tournament List */
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold">Torneos Disponibles:</span>
                {isAdmin && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Nuevo</span>
                </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {tournaments.map((t) => {
                  const isActive = t.id === activeTournamentId;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        onSelectTournament(t.id);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer border transition-all ${
                        isActive
                          ? 'bg-slate-800 border-brand-500 shadow-md ring-1 ring-brand-500/30'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 font-black">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate flex items-center gap-2">
                            <span>{t.name}</span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/20 text-brand-400 font-bold border border-brand-500/30">
                                Activo
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-400">
                            Fútbol {t.modality.replace('f', '')} • {t.teams.length} equipos • {t.matches.length} partidos
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportTournamentToJson(t);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                          title="Descargar copia de seguridad en JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && tournaments.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`¿Estás seguro de eliminar el torneo "${t.name}"?`)) {
                                onDeleteTournament(t.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                            title="Eliminar torneo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Import JSON button (solo admin) */}
              {isAdmin && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>¿Tienes una copia de respaldo guardada?</span>
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-brand-400" />
                  <span>Importar JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        {isCreating && (
          <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              Volver a la lista
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear Torneo & Fixture</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
