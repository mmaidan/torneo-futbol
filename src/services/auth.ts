import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Unsubscribe,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseApp, getFirebaseFirestore, getSavedFirebaseConfig } from './firebase';

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

export type AdminRole = 'superadmin' | 'admin';

// Los usuarios con usuario/contraseña se guardan en Firebase como
// "usuario@torneo.local" (no es un correo real, nadie lo recibe).
export const USER_EMAIL_DOMAIN = 'torneo.local';
export const MIN_PASSWORD_LENGTH = 6;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(raw: string): boolean {
  return /^[a-z0-9._-]{3,20}$/.test(normalizeUsername(raw));
}

export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${USER_EMAIL_DOMAIN}`;
}

export function isPasswordUserEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${USER_EMAIL_DOMAIN}`);
}

/**
 * El rol sale del documento admins/{email en minúsculas}, que solo puede
 * crear el superadmin (el primero se crea a mano en la consola de Firebase).
 * Las reglas de Firestore son las que realmente protegen la escritura;
 * esto solo decide qué controles se muestran.
 */
export async function getAdminRole(user: User): Promise<AdminRole | null> {
  const db = getFirebaseFirestore();
  const email = user.email?.toLowerCase();
  if (!db || !email) return null;
  try {
    const snap = await getDoc(doc(db, 'admins', email));
    if (!snap.exists()) return null;
    return snap.data().rol === 'superadmin' ? 'superadmin' : 'admin';
  } catch (err) {
    console.warn('No se pudo verificar el rol de administrador:', err);
    return null;
  }
}

export async function loginWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase no está configurado.');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(auth, provider);
}

export async function loginWithPassword(username: string, password: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase no está configurado.');
  }
  await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
}

/**
 * Crea la cuenta de Firebase Auth de un usuario nuevo SIN cerrar la sesión
 * del superadmin: se usa una app de Firebase secundaria y temporal.
 * Si la cuenta ya existía (por ejemplo, de una baja anterior), solo sirve
 * si la contraseña coincide, porque desde el navegador no se puede cambiar
 * la contraseña de otra persona.
 */
export async function createPasswordAccount(username: string, password: string): Promise<void> {
  const config = getSavedFirebaseConfig();
  if (!config) {
    throw new Error('Firebase no está configurado.');
  }
  const email = usernameToEmail(username);
  const secondary = initializeApp(config, `alta-${Date.now()}`);
  const auth = getAuth(secondary);
  try {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if ((err as { code?: string })?.code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch {
          throw new Error(
            'Ese usuario ya existió antes con otra contraseña. Usá la misma contraseña de antes o elegí otro usuario.'
          );
        }
      } else {
        throw err;
      }
    }
  } finally {
    await signOut(auth).catch(() => {});
    await deleteApp(secondary).catch(() => {});
  }
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
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Cerraste la ventana de Google antes de terminar.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente. Permitila e intentá de nuevo.';
    case 'auth/unauthorized-domain':
      return 'Este sitio no está autorizado en Firebase (Authentication → Settings → Authorized domains).';
    case 'auth/operation-not-allowed':
      return 'Falta habilitar este método de acceso en Firebase (Authentication → Sign-in method).';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Usuario o contraseña incorrectos.';
    case 'auth/weak-password':
      return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos y probá de nuevo.';
    case 'auth/network-request-failed':
      return 'No hay conexión. Revisá tu internet.';
    default:
      return (err as Error)?.message || 'No se pudo iniciar sesión.';
  }
}
