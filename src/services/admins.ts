import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { AdminRole, isPasswordUserEmail } from './auth';

export interface AdminEntry {
  /** ID del documento: email de Google o usuario@torneo.local */
  email: string;
  rol: AdminRole;
  nombre?: string;
  usuario?: string;
  creadoPor?: string;
  creadoEn?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  return EMAIL_RE.test(normalizeEmail(raw));
}

export function entryLabel(entry: AdminEntry): string {
  return isPasswordUserEmail(entry.email) ? `Usuario: ${entry.usuario || entry.email.split('@')[0]}` : entry.email;
}

function requireDb() {
  const db = getFirebaseFirestore();
  if (!db) throw new Error('Firebase no está configurado.');
  return db;
}

export async function listAdmins(): Promise<AdminEntry[]> {
  const snap = await getDocs(collection(requireDb(), 'admins'));
  const list: AdminEntry[] = [];
  snap.forEach((d) => {
    const data = d.data();
    list.push({
      email: d.id,
      rol: data.rol === 'superadmin' ? 'superadmin' : 'admin',
      nombre: data.nombre,
      usuario: data.usuario,
      creadoPor: data.creadoPor,
      creadoEn: data.creadoEn,
    });
  });
  return list.sort((a, b) => (a.nombre || a.email).localeCompare(b.nombre || b.email));
}

/** Alta (o cambio de rol) de un administrador. */
export async function addAdmin(
  entry: { email: string; rol: AdminRole; nombre?: string; usuario?: string },
  creadoPor: string
): Promise<void> {
  const data: Record<string, string> = {
    rol: entry.rol,
    creadoPor: normalizeEmail(creadoPor),
    creadoEn: new Date().toISOString(),
  };
  if (entry.nombre) data.nombre = entry.nombre.trim();
  if (entry.usuario) data.usuario = entry.usuario.trim().toLowerCase();
  await setDoc(doc(requireDb(), 'admins', normalizeEmail(entry.email)), data);
}

/** Baja: quita el acceso. La cuenta de Firebase queda sin permisos. */
export async function removeAdmin(email: string): Promise<void> {
  await deleteDoc(doc(requireDb(), 'admins', normalizeEmail(email)));
}
