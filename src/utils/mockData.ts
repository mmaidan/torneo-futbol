import { Tournament } from '../types/tournament';

export const initialMockTournament: Tournament = {
  id: 'torneo_demo_f7',
  name: 'Copa Nocturna Fútbol 7 - 2026',
  category: 'Categoría Libre',
  modality: 'f7',
  format: 'league',
  status: 'in_progress',
  createdAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-10-28T12:00:00Z',
  config: {
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    matchDurationMinutes: 50,
    hasPenalties: false,
    tieBreaker: 'goal_diff',
    yellowCardsAccumulationSuspension: 3
  },
  teams: [
    {
      id: 'team_1',
      name: 'Los Galácticos FC',
      shortName: 'GAL',
      color: '#3b82f6', // Electric Blue
      delegateName: 'Carlos Méndez',
      delegatePhone: '+54 9 11 5555-1234',
      players: [
        { id: 'p_1_1', name: 'Martín Rossi', number: 1, teamId: 'team_1', position: 'GK' },
        { id: 'p_1_2', name: 'Javier Luna', number: 4, teamId: 'team_1', position: 'DEF' },
        { id: 'p_1_3', name: 'Lucas Benítez', number: 5, teamId: 'team_1', position: 'DEF' },
        { id: 'p_1_4', name: 'Santiago Gómez', number: 8, teamId: 'team_1', position: 'MID', isCaptain: true },
        { id: 'p_1_5', name: 'Joaquín Silva', number: 10, teamId: 'team_1', position: 'MID' },
        { id: 'p_1_6', name: 'Mateo Fernández', number: 9, teamId: 'team_1', position: 'FWD' },
        { id: 'p_1_7', name: 'Rodrigo Romero', number: 11, teamId: 'team_1', position: 'FWD' },
      ]
    },
    {
      id: 'team_2',
      name: 'La Maquinita',
      shortName: 'MAQ',
      color: '#ef4444', // Red
      delegateName: 'Esteban Morales',
      delegatePhone: '+54 9 11 5555-5678',
      players: [
        { id: 'p_2_1', name: 'Facundo Díaz', number: 1, teamId: 'team_2', position: 'GK' },
        { id: 'p_2_2', name: 'Lautaro Paredes', number: 2, teamId: 'team_2', position: 'DEF' },
        { id: 'p_2_3', name: 'Tomás Cáceres', number: 6, teamId: 'team_2', position: 'DEF' },
        { id: 'p_2_4', name: 'Ignacio Ortiz', number: 8, teamId: 'team_2', position: 'MID', isCaptain: true },
        { id: 'p_2_5', name: 'Maximiliano Vera', number: 10, teamId: 'team_2', position: 'MID' },
        { id: 'p_2_6', name: 'Julián Ramos', number: 7, teamId: 'team_2', position: 'FWD' },
        { id: 'p_2_7', name: 'Nicolás Godoy', number: 9, teamId: 'team_2', position: 'FWD' },
      ]
    },
    {
      id: 'team_3',
      name: 'Dep. Birra y Furia',
      shortName: 'BYF',
      color: '#f59e0b', // Amber / Gold
      delegateName: 'Pablo Varela',
      delegatePhone: '+54 9 11 5555-9012',
      players: [
        { id: 'p_3_1', name: 'Agustín Medina', number: 12, teamId: 'team_3', position: 'GK' },
        { id: 'p_3_2', name: 'Gabriel Castro', number: 3, teamId: 'team_3', position: 'DEF' },
        { id: 'p_3_3', name: 'Ezequiel Nuñez', number: 5, teamId: 'team_3', position: 'DEF', isCaptain: true },
        { id: 'p_3_4', name: 'Emiliano Pereyra', number: 8, teamId: 'team_3', position: 'MID' },
        { id: 'p_3_5', name: 'Bruno Acosta', number: 10, teamId: 'team_3', position: 'FWD' },
        { id: 'p_3_6', name: 'Leandro Ríos', number: 9, teamId: 'team_3', position: 'FWD' },
      ]
    },
    {
      id: 'team_4',
      name: 'Atlético Quilmes 7',
      shortName: 'ATQ',
      color: '#10b981', // Emerald
      delegateName: 'Franco Giménez',
      delegatePhone: '+54 9 11 5555-3456',
      players: [
        { id: 'p_4_1', name: 'Damián Suárez', number: 1, teamId: 'team_4', position: 'GK' },
        { id: 'p_4_2', name: 'Federico Blanco', number: 4, teamId: 'team_4', position: 'DEF', isCaptain: true },
        { id: 'p_4_3', name: 'Guillermo Paz', number: 5, teamId: 'team_4', position: 'MID' },
        { id: 'p_4_4', name: 'Mariano Rojas', number: 7, teamId: 'team_4', position: 'MID' },
        { id: 'p_4_5', name: 'Nahuel Delgado', number: 9, teamId: 'team_4', position: 'FWD' },
      ]
    },
    {
      id: 'team_5',
      name: 'Real Barril',
      shortName: 'RBA',
      color: '#8b5cf6', // Violet
      delegateName: 'Andrés López',
      delegatePhone: '+54 9 11 5555-7890',
      players: [
        { id: 'p_5_1', name: 'Cristian Fleitas', number: 1, teamId: 'team_5', position: 'GK' },
        { id: 'p_5_2', name: 'Gastón Sosa', number: 3, teamId: 'team_5', position: 'DEF' },
        { id: 'p_5_3', name: 'Matías Ferreyra', number: 10, teamId: 'team_5', position: 'MID', isCaptain: true },
        { id: 'p_5_4', name: 'Hernán Domínguez', number: 11, teamId: 'team_5', position: 'FWD' },
      ]
    },
    {
      id: 'team_6',
      name: 'Inter de Milanesa',
      shortName: 'INT',
      color: '#06b6d4', // Cyan
      delegateName: 'Sebastián Aguirre',
      delegatePhone: '+54 9 11 5555-2345',
      players: [
        { id: 'p_6_1', name: 'Alan Cardozo', number: 1, teamId: 'team_6', position: 'GK' },
        { id: 'p_6_2', name: 'Lucas Alderete', number: 2, teamId: 'team_6', position: 'DEF' },
        { id: 'p_6_3', name: 'Brian Espinoza', number: 8, teamId: 'team_6', position: 'MID', isCaptain: true },
        { id: 'p_6_4', name: 'Diego Mercado', number: 9, teamId: 'team_6', position: 'FWD' },
      ]
    }
  ],
  matches: [
    // Fecha 1
    {
      id: 'match_d_1',
      tournamentId: 'torneo_demo_f7',
      round: 1,
      stage: 'group',
      homeTeamId: 'team_1',
      awayTeamId: 'team_2',
      homeScore: 4,
      awayScore: 3,
      status: 'finished',
      date: '2026-10-07',
      time: '20:00',
      pitch: 'Cancha 1',
      referee: 'Juan Carlos Loustau',
      mvpPlayerId: 'p_1_6',
      events: [
        { id: 'ev_1', matchId: 'match_d_1', teamId: 'team_1', playerId: 'p_1_6', type: 'goal', minute: 12 },
        { id: 'ev_2', matchId: 'match_d_1', teamId: 'team_2', playerId: 'p_2_7', type: 'goal', minute: 18 },
        { id: 'ev_3', matchId: 'match_d_1', teamId: 'team_1', playerId: 'p_1_6', type: 'goal', minute: 24 },
        { id: 'ev_4', matchId: 'match_d_1', teamId: 'team_2', playerId: 'p_2_6', type: 'goal', minute: 32 },
        { id: 'ev_5', matchId: 'match_d_1', teamId: 'team_1', playerId: 'p_1_5', type: 'goal', minute: 40 },
        { id: 'ev_6', matchId: 'match_d_1', teamId: 'team_2', playerId: 'p_2_7', type: 'goal', minute: 46 },
        { id: 'ev_7', matchId: 'match_d_1', teamId: 'team_1', playerId: 'p_1_7', type: 'goal', minute: 49 },
        { id: 'ev_8', matchId: 'match_d_1', teamId: 'team_2', playerId: 'p_2_3', type: 'yellow_card', minute: 22 }
      ]
    },
    {
      id: 'match_d_2',
      tournamentId: 'torneo_demo_f7',
      round: 1,
      stage: 'group',
      homeTeamId: 'team_3',
      awayTeamId: 'team_4',
      homeScore: 2,
      awayScore: 2,
      status: 'finished',
      date: '2026-10-07',
      time: '21:00',
      pitch: 'Cancha 1',
      referee: 'Juan Carlos Loustau',
      events: [
        { id: 'ev_9', matchId: 'match_d_2', teamId: 'team_3', playerId: 'p_3_5', type: 'goal', minute: 8 },
        { id: 'ev_10', matchId: 'match_d_2', teamId: 'team_4', playerId: 'p_4_5', type: 'goal', minute: 19 },
        { id: 'ev_11', matchId: 'match_d_2', teamId: 'team_3', playerId: 'p_3_6', type: 'goal', minute: 34 },
        { id: 'ev_12', matchId: 'match_d_2', teamId: 'team_4', playerId: 'p_4_4', type: 'goal', minute: 48 },
        { id: 'ev_13', matchId: 'match_d_2', teamId: 'team_3', playerId: 'p_3_3', type: 'yellow_card', minute: 45 }
      ]
    },
    {
      id: 'match_d_3',
      tournamentId: 'torneo_demo_f7',
      round: 1,
      stage: 'group',
      homeTeamId: 'team_5',
      awayTeamId: 'team_6',
      homeScore: 1,
      awayScore: 0,
      status: 'finished',
      date: '2026-10-07',
      time: '22:00',
      pitch: 'Cancha 2',
      referee: 'Martín Elizondo',
      events: [
        { id: 'ev_14', matchId: 'match_d_3', teamId: 'team_5', playerId: 'p_5_4', type: 'goal', minute: 15 },
        { id: 'ev_15', matchId: 'match_d_3', teamId: 'team_6', playerId: 'p_6_2', type: 'yellow_card', minute: 30 }
      ]
    },

    // Fecha 2
    {
      id: 'match_d_4',
      tournamentId: 'torneo_demo_f7',
      round: 2,
      stage: 'group',
      homeTeamId: 'team_1',
      awayTeamId: 'team_3',
      homeScore: 5,
      awayScore: 1,
      status: 'finished',
      date: '2026-10-14',
      time: '20:00',
      pitch: 'Cancha 1',
      referee: 'Juan Carlos Loustau',
      mvpPlayerId: 'p_1_6',
      events: [
        { id: 'ev_16', matchId: 'match_d_4', teamId: 'team_1', playerId: 'p_1_6', type: 'goal', minute: 10 },
        { id: 'ev_17', matchId: 'match_d_4', teamId: 'team_1', playerId: 'p_1_6', type: 'goal', minute: 14 },
        { id: 'ev_18', matchId: 'match_d_4', teamId: 'team_1', playerId: 'p_1_5', type: 'goal', minute: 28 },
        { id: 'ev_19', matchId: 'match_d_4', teamId: 'team_3', playerId: 'p_3_5', type: 'goal', minute: 35 },
        { id: 'ev_20', matchId: 'match_d_4', teamId: 'team_1', playerId: 'p_1_7', type: 'goal', minute: 42 },
        { id: 'ev_21', matchId: 'match_d_4', teamId: 'team_1', playerId: 'p_1_6', type: 'goal', minute: 48 },
      ]
    },
    {
      id: 'match_d_5',
      tournamentId: 'torneo_demo_f7',
      round: 2,
      stage: 'group',
      homeTeamId: 'team_2',
      awayTeamId: 'team_5',
      homeScore: 3,
      awayScore: 0,
      status: 'finished',
      date: '2026-10-14',
      time: '21:00',
      pitch: 'Cancha 1',
      referee: 'Juan Carlos Loustau',
      events: [
        { id: 'ev_22', matchId: 'match_d_5', teamId: 'team_2', playerId: 'p_2_7', type: 'goal', minute: 5 },
        { id: 'ev_23', matchId: 'match_d_5', teamId: 'team_2', playerId: 'p_2_6', type: 'goal', minute: 22 },
        { id: 'ev_24', matchId: 'match_d_5', teamId: 'team_2', playerId: 'p_2_7', type: 'goal', minute: 38 },
      ]
    },
    {
      id: 'match_d_6',
      tournamentId: 'torneo_demo_f7',
      round: 2,
      stage: 'group',
      homeTeamId: 'team_4',
      awayTeamId: 'team_6',
      homeScore: 3,
      awayScore: 2,
      status: 'finished',
      date: '2026-10-14',
      time: '22:00',
      pitch: 'Cancha 2',
      referee: 'Martín Elizondo',
      events: [
        { id: 'ev_25', matchId: 'match_d_6', teamId: 'team_4', playerId: 'p_4_5', type: 'goal', minute: 11 },
        { id: 'ev_26', matchId: 'match_d_6', teamId: 'team_6', playerId: 'p_6_4', type: 'goal', minute: 18 },
        { id: 'ev_27', matchId: 'match_d_6', teamId: 'team_4', playerId: 'p_4_5', type: 'goal', minute: 29 },
        { id: 'ev_28', matchId: 'match_d_6', teamId: 'team_6', playerId: 'p_6_4', type: 'goal', minute: 40 },
        { id: 'ev_29', matchId: 'match_d_6', teamId: 'team_4', playerId: 'p_4_3', type: 'goal', minute: 47 },
      ]
    },

    // Fecha 3 (Próxima fecha / En curso)
    {
      id: 'match_d_7',
      tournamentId: 'torneo_demo_f7',
      round: 3,
      stage: 'group',
      homeTeamId: 'team_1',
      awayTeamId: 'team_4',
      homeScore: 2,
      awayScore: 1,
      status: 'live',
      date: '2026-10-28',
      time: '20:00',
      pitch: 'Cancha Principal (C1)',
      referee: 'Juan Carlos Loustau',
      events: [
        { id: 'ev_30', matchId: 'match_d_7', teamId: 'team_1', playerId: 'p_1_6', type: 'goal', minute: 14 },
        { id: 'ev_31', matchId: 'match_d_7', teamId: 'team_4', playerId: 'p_4_5', type: 'goal', minute: 21 },
        { id: 'ev_32', matchId: 'match_d_7', teamId: 'team_1', playerId: 'p_1_5', type: 'goal', minute: 34 }
      ]
    },
    {
      id: 'match_d_8',
      tournamentId: 'torneo_demo_f7',
      round: 3,
      stage: 'group',
      homeTeamId: 'team_2',
      awayTeamId: 'team_6',
      status: 'scheduled',
      date: '2026-10-28',
      time: '21:00',
      pitch: 'Cancha Principal (C1)',
      referee: 'Juan Carlos Loustau',
      events: []
    },
    {
      id: 'match_d_9',
      tournamentId: 'torneo_demo_f7',
      round: 3,
      stage: 'group',
      homeTeamId: 'team_3',
      awayTeamId: 'team_5',
      status: 'scheduled',
      date: '2026-10-28',
      time: '22:00',
      pitch: 'Cancha 2',
      referee: 'Martín Elizondo',
      events: []
    },

    // Fecha 4 (Futura)
    {
      id: 'match_d_10',
      tournamentId: 'torneo_demo_f7',
      round: 4,
      stage: 'group',
      homeTeamId: 'team_1',
      awayTeamId: 'team_5',
      status: 'scheduled',
      date: '2026-11-04',
      time: '20:00',
      pitch: 'Cancha 1',
      events: []
    },
    {
      id: 'match_d_11',
      tournamentId: 'torneo_demo_f7',
      round: 4,
      stage: 'group',
      homeTeamId: 'team_2',
      awayTeamId: 'team_4',
      status: 'scheduled',
      date: '2026-11-04',
      time: '21:00',
      pitch: 'Cancha 1',
      events: []
    },
    {
      id: 'match_d_12',
      tournamentId: 'torneo_demo_f7',
      round: 4,
      stage: 'group',
      homeTeamId: 'team_6',
      awayTeamId: 'team_3',
      status: 'scheduled',
      date: '2026-11-04',
      time: '22:00',
      pitch: 'Cancha 2',
      events: []
    },

    // Fecha 5 (Futura)
    {
      id: 'match_d_13',
      tournamentId: 'torneo_demo_f7',
      round: 5,
      stage: 'group',
      homeTeamId: 'team_1',
      awayTeamId: 'team_6',
      status: 'scheduled',
      date: '2026-11-11',
      time: '20:00',
      pitch: 'Cancha 1',
      events: []
    },
    {
      id: 'match_d_14',
      tournamentId: 'torneo_demo_f7',
      round: 5,
      stage: 'group',
      homeTeamId: 'team_2',
      awayTeamId: 'team_3',
      status: 'scheduled',
      date: '2026-11-11',
      time: '21:00',
      pitch: 'Cancha 1',
      events: []
    },
    {
      id: 'match_d_15',
      tournamentId: 'torneo_demo_f7',
      round: 5,
      stage: 'group',
      homeTeamId: 'team_4',
      awayTeamId: 'team_5',
      status: 'scheduled',
      date: '2026-11-11',
      time: '22:00',
      pitch: 'Cancha 2',
      events: []
    }
  ]
};
