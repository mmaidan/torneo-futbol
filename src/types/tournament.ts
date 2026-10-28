export type TournamentFormat = 'league' | 'groups_playoffs' | 'knockout';
export type TournamentModality = 'f5' | 'f6' | 'f7' | 'f8' | 'f11';

export interface Player {
  id: string;
  name: string;
  number?: number;
  teamId: string;
  position?: 'GK' | 'DEF' | 'MID' | 'FWD';
  photoUrl?: string;
  isCaptain?: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string; // Hex color for jersey/badge
  logoUrl?: string;
  delegateName?: string;
  delegatePhone?: string;
  players: Player[];
}

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

export type EventType = 'goal' | 'yellow_card' | 'red_card' | 'blue_card' | 'mvp';

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  type: EventType;
  minute?: number;
  notes?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number; // Fecha 1, 2... or Round number
  stage?: 'group' | 'round_16' | 'quarter' | 'semi' | 'third_place' | 'final';
  groupName?: string; // e.g. "Grupo A", "Grupo B"
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  homePenalties?: number;
  awayPenalties?: number;
  status: MatchStatus;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  pitch?: string; // e.g. "Cancha 1", "Sede Central"
  referee?: string;
  events: MatchEvent[];
  mvpPlayerId?: string;
  notes?: string;
}

export interface GroupConfig {
  name: string; // "Grupo A"
  teamIds: string[];
  advancingTeamsCount: number; // How many advance to playoffs
}

export interface TournamentConfig {
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  matchDurationMinutes: number; // e.g. 50 (two 25m halves)
  hasExtraTime?: boolean;
  hasPenalties?: boolean;
  tieBreaker: 'goal_diff' | 'head_to_head' | 'goals_for';
  yellowCardsAccumulationSuspension?: number; // e.g. 3 yellow cards = 1 match suspension
}

export interface Tournament {
  id: string;
  name: string;
  category: string; // e.g. "Libre A", "+30", "Femenino", "Empresarial"
  modality: TournamentModality;
  format: TournamentFormat;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  teams: Team[];
  matches: Match[];
  groups?: GroupConfig[];
  config: TournamentConfig;
  championTeamId?: string;
  runnerUpTeamId?: string;
}

export interface StandingRow {
  teamId: string;
  teamName: string;
  teamShortName: string;
  teamColor: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  yellowCards: number;
  redCards: number;
  fairPlayScore: number;
}

export interface ScorerStat {
  playerId: string;
  playerName: string;
  playerNumber?: number;
  teamId: string;
  teamName: string;
  teamColor: string;
  goals: number;
  matchesPlayed: number;
}

export interface FairPlayStat {
  teamId: string;
  teamName: string;
  teamColor: string;
  yellowCards: number;
  redCards: number;
  pointsDeducted: number; // Yellow = 1 pt, Red = 3 pts
}

export interface GoalkeeperStat {
  teamId: string;
  teamName: string;
  teamColor: string;
  goalsConceded: number;
  matchesPlayed: number;
  averageGoalsConceded: number;
}
