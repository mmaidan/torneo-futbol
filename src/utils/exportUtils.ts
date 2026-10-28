import { Tournament, Match, StandingRow } from '../types/tournament';
import { calculateStandings } from './standingsCalculator';

export function generateWhatsAppStandingsText(tournament: Tournament): string {
  const standings = calculateStandings(tournament.teams, tournament.matches, tournament.config);
  
  let text = `🏆 *${tournament.name.toUpperCase()}*\n`;
  text += `⚽ Modalidad: Fútbol ${tournament.modality.replace('f', '')} | ${tournament.category}\n`;
  text += `📅 Actualizado: ${new Date().toLocaleDateString('es-AR')}\n\n`;
  text += `*TABLA DE POSICIONES:*\n`;
  text += `Pos | Equipo | PJ | DG | *PTS*\n`;
  text += `------------------------------\n`;

  standings.forEach((s, idx) => {
    const medal = idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : `${idx + 1}. `;
    const sign = s.goalDiff > 0 ? `+${s.goalDiff}` : `${s.goalDiff}`;
    text += `${medal}*${s.teamShortName}* (${s.teamName}) - PJ: ${s.played} | DG: ${sign} | *${s.points} pts*\n`;
  });

  text += `\n📲 *Gestionado con CopaGol*\n`;
  return text;
}

export function generateWhatsAppRoundFixtureText(tournament: Tournament, roundNumber: number): string {
  const roundMatches = tournament.matches.filter((m) => m.round === roundNumber);
  const teamMap = new Map(tournament.teams.map((t) => [t.id, t.name]));

  let text = `⚽ *${tournament.name.toUpperCase()}*\n`;
  text += `📌 *FECHA ${roundNumber} - PROGRAMACIÓN*\n`;
  text += `--------------------------------\n\n`;

  if (roundMatches.length === 0) {
    text += `No hay partidos programados para esta fecha aún.\n`;
  } else {
    roundMatches.forEach((m) => {
      const home = teamMap.get(m.homeTeamId) || 'Equipo 1';
      const away = teamMap.get(m.awayTeamId) || 'Equipo 2';
      const time = m.time ? `🕒 ${m.time} hs` : '';
      const pitch = m.pitch ? `📍 ${m.pitch}` : '';
      const date = m.date ? `📆 ${m.date}` : '';

      if (m.status === 'finished') {
        text += `✅ *${home} ${m.homeScore} - ${m.awayScore} ${away}*\n`;
        text += `   ${date} | ${pitch}\n\n`;
      } else if (m.status === 'live') {
        text += `🔴 *EN VIVO: ${home} ${m.homeScore || 0} - ${m.awayScore || 0} ${away}*\n`;
        text += `   ${pitch}\n\n`;
      } else {
        text += `⚔️ *${home} vs ${away}*\n`;
        text += `   ${date} ${time} | ${pitch}\n\n`;
      }
    });
  }

  text += `📲 *CopaGol Torneos*`;
  return text;
}
