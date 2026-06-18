import { addDoc, deleteDoc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { tenantCol, tenantDoc, useCollection } from '@/lib/db';

/**
 * Counselling (student welfare) data layer.
 *
 * Confidential case notes live in the tenant-scoped `counseling` collection, which
 * the Firestore rules lock to counsellors, the special educator and principal-
 * equivalents (Phase A). This is NOT child-protection (POCSO) — that is the
 * separate, more-restricted Safeguarding module.
 */
export interface Actor {
  uid: string;
  name?: string;
}

export type CounselingType = 'wellbeing' | 'academic' | 'behavioural' | 'career' | 'family' | 'other';

export interface CounselingSession {
  id: string;
  schoolId: string;
  studentId: string;
  studentName?: string;
  studentClass?: string;
  /** Session date (epoch ms). */
  date: number;
  type: CounselingType;
  /** Confidential session notes. */
  summary: string;
  followUpRequired?: boolean;
  followUpDate?: number;
  counselorName?: string;
  createdAt?: number;
  createdBy?: string;
  lastModifiedAt?: number;
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k as keyof T] = v as T[keyof T];
  return out;
}

/** All counselling sessions for the school, newest first. */
export function useCounselingSessions(schoolId?: string) {
  return useCollection<CounselingSession>(
    schoolId ? query(tenantCol(schoolId, 'counseling'), orderBy('date', 'desc')) : null,
    [schoolId],
  );
}

export async function createCounselingSession(
  schoolId: string,
  data: Omit<CounselingSession, 'id'>,
  actor: Actor,
): Promise<string> {
  const ref = await addDoc(tenantCol(schoolId, 'counseling'), {
    ...stripUndefined(data),
    schoolId,
    counselorName: actor.name,
    createdAt: Date.now(),
    createdBy: actor.uid,
    serverCreatedAt: serverTimestamp(),
  });
  return ref.id;
}

export function updateCounselingSession(
  schoolId: string,
  id: string,
  patch: Partial<Omit<CounselingSession, 'id' | 'schoolId' | 'createdAt' | 'createdBy'>>,
): Promise<void> {
  return updateDoc(tenantDoc(schoolId, 'counseling', id), { ...stripUndefined(patch), lastModifiedAt: Date.now() });
}

export function deleteCounselingSession(schoolId: string, id: string): Promise<void> {
  return deleteDoc(tenantDoc(schoolId, 'counseling', id));
}

export { useStudents } from '@/features/school/data';
