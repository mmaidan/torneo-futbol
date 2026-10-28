import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  getDocs,
  Unsubscribe 
} from 'firebase/firestore';
import { Tournament } from '../types/tournament';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const STORAGE_KEY_FIREBASE_CONFIG = 'copagol_firebase_config';

export function getSavedFirebaseConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading firebase config from localStorage', e);
  }

  // Fallback to Vite env variables if provided
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
}

let firestoreInstance: Firestore | null = null;

export function getFirebaseFirestore(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;

  const config = getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    firestoreInstance = getFirestore(app);
    return firestoreInstance;
  } catch (err) {
    console.error('Failed to initialize Firebase app:', err);
    return null;
  }
}

/**
 * Sync a tournament to Cloud Firestore
 */
export async function syncTournamentToCloud(tournament: Tournament): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) return false;

  try {
    const tournamentRef = doc(db, 'tournaments', tournament.id);
    await setDoc(tournamentRef, {
      ...tournament,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error syncing tournament to Firestore:', error);
    return false;
  }
}

/**
 * Fetch all tournaments from Cloud Firestore
 */
export async function fetchTournamentsFromCloud(): Promise<Tournament[]> {
  const db = getFirebaseFirestore();
  if (!db) return [];

  try {
    const querySnapshot = await getDocs(collection(db, 'tournaments'));
    const list: Tournament[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Tournament);
    });
    return list;
  } catch (error) {
    console.error('Error fetching tournaments from Firestore:', error);
    return [];
  }
}

/**
 * Subscribe to real-time changes of a tournament from Cloud Firestore
 */
export function subscribeToTournamentCloud(
  tournamentId: string, 
  callback: (tournament: Tournament) => void
): Unsubscribe | null {
  const db = getFirebaseFirestore();
  if (!db) return null;

  try {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    return onSnapshot(tournamentRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as Tournament);
      }
    }, (error) => {
      console.warn('Firestore subscription error:', error);
    });
  } catch (error) {
    console.error('Could not subscribe to tournament:', error);
    return null;
  }
}
