import { Match, StandingRow, Team, ScorerStat, FairPlayStat, GoalkeeperStat, TournamentConfig } from '../types/tournament';

export function calculateStandings(
  teams: Team[],
  matches: Match[],
  config: TournamentConfig = {
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    matchDurationMinutes: 50,
    tieBreaker: 'goal_diff'
  },
  groupFilter?: string
): StandingRow[] {
  // Initialize row for each team
  const standingsMap = new Map<string, StandingRow>();

  teams.forEach((t) => {
    standingsMap.set(t.id, {
      teamId: t.id,
      teamName: t.name,
      teamShortName: t.shortName || t.name.substring(0, 3).toUpperCase(),
      teamColor: t.color || '#3b82f6',
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
      form: [],
      yellowCards: 0,
      redCards: 0,
      fairPlayScore: 0,
    });
  });

  // Filter matches: only finished matches and matching group if provided
  const relevantMatches = matches.filter((m) => {
    if (m.status !== 'finished') return false;
    if (groupFilter && m.groupName !== groupFilter) return false;
    // For general standings, exclude knockout stages unless not specified
    if (!groupFilter && m.stage && m.stage !== 'group') return false;
    return true;
  });

  // Sort matches chronologically to build accurate recent form
  relevantMatches.sort((a, b) => {
    const dateA = a.date ? `${a.date} ${a.time || '00:00'}` : `Round ${a.round}`;
    const dateB = b.date ? `${b.date} ${b.time || '00:00'}` : `Round ${b.round}`;
    return dateA.localeCompare(dateB);
  });

  relevantMatches.forEach((m) => {
    const home = standingsMap.get(m.homeTeamId);
    const away = standingsMap.get(m.awayTeamId);

    if (!home || !away) return;
    if (m.homeScore === undefined || m.awayScore === undefined) return;

    home.played += 1;
    away.played += 1;

    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won += 1;
      home.points += config.pointsForWin;
      home.form.push('W');

      away.lost += 1;
      away.points += config.pointsForLoss;
      away.form.push('L');
    } else if (m.homeScore < m.awayScore) {
      away.won += 1;
      away.points += config.pointsForWin;
      away.form.push('W');

      home.lost += 1;
      home.points += config.pointsForLoss;
      home.form.push('L');
    } else {
      home.drawn += 1;
      home.points += config.pointsForDraw;
      home.form.push('D');

      away.drawn += 1;
      away.points += config.pointsForDraw;
      away.form.push('D');
    }

    // Process disciplinary events
    (m.events || []).forEach((e) => {
      if (e.teamId === home.teamId) {
        if (e.type === 'yellow_card') home.yellowCards += 1;
        if (e.type === 'red_card') home.redCards += 1;
      } else if (e.teamId === away.teamId) {
        if (e.type === 'yellow_card') away.yellowCards += 1;
        if (e.type === 'red_card') away.redCards += 1;
      }
    });
  });

  // Calculate goal differences, fair play scores and trim form to last 5
  standingsMap.forEach((row) => {
    row.goalDiff = row.goalsFor - row.goalsAgainst;
    row.fairPlayScore = row.yellowCards * 1 + row.redCards * 3;
    row.form = row.form.slice(-5);
  });

  const standingsList = Array.from(standingsMap.values());

  // Sort by Points, GoalDiff, GoalsFor, then FairPlay (lower score is better)
  standingsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.fairPlayScore - b.fairPlayScore;
  });

  return standingsList;
}

export function calculateTopScorers(teams: Team[], matches: Match[]): ScorerStat[] {
  const scorersMap = new Map<string, ScorerStat>();

  // Map players for fast lookup
  const playerToTeamMap = new Map<string, { player: Team['players'][0]; team: Team }>();
  teams.forEach((t) => {
    t.players.forEach((p) => {
      playerToTeamMap.set(p.id, { player: p, team: t });
    });
  });

  matches.forEach((m) => {
    (m.events || []).forEach((e) => {
      if (e.type === 'goal') {
        const found = playerToTeamMap.get(e.playerId);
        if (found) {
          const current = scorersMap.get(e.playerId) || {
            playerId: found.player.id,
            playerName: found.player.name,
            playerNumber: found.player.number,
            teamId: found.team.id,
            teamName: found.team.name,
            teamColor: found.team.color,
            goals: 0,
            matchesPlayed: 0
          };
          current.goals += 1;
          scorersMap.set(e.playerId, current);
        }
      }
    });
  });

  return Array.from(scorersMap.values()).sort((a, b) => b.goals - a.goals);
}

export function calculateFairPlay(teams: Team[], matches: Match[]): FairPlayStat[] {
  const statsMap = new Map<string, FairPlayStat>();

  teams.forEach((t) => {
    statsMap.set(t.id, {
      teamId: t.id,
      teamName: t.name,
      teamColor: t.color,
      yellowCards: 0,
      redCards: 0,
      pointsDeducted: 0,
    });
  });

  matches.forEach((m) => {
    (m.events || []).forEach((e) => {
      const stat = statsMap.get(e.teamId);
      if (stat) {
        if (e.type === 'yellow_card') stat.yellowCards += 1;
        if (e.type === 'red_card') stat.redCards += 1;
      }
    });
  });

  const list = Array.from(statsMap.values());
  list.forEach((s) => {
    s.pointsDeducted = s.yellowCards * 1 + s.redCards * 3;
  });

  // Sort ascending: least cards / penalty points is cleanest
  return list.sort((a, b) => a.pointsDeducted - b.pointsDeducted);
}

export function calculateBestDefense(teams: Team[], matches: Match[]): GoalkeeperStat[] {
  const map = new Map<string, GoalkeeperStat>();

  teams.forEach((t) => {
    map.set(t.id, {
      teamId: t.id,
      teamName: t.name,
      teamColor: t.color,
      goalsConceded: 0,
      matchesPlayed: 0,
      averageGoalsConceded: 0
    });
  });

  matches.filter((m) => m.status === 'finished').forEach((m) => {
    const home = map.get(m.homeTeamId);
    const away = map.get(m.awayTeamId);
    if (home && m.awayScore !== undefined) {
      home.matchesPlayed += 1;
      home.goalsConceded += m.awayScore;
    }
    if (away && m.homeScore !== undefined) {
      away.matchesPlayed += 1;
      away.goalsConceded += m.homeScore;
    }
  });

  const list = Array.from(map.values()).filter((item) => item.matchesPlayed > 0);
  list.forEach((item) => {
    item.averageGoalsConceded = Number((item.goalsConceded / item.matchesPlayed).toFixed(2));
  });

  // Sort by fewest goals conceded, then best average
  return list.sort((a, b) => {
    if (a.goalsConceded !== b.goalsConceded) return a.goalsConceded - b.goalsConceded;
    return a.averageGoalsConceded - b.averageGoalsConceded;
  });
}
