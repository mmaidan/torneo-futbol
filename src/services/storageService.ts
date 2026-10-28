import { Tournament } from '../types/tournament';
import { initialMockTournament } from '../utils/mockData';
import { syncTournamentToCloud } from './firebase';

const STORAGE_KEY_TOURNAMENTS = 'copagol_tournaments_list';
const STORAGE_KEY_ACTIVE_ID = 'copagol_active_tournament_id';

export function loadAllTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOURNAMENTS);
    if (!raw) {
      // First time loading: set default demo tournament
      const initial = [initialMockTournament];
      localStorage.setItem(STORAGE_KEY_TOURNAMENTS, JSON.stringify(initial));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, initialMockTournament.id);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [initialMockTournament];
  } catch (err) {
    console.error('Error loading tournaments from localStorage:', err);
    return [initialMockTournament];
  }
}

export function getActiveTournamentId(): string {
  const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  if (saved) return saved;
  const list = loadAllTournaments();
  return list[0]?.id || initialMockTournament.id;
}

export function setActiveTournamentId(id: string): void {
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
}

export function saveTournament(tournament: Tournament): void {
  try {
    const all = loadAllTournaments();
    const existingIndex = all.findIndex((t) => t.id === tournament.id);

    const updated = {
      ...tournament,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      all[existingIndex] = updated;
    } else {
      all.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY_TOURNAMENTS, JSON.stringify(all));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, tournament.id);

    // Background sync to Firebase if configured
    syncTournamentToCloud(updated).catch((err) => {
      console.warn('Silent cloud sync failed:', err);
    });
  } catch (err) {
    console.error('Error saving tournament:', err);
  }
}

export function deleteTournament(id: string): Tournament[] {
  const all = loadAllTournaments().filter((t) => t.id !== id);
  if (all.length === 0) {
    all.push(initialMockTournament);
  }
  localStorage.setItem(STORAGE_KEY_TOURNAMENTS, JSON.stringify(all));
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, all[0].id);
  return all;
}

export function exportTournamentToJson(tournament: Tournament): void {
  const jsonStr = JSON.stringify(tournament, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tournament.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
