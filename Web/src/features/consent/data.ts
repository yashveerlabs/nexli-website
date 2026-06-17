/**
 * Privacy & Consent (DPDP) data layer. Consent purposes + records live under the
 * shared Compliance & Governance (P7) data layer — this module re-exports the
 * relevant readers/writers so the consent feature keeps a clean local import
 * surface without duplicating the Firestore plumbing.
 *
 * NOTE (P9): `consent_records` currently falls under the generic tenant rule.
 * Consent decisions are personal data under the DPDP Act and should likely be a
 * restricted collection (DPO / consent officer / principal) — flag for hardening.
 */
export {
  useConsentPurposes,
  createConsentPurpose,
  updateConsentPurpose,
  deleteConsentPurpose,
  useConsentRecords,
  upsertConsentRecord,
  createConsentRecord,
  type Actor,
} from '@/features/compliance/data';

export { useStudents } from '@/features/school/data';
