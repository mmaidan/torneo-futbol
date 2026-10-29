import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import type { AdminRole } from './auth';

export interface AdminEntry {
  email: string;
  rol: AdminRole;
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
      creadoPor: data.creadoPor,
      creadoEn: data.creadoEn,
    });
  });
  return list.sort((a, b) => a.email.localeCompare(b.email));
}

/** Alta (o cambio de rol) de un administrador por su email de Google. */
export async function addAdmin(email: string, rol: AdminRole, creadoPor: string): Promise<void> {
  await setDoc(doc(requireDb(), 'admins', normalizeEmail(email)), {
    rol,
    creadoPor: normalizeEmail(creadoPor),
    creadoEn: new Date().toISOString(),
  });
}

/** Baja de un administrador. */
export async function removeAdmin(email: string): Promise<void> {
  await deleteDoc(doc(requireDb(), 'admins', normalizeEmail(email)));
}
