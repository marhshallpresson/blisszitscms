import type { AuthFlowError, AuthFlowErrorCode } from '@/types/auth';

const GOOGLE_ERROR_MAP: Record<string, { code: AuthFlowErrorCode; message: string }> = {
  'auth/account-exists-with-different-credential': {
    code: 'ACCOUNT_LINK_REQUIRED',
    message: 'This email already uses password sign-in. Sign in with password to link Google.',
  },
  'auth/popup-blocked': {
    code: 'GOOGLE_POPUP_BLOCKED',
    message: 'Popup was blocked. Redirecting to Google sign-in...',
  },
  'auth/web-storage-unsupported': {
    code: 'GOOGLE_POPUP_BLOCKED',
    message: 'Browser storage blocked popup sign-in. Redirecting to Google sign-in...',
  },
  'auth/operation-not-supported-in-this-environment': {
    code: 'GOOGLE_POPUP_BLOCKED',
    message: 'This browser does not support popup sign-in. Redirecting to Google sign-in...',
  },
  'auth/cancelled-popup-request': {
    code: 'GOOGLE_CANCELLED',
    message: 'Google sign-in was cancelled.',
  },
  'auth/popup-closed-by-user': {
    code: 'GOOGLE_CANCELLED',
    message: 'Google sign-in popup was closed before completion.',
  },
  'auth/operation-not-allowed': {
    code: 'GOOGLE_NOT_ENABLED',
    message: 'Google sign-in is not enabled for this app.',
  },
  'auth/unauthorized-domain': {
    code: 'GOOGLE_NOT_ENABLED',
    message: 'This domain is not authorized for Google sign-in.',
  },
};

const GENERIC_ERROR_MAP: Record<string, string> = {
  'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/user-not-found': 'No account was found for this email.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
};

const normalizeRawCode = (error: unknown) => {
  const rawCode = (error as any)?.code;
  return typeof rawCode === 'string' ? rawCode.trim() : '';
};

const createError = (code: AuthFlowErrorCode, message: string, rawCode?: string): AuthFlowError => {
  const err = new Error(message) as AuthFlowError;
  err.code = code;
  if (rawCode) err.rawCode = rawCode;
  return err;
};

export const createAuthFlowError = (
  code: AuthFlowErrorCode,
  message?: string,
  rawCode?: string,
): AuthFlowError =>
  createError(code, message || 'Authentication failed.', rawCode);

export const mapFirebaseGoogleAuthError = (error: unknown): AuthFlowError => {
  const rawCode = normalizeRawCode(error);
  const mapped = rawCode ? GOOGLE_ERROR_MAP[rawCode] : undefined;
  if (mapped) {
    return createError(mapped.code, mapped.message, rawCode);
  }
  return createError('GOOGLE_FAILED', 'Google sign-in failed. Please try again.', rawCode || undefined);
};

export const getReadableFirebaseAuthMessage = (error: unknown): string => {
  const rawCode = normalizeRawCode(error);
  if (rawCode && GENERIC_ERROR_MAP[rawCode]) return GENERIC_ERROR_MAP[rawCode];
  const rawMessage = (error as any)?.message;
  if (typeof rawMessage === 'string' && rawMessage.trim()) return rawMessage;
  return 'Authentication failed. Please try again.';
};

export const isPopupFallbackError = (error: unknown) => {
  const rawCode = normalizeRawCode(error);
  return (
    rawCode === 'auth/popup-blocked' ||
    rawCode === 'auth/web-storage-unsupported' ||
    rawCode === 'auth/operation-not-supported-in-this-environment'
  );
};

