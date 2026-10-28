import { Tournament, Team, Player } from '../types/tournament';

// Helper to generate 18 players for a team
function generate18Players(teamId: string, teamShort: string): Player[] {
  const roles: ('GK' | 'DEF' | 'MID' | 'FWD')[] = [
    'GK', 'GK',
    'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
    'MID', 'MID', 'MID', 'MID', 'MID', 'MID',
    'FWD', 'FWD', 'FWD', 'FWD'
  ];

  const firstNames = [
    'Martín', 'Santiago', 'Lucas', 'Mateo', 'Joaquín', 'Nicolás',
    'Facundo', 'Lautaro', 'Tomás', 'Ignacio', 'Julián', 'Agustín',
    'Gabriel', 'Ezequiel', 'Emiliano', 'Bruno', 'Rodrigo', 'Damián'
  ];

  return Array.from({ length: 18 }).map((_, i) => ({
    id: `p_${teamId}_${i + 1}`,
    name: `${firstNames[i]} (${teamShort})`,
    number: i + 1,
    teamId,
    position: roles[i],
    isCaptain: i === 9 // #10 is Captain
  }));
}

const defaultTeams: Team[] = [
  {
    id: 'team_1',
    name: 'Los Galácticos FC',
    shortName: 'GAL',
    color: '#3b82f6', // Azul
    delegateName: 'Carlos Méndez',
    delegatePhone: '+54 9 11 5555-1234',
    players: generate18Players('team_1', 'GAL')
  },
  {
    id: 'team_2',
    name: 'La Máquina del Millón',
    shortName: 'MAQ',
    color: '#ef4444', // Rojo
    delegateName: 'Esteban Morales',
    delegatePhone: '+54 9 11 5555-5678',
    players: generate18Players('team_2', 'MAQ')
  },
  {
    id: 'team_3',
    name: 'Deportivo Furia',
    shortName: 'FUR',
    color: '#f59e0b', // Amarillo / Ámbar
    delegateName: 'Pablo Varela',
    delegatePhone: '+54 9 11 5555-9012',
    players: generate18Players('team_3', 'FUR')
  },
  {
    id: 'team_4',
    name: 'Atlético Quilmes 6',
    shortName: 'ATQ',
    color: '#10b981', // Verde
    delegateName: 'Franco Giménez',
    delegatePhone: '+54 9 11 5555-3456',
    players: generate18Players('team_4', 'ATQ')
  },
  {
    id: 'team_5',
    name: 'Real Barril',
    shortName: 'RBA',
    color: '#8b5cf6', // Violeta
    delegateName: 'Andrés López',
    delegatePhone: '+54 9 11 5555-7890',
    players: generate18Players('team_5', 'RBA')
  },
  {
    id: 'team_6',
    name: 'Inter de Milán',
    shortName: 'INT',
    color: '#06b6d4', // Celeste
    delegateName: 'Sebastián Aguirre',
    delegatePhone: '+54 9 11 5555-2345',
    players: generate18Players('team_6', 'INT')
  },
  {
    id: 'team_7',
    name: 'La Joya FC',
    shortName: 'JOY',
    color: '#ec4899', // Rosa
    delegateName: 'Hernán Domínguez',
    delegatePhone: '+54 9 11 5555-6789',
    players: generate18Players('team_7', 'JOY')
  },
  {
    id: 'team_8',
    name: 'Dep. Los Borrachos',
    shortName: 'LBO',
    color: '#f97316', // Naranja
    delegateName: 'Mauro Rossi',
    delegatePhone: '+54 9 11 5555-4321',
    players: generate18Players('team_8', 'LBO')
  }
];

export const initialMockTournament: Tournament = {
  id: 'el_campeonato_del_millon',
  name: 'El Campeonato del Millón',
  category: 'Fútbol 6 • Libre',
  modality: 'f6',
  format: 'league',
  status: 'in_progress',
  createdAt: '2026-10-28T10:00:00Z',
  updatedAt: new Date().toISOString(),
  config: {
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    matchDurationMinutes: 40, // 2 tiempos de 20 min para F6
    hasPenalties: false,
    tieBreaker: 'goal_diff',
    yellowCardsAccumulationSuspension: 3
  },
  teams: defaultTeams,
  matches: [
    // Cruces iniciales de Fecha 1 (listos para que el admin juegue o modifique)
    {
      id: 'match_millon_1',
      tournamentId: 'el_campeonato_del_millon',
      round: 1,
      homeTeamId: 'team_1',
      awayTeamId: 'team_2',
      status: 'scheduled',
      date: '2026-11-01',
      time: '19:00',
      pitch: 'Cancha 1',
      events: []
    },
    {
      id: 'match_millon_2',
      tournamentId: 'el_campeonato_del_millon',
      round: 1,
      homeTeamId: 'team_3',
      awayTeamId: 'team_4',
      status: 'scheduled',
      date: '2026-11-01',
      time: '20:00',
      pitch: 'Cancha 1',
      events: []
    },
    {
      id: 'match_millon_3',
      tournamentId: 'el_campeonato_del_millon',
      round: 1,
      homeTeamId: 'team_5',
      awayTeamId: 'team_6',
      status: 'scheduled',
      date: '2026-11-01',
      time: '21:00',
      pitch: 'Cancha 2',
      events: []
    },
    {
      id: 'match_millon_4',
      tournamentId: 'el_campeonato_del_millon',
      round: 1,
      homeTeamId: 'team_7',
      awayTeamId: 'team_8',
      status: 'scheduled',
      date: '2026-11-01',
      time: '22:00',
      pitch: 'Cancha 2',
      events: []
    }
  ]
};
