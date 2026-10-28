import React, { useState } from 'react';
import { Tournament, Team, Player } from '../types/tournament';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  UserPlus, 
  Shield, 
  Phone, 
  User, 
  Check, 
  X,
  Palette
} from 'lucide-react';

interface TeamsViewProps {
  tournament: Tournament;
  isAdmin: boolean;
  onUpdateTeams: (teams: Team[]) => void;
}

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f59e0b', // Amber/Yellow
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#64748b', // Slate
  '#f97316', // Orange
  '#14b8a6', // Teal
];

export const TeamsView: React.FC<TeamsViewProps> = ({
  tournament,
  isAdmin,
  onUpdateTeams,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(tournament.teams[0] || null);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Edit / New team form state
  const [teamName, setTeamName] = useState('');
  const [teamShortName, setTeamShortName] = useState('');
  const [teamColor, setTeamColor] = useState('#3b82f6');
  const [delegateName, setDelegateName] = useState('');
  const [delegatePhone, setDelegatePhone] = useState('');

  // Add player form state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState<Player['position']>('MID');
  const [newPlayerCaptain, setNewPlayerCaptain] = useState(false);

  const openCreateTeam = () => {
    setTeamName('');
    setTeamShortName('');
    setTeamColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setDelegateName('');
    setDelegatePhone('');
    setIsCreatingTeam(true);
    setIsEditingTeam(false);
  };

  const openEditTeam = (team: Team) => {
    setTeamName(team.name);
    setTeamShortName(team.shortName);
    setTeamColor(team.color);
    setDelegateName(team.delegateName || '');
    setDelegatePhone(team.delegatePhone || '');
    setSelectedTeam(team);
    setIsEditingTeam(true);
    setIsCreatingTeam(false);
  };

  const handleSaveTeam = () => {
    if (!teamName.trim()) return;

    if (isCreatingTeam) {
      const newTeam: Team = {
        id: `team_${Date.now()}`,
        name: teamName.trim(),
        shortName: teamShortName.trim().toUpperCase() || teamName.trim().substring(0, 3).toUpperCase(),
        color: teamColor,
        delegateName: delegateName.trim(),
        delegatePhone: delegatePhone.trim(),
        players: [],
      };
      const updated = [...tournament.teams, newTeam];
      onUpdateTeams(updated);
      setSelectedTeam(newTeam);
      setIsCreatingTeam(false);
    } else if (isEditingTeam && selectedTeam) {
      const updatedTeam: Team = {
        ...selectedTeam,
        name: teamName.trim(),
        shortName: teamShortName.trim().toUpperCase() || teamName.trim().substring(0, 3).toUpperCase(),
        color: teamColor,
        delegateName: delegateName.trim(),
        delegatePhone: delegatePhone.trim(),
      };
      const updated = tournament.teams.map((t) => t.id === updatedTeam.id ? updatedTeam : t);
      onUpdateTeams(updated);
      setSelectedTeam(updatedTeam);
      setIsEditingTeam(false);
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo? Se borrarán sus jugadores.')) {
      const updated = tournament.teams.filter((t) => t.id !== teamId);
      onUpdateTeams(updated);
      setSelectedTeam(updated[0] || null);
    }
  };

  const handleAddPlayer = () => {
    if (!selectedTeam || !newPlayerName.trim()) return;

    const newPlayer: Player = {
      id: `p_${selectedTeam.id}_${Date.now()}`,
      name: newPlayerName.trim(),
      number: newPlayerNumber ? parseInt(newPlayerNumber, 10) : undefined,
      teamId: selectedTeam.id,
      position: newPlayerPosition,
      isCaptain: newPlayerCaptain,
    };

    const updatedTeam = {
      ...selectedTeam,
      players: [...selectedTeam.players, newPlayer],
    };

    const updatedTeams = tournament.teams.map((t) => t.id === updatedTeam.id ? updatedTeam : t);
    onUpdateTeams(updatedTeams);
    setSelectedTeam(updatedTeam);

    // Reset player inputs
    setNewPlayerName('');
    setNewPlayerNumber('');
    setNewPlayerCaptain(false);
  };

  const handleDeletePlayer = (playerId: string) => {
    if (!selectedTeam) return;

    const updatedTeam = {
      ...selectedTeam,
      players: selectedTeam.players.filter((p) => p.id !== playerId),
    };

    const updatedTeams = tournament.teams.map((t) => t.id === updatedTeam.id ? updatedTeam : t);
    onUpdateTeams(updatedTeams);
    setSelectedTeam(updatedTeam);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Gestión de Equipos y Planteles
          </h2>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full">
            {tournament.teams.length} equipos registrados
          </span>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateTeam}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm shadow-brand-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Equipo</span>
          </button>
        )}
      </div>

      {/* Main Grid: Teams List (Left) + Squad Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Teams List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 max-h-[600px] overflow-y-auto">
          {tournament.teams.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No hay equipos registrados.
            </div>
          ) : (
            tournament.teams.map((team) => {
              const isSelected = selectedTeam?.id === team.id;
              return (
                <div
                  key={team.id}
                  onClick={() => {
                    setSelectedTeam(team);
                    setIsCreatingTeam(false);
                    setIsEditingTeam(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-brand-500 shadow-md ring-1 ring-brand-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-4 h-9 rounded-md flex-shrink-0 shadow-inner"
                      style={{ backgroundColor: team.color || '#3b82f6' }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{team.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">
                        {team.shortName} • {team.players.length} jugadores
                      </p>
                    </div>
                  </div>

                  {isAdmin && isSelected && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTeam(team);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                        title="Editar equipo"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTeam(team.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                        title="Eliminar equipo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Squad & Team Details (Right 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Create / Edit Team Card if active */}
          {(isCreatingTeam || isEditingTeam) && (
            <div className="bg-slate-900 border border-brand-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">
                  {isCreatingTeam ? 'Registrar Nuevo Equipo' : `Editar: ${selectedTeam?.name}`}
                </h3>
                <button
                  onClick={() => {
                    setIsCreatingTeam(false);
                    setIsEditingTeam(false);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre del Equipo *</label>
                  <input
                    type="text"
                    placeholder="Ej. Los Guerreros FC"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Sigla / Abreviatura (3 letras)</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="GUE"
                    value={teamShortName}
                    onChange={(e) => setTeamShortName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre Delegado / Capitán</label>
                  <input
                    type="text"
                    placeholder="Juan Pérez"
                    value={delegateName}
                    onChange={(e) => setDelegateName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+54 9 11 ..."
                    value={delegatePhone}
                    onChange={(e) => setDelegatePhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold text-xs">Color de Camiseta</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTeamColor(c)}
                      className={`w-7 h-7 rounded-lg transition-transform ${
                        teamColor === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={teamColor}
                    onChange={(e) => setTeamColor(e.target.value)}
                    className="w-7 h-7 rounded-lg bg-transparent cursor-pointer"
                    title="Color personalizado"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingTeam(false);
                    setIsEditingTeam(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeam}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30"
                >
                  Guardar Equipo
                </button>
              </div>
            </div>
          )}

          {/* Selected Team Squad List */}
          {selectedTeam && !isCreatingTeam && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              
              {/* Team Info Banner */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-5 h-11 rounded-lg flex-shrink-0 shadow-md"
                    style={{ backgroundColor: selectedTeam.color }}
                  />
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedTeam.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      {selectedTeam.delegateName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" /> {selectedTeam.delegateName}
                        </span>
                      )}
                      {selectedTeam.delegatePhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedTeam.delegatePhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => openEditTeam(selectedTeam)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar Datos</span>
                  </button>
                )}
              </div>

              {/* Add player form (Admin) */}
              {isAdmin && (
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-brand-400" />
                    <span>Agregar Jugador a la Plantilla</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Dorsal #"
                        value={newPlayerNumber}
                        onChange={(e) => setNewPlayerNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <select
                        value={newPlayerPosition}
                        onChange={(e) => setNewPlayerPosition(e.target.value as Player['position'])}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="GK">Arquero (GK)</option>
                        <option value="DEF">Defensor (DEF)</option>
                        <option value="MID">Medio (MID)</option>
                        <option value="FWD">Delantero (FWD)</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPlayer}
                      disabled={!newPlayerName.trim()}
                      className="bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-bold py-1.5 px-3 rounded-lg text-xs"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              )}

              {/* Players Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <th className="py-2.5 px-3 text-center w-12">#</th>
                      <th className="py-2.5 px-3">Nombre</th>
                      <th className="py-2.5 px-3">Posición</th>
                      <th className="py-2.5 px-3 text-center">Capitán</th>
                      {isAdmin && <th className="py-2.5 px-3 text-right">Acción</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedTeam.players.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                          No hay jugadores cargados en este plantel aún.
                        </td>
                      </tr>
                    ) : (
                      selectedTeam.players.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-brand-400">
                            {p.number || '-'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                              {p.position || 'JUG'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {p.isCaptain && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                                (C)
                              </span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleDeletePlayer(p.id)}
                                className="text-slate-500 hover:text-rose-400 p-1"
                                title="Eliminar jugador"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
