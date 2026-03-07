// src/types/auth.ts

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export interface GoogleSignInResult {
  redirectStarted: boolean;
}

export type AuthFlowErrorCode =
  | 'ACCOUNT_LINK_REQUIRED'
  | 'GOOGLE_POPUP_BLOCKED'
  | 'GOOGLE_CANCELLED'
  | 'GOOGLE_NOT_ENABLED'
  | 'GOOGLE_FAILED';

export type AuthFlowError = Error & {
  code: AuthFlowErrorCode;
  rawCode?: string;
};
