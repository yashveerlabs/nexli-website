import { tenantCol, useCollection } from '@/lib/db';
import type { ExamResult } from '@/types/daily';

/**
 * Rankings data layer. Two deliberately SEPARATE engines (marks vs attendance)
 * that never mix: a merit ranking on normalised exam percentage, and an
 * attendance ranking on present-day percentage. Both read existing tenant data;
 * nothing new is written.
 */

/** Every exam result for the school (across all exams) — aggregated client-side. */
export function useAllExamResults(schoolId?: string) {
  return useCollection<ExamResult>(schoolId ? tenantCol(schoolId, 'exam_results') : null, [schoolId]);
}

export { useStudents, useGrades, useSections } from '@/features/school/data';
export { useExams, useAllAttendance } from '@/features/daily/data';
