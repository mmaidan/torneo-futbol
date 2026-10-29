import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Unsubscribe,
} from 'firebase/auth';
import { getFirebaseApp } from './firebase';

function getFirebaseAuth() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

/**
 * Escucha los cambios de sesión. Si Firebase no está configurado,
 * avisa de inmediato que no hay usuario.
 */
export function subscribeToAuth(callback: (user: User | null) => void): Unsubscribe {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function loginAdmin(email: string, password: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase no está configurado.');
  }
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function logoutAdmin(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
}

export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Email o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos y probá de nuevo.';
    case 'auth/network-request-failed':
      return 'No hay conexión. Revisá tu internet.';
    case 'auth/operation-not-allowed':
      return 'El acceso con email y contraseña no está habilitado en Firebase.';
    default:
      return (err as Error)?.message || 'No se pudo iniciar sesión.';
  }
}
