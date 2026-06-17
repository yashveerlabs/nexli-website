import type { TenantRecord } from './models';

/* ============================ Student Information System ============================ */

export type Gender = 'male' | 'female' | 'other';
export type StudentStatus = 'active' | 'inactive' | 'transferred' | 'graduated' | 'left';
export type SocialCategory = 'general' | 'obc' | 'sc' | 'st' | 'ews' | 'other';
export type AdmissionType = 'regular' | 'rte' | 'transfer' | 'mid_term';
export type GuardianRelation = 'father' | 'mother' | 'guardian' | 'grandparent' | 'sibling' | 'other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';

/** A parent/guardian linked to a student. Primary guardian may have a parent login (uid). */
export interface Guardian {
  relation: GuardianRelation;
  name: string;
  phone?: string;
  email?: string;
  occupation?: string;
  qualification?: string;
  annualIncome?: number;
  isPrimary?: boolean;
  isEmergencyContact?: boolean;
  /** Linked parent Auth account (phone-OTP), set when the parent is provisioned. */
  uid?: string;
}

/**
 * A student record (tenant-scoped: /schools/{id}/students/{id}). Holds identity,
 * enrollment, category and guardian data. Medical/counseling/POCSO data lives in
 * separate restricted collections — never here.
 */
export interface Student extends TenantRecord {
  admissionNo: string;
  rollNo?: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  gender: Gender;
  dob?: number;
  bloodGroup?: BloodGroup;
  photoUrl?: string;

  // Enrollment
  gradeId?: string;
  gradeName?: string;
  sectionId?: string;
  sectionName?: string;
  house?: string;
  academicYear?: string;
  status: StudentStatus;
  admissionDate?: number;
  admissionType?: AdmissionType;

  // Category / govt ids (store masked where sensitive)
  category?: SocialCategory;
  rteQuota?: boolean;
  religion?: string;
  motherTongue?: string;
  nationality?: string;
  aadhaarLast4?: string;
  apaarId?: string;
  penId?: string;

  // Contact
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  guardians?: Guardian[];

  // Logistics
  transportRouteId?: string;
  transportStop?: string;
  isHosteller?: boolean;
  blockId?: string;

  // History
  previousSchool?: string;
  tcNumber?: string;
  siblingStudentIds?: string[];
  specialNeeds?: boolean;
  tags?: string[];
}

/* ============================ Admissions & enrollment ============================ */

export type AdmissionStage =
  | 'enquiry'
  | 'application'
  | 'document_verification'
  | 'assessment'
  | 'interview'
  | 'offer'
  | 'admitted'
  | 'rejected'
  | 'waitlisted'
  | 'withdrawn';

export interface AdmissionDocumentItem {
  label: string;
  received?: boolean;
}

/** An admission application moving through the enrollment pipeline. */
export interface Admission extends TenantRecord {
  applicantName: string;
  gender?: Gender;
  dob?: number;
  gradeAppliedId?: string;
  gradeAppliedName?: string;
  academicYear?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  source?: string;
  stage: AdmissionStage;
  appliedDate?: number;
  assessmentScore?: number;
  interviewNotes?: string;
  rteApplication?: boolean;
  category?: SocialCategory;
  documents?: AdmissionDocumentItem[];
  notes?: string;
  /** Set when the application is admitted and converted to a Student. */
  convertedStudentId?: string;
}

export const ADMISSION_STAGES: AdmissionStage[] = [
  'enquiry',
  'application',
  'document_verification',
  'assessment',
  'interview',
  'offer',
  'admitted',
];

/* ============================ Transfer Certificate ============================ */

export type TCStatus = 'requested' | 'clearance_pending' | 'approved' | 'issued' | 'rejected';

export interface TCClearanceItem {
  department: string;
  cleared?: boolean;
  note?: string;
}

/** A transfer / leaving certificate request + clearance workflow. */
export interface TransferCertificate extends TenantRecord {
  studentId: string;
  studentName: string;
  admissionNo?: string;
  gradeName?: string;
  reason?: string;
  status: TCStatus;
  requestedDate?: number;
  issuedDate?: number;
  tcNumber?: string;
  clearances?: TCClearanceItem[];
  remarks?: string;
}
