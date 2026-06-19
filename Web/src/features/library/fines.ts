/**
 * Pure library-fine logic — NO Firebase imports, so it is unit-testable in isolation.
 *
 * `shared.ts` carries a top-level `firebase/firestore` import (for the atomic
 * issue/return transactions), which pulls the whole Firebase SDK into any test that
 * imports it. The overdue/fine maths is pure arithmetic over a circulation record,
 * so it lives here and is re-exported from `shared.ts` for backwards compatibility
 * (existing `./shared` imports keep working unchanged).
 */
import type { BookCirculation } from '@/types/daily';

export const DAY_MS = 24 * 60 * 60 * 1000;

/** A circulation is overdue when not returned/lost and its due date has passed. */
export function isOverdue(c: BookCirculation, now = Date.now()): boolean {
  return c.status !== 'returned' && c.status !== 'lost' && !c.returnedDate && c.dueDate < now;
}

/** Whole days a circulation is overdue (0 when not overdue). */
export function daysOverdue(c: BookCirculation, now = Date.now()): number {
  if (!isOverdue(c, now)) return 0;
  return Math.max(0, Math.floor((now - c.dueDate) / DAY_MS));
}

/**
 * Default overdue fine in rupees per day. Configurable: there is no per-school
 * library fine-rate setting yet, so this named constant is the single source of
 * truth. When a Library Settings UI is added, read the school's rate and fall
 * back to this value. (See NOTES — a rate-config UI should follow.)
 */
export const DEFAULT_FINE_PER_DAY = 2;

/**
 * Fine owed on a circulation, in rupees.
 *
 * If a fine was explicitly recorded on the loan (e.g. settled on return) that
 * stored value wins. Otherwise the fine is computed for real from how many whole
 * days the loan is overdue × the per-day rate. Returns 0 when nothing is overdue.
 */
export function computeFine(c: BookCirculation, ratePerDay = DEFAULT_FINE_PER_DAY, now = Date.now()): number {
  if (typeof c.fine === 'number') return c.fine;
  return daysOverdue(c, now) * ratePerDay;
}
