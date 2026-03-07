// src/lib/firebaseConfig.ts
'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Ensure critical variables are present
const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

// Initialize Firebase only if config is valid
const app = isConfigured 
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)) 
  : null;

// Handle App Check & Browser-only logic
if (app && typeof window !== 'undefined') {
  const isAppCheckEnabledByEnv = process.env.NEXT_PUBLIC_ENABLE_APP_CHECK === 'true';
  const shouldEnableAppCheck = process.env.NODE_ENV === 'production' || isAppCheckEnabledByEnv;
  const appCheckDebugToken =
    process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN ??
    process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN_FROM_RUNTIME;
  let appCheckInitialized = false;

  const initializeAppCheckWhenReady = () => {
    if (!shouldEnableAppCheck || appCheckInitialized) return;

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.warn('Firebase App Check skipped: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set.');
      return;
    }

    try {
      // Use globalThis so the Firebase SDK picks up the debug token before init.
      if (process.env.NODE_ENV === 'development' || appCheckDebugToken) {
        (globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken || true;
      }

      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      appCheckInitialized = true;
    } catch (e) {
      console.error('Firebase App Check failed to initialize:', e);
    }
  };

  if (shouldEnableAppCheck) {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      initializeAppCheckWhenReady();
    } else {
      window.addEventListener('online', initializeAppCheckWhenReady, { once: true });
    }
  }
}

// Initialize services
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const rtdb = app ? getDatabase(app) : null;

export { app, auth, db, rtdb, isConfigured };
