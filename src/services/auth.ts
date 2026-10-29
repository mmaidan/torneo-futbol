import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  Unsubscribe,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseApp, getFirebaseFirestore } from './firebase';

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
      return 'El acceso con Google no está habilitado en Firebase.';
    case 'auth/network-request-failed':
      return 'No hay conexión. Revisá tu internet.';
    default:
      return (err as Error)?.message || 'No se pudo iniciar sesión.';
  }
}
