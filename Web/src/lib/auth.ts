import {
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * NEXLI authentication service.
 *
 * - **Staff** sign in with email + password.
 * - **Parents** sign in with phone OTP (no password) via Firebase phone auth +
 *   an invisible reCAPTCHA verifier. (Phone provider must be enabled in the
 *   Firebase console; the app domain must be authorized. Free-tier has a daily
 *   SMS quota — sufficient for pilots.)
 * - SMS MFA is intentionally NOT enabled (paid), but the model is MFA-ready.
 *
 * Profile resolution (role/tenant/flags) happens in SessionProvider after the
 * Firebase user is established — this layer only handles the credential exchange.
 */

/* ---------------- Error mapping ---------------- */

/** Friendly, non-leaky messages for Firebase auth error codes. */
export function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact your administrator.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/invalid-phone-number':
      return 'Enter a valid mobile number.';
    case 'auth/missing-phone-number':
      return 'Enter your mobile number.';
    case 'auth/invalid-verification-code':
      return 'That code is incorrect. Please re-enter it.';
    case 'auth/code-expired':
      return 'This code has expired. Request a new one.';
    case 'auth/captcha-check-failed':
      return 'Verification failed. Please reload and try again.';
    case 'auth/quota-exceeded':
      return 'SMS limit reached for now. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

interface FirebaseAuthError {
  code?: string;
}

function errorCode(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'code' in err) {
    return (err as FirebaseAuthError).code;
  }
  return undefined;
}

/* ---------------- Staff (email + password) ---------------- */

export async function signInStaff(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function sendStaffPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email.trim());
}

/* ---------------- Parent (phone OTP) ---------------- */

/**
 * Create an invisible reCAPTCHA verifier bound to a container element. Required
 * by Firebase before sending an OTP. Call `.clear()` (returned) to dispose.
 */
export function createRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
}

/** Normalize an Indian mobile number to E.164 (+91XXXXXXXXXX). */
export function toE164India(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (raw.trim().startsWith('+')) return `+${digits}`;
  const local = digits.replace(/^0+/, '').slice(-10);
  return `+91${local}`;
}

export function isValidIndianMobile(raw: string): boolean {
  const digits = raw.replace(/\D/g, '').replace(/^0+/, '').slice(-10);
  return /^[6-9]\d{9}$/.test(digits);
}

/** Send an OTP to a phone number. Returns a ConfirmationResult to confirm later. */
export async function sendParentOtp(
  phoneRaw: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, toE164India(phoneRaw), verifier);
}

/** Confirm the 6-digit OTP, signing the parent in. */
export async function confirmParentOtp(
  confirmation: ConfirmationResult,
  code: string,
): Promise<UserCredential> {
  return confirmation.confirm(code);
}

export { errorCode };
