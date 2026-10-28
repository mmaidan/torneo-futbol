import { Match, Team, GroupConfig } from '../types/tournament';

/**
 * Berger Round Robin algorithm generator
 * Generates all rounds of matches so each team plays each other once (or twice if double round)
 */
export function generateLeagueFixture(
  tournamentId: string,
  teams: Team[],
  config: {
    roundsCount?: 1 | 2; // 1 = Apertura/una rueda, 2 = Ida y vuelta
    startDate?: string; // YYYY-MM-DD
    matchTimeSlots?: string[]; // e.g. ["19:00", "20:00", "21:00", "22:00"]
    pitches?: string[]; // e.g. ["Cancha 1", "Cancha 2"]
    daysInterval?: number; // e.g. 7 (every week)
  } = {}
): Match[] {
  if (teams.length < 2) return [];

  const teamIds = teams.map((t) => t.id);
  const isOdd = teamIds.length % 2 !== 0;
  
  // If odd number of teams, add a dummy team representing "Libre" (bye)
  const workingTeams = [...teamIds];
  if (isOdd) {
    workingTeams.push('BYE');
  }

  const numTeams = workingTeams.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const matches: Match[] = [];

  const baseDate = config.startDate ? new Date(config.startDate) : new Date();
  const times = config.matchTimeSlots && config.matchTimeSlots.length > 0 
    ? config.matchTimeSlots 
    : ['19:00', '20:00', '21:00'];
  const pitches = config.pitches && config.pitches.length > 0 
    ? config.pitches 
    : ['Cancha 1', 'Cancha 2'];
  const interval = config.daysInterval || 7;

  let currentRoundTeams = [...workingTeams];

  for (let round = 1; round <= numRounds; round++) {
    const roundDate = new Date(baseDate);
    roundDate.setDate(roundDate.getDate() + (round - 1) * interval);
    const dateStr = roundDate.toISOString().split('T')[0];

    let slotIndex = 0;

    for (let i = 0; i < matchesPerRound; i++) {
      const home = currentRoundTeams[i];
      const away = currentRoundTeams[numTeams - 1 - i];

      // Skip match if one of the teams is the BYE
      if (home === 'BYE' || away === 'BYE') continue;

      // Alternate home/away for fair distribution
      const isEvenRound = round % 2 === 0;
      const homeTeamId = isEvenRound ? away : home;
      const awayTeamId = isEvenRound ? home : away;

      const time = times[slotIndex % times.length];
      const pitch = pitches[Math.floor(slotIndex / times.length) % pitches.length];
      slotIndex++;

      matches.push({
        id: `match_${tournamentId}_r${round}_${homeTeamId}_${awayTeamId}`,
        tournamentId,
        round,
        stage: 'group',
        homeTeamId,
        awayTeamId,
        status: 'scheduled',
        date: dateStr,
        time,
        pitch,
        events: []
      });
    }

    // Rotate array preserving the first element (standard Berger round robin)
    const fixed = currentRoundTeams[0];
    const rest = currentRoundTeams.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    currentRoundTeams = [fixed, ...rest];
  }

  // If double round (ida y vuelta), repeat with reversed local/visitor
  if (config.roundsCount === 2) {
    const secondLegMatches: Match[] = matches.map((m) => {
      const secondRound = m.round + numRounds;
      const roundDate = new Date(baseDate);
      roundDate.setDate(roundDate.getDate() + (secondRound - 1) * interval);
      const dateStr = roundDate.toISOString().split('T')[0];

      return {
        ...m,
        id: `match_${tournamentId}_r${secondRound}_${m.awayTeamId}_${m.homeTeamId}`,
        round: secondRound,
        homeTeamId: m.awayTeamId,
        awayTeamId: m.homeTeamId,
        date: dateStr,
        events: []
      };
    });
    return [...matches, ...secondLegMatches];
  }

  return matches;
}

/**
 * Generate fixtures for Groups Stage (e.g. Grupo A, Grupo B)
 */
export function generateGroupsFixture(
  tournamentId: string,
  groups: GroupConfig[],
  allTeams: Team[],
  config?: Parameters<typeof generateLeagueFixture>[2]
): Match[] {
  let allMatches: Match[] = [];

  groups.forEach((group) => {
    const groupTeams = allTeams.filter((t) => group.teamIds.includes(t.id));
    const groupMatches = generateLeagueFixture(tournamentId, groupTeams, config);
    
    // Tag each match with the group name
    const taggedMatches = groupMatches.map((m) => ({
      ...m,
      groupName: group.name,
      stage: 'group' as const
    }));

    allMatches = [...allMatches, ...taggedMatches];
  });

  return allMatches;
}

/**
 * Generate initial Playoff Bracket matches (Cuartos, Semis, Final)
 */
export function generatePlayoffBracket(
  tournamentId: string,
  participantTeams: { homeId: string; awayId: string }[],
  stage: 'round_16' | 'quarter' | 'semi' | 'final',
  startRoundNumber: number = 100
): Match[] {
  return participantTeams.map((pair, idx) => ({
    id: `playoff_${tournamentId}_${stage}_${idx + 1}`,
    tournamentId,
    round: startRoundNumber,
    stage,
    homeTeamId: pair.homeId,
    awayTeamId: pair.awayId,
    status: 'scheduled',
    pitch: `Cancha Principal`,
    events: []
  }));
}
