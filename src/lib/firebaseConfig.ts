
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// IMPORTANT: Firebase Configuration
// -----------------------------------
// This application requires a valid Firebase project configuration.
// You *must* replace the placeholder values below (or preferably, set them
// via environment variables in a .env.local file) with the actual credentials
// from your Firebase project console.
//
// 1. Go to your Firebase project: https://console.firebase.google.com/
// 2. Navigate to Project settings (gear icon).
// 3. Under the "General" tab, find your web app in the "Your apps" section.
// 4. Copy the config object (apiKey, authDomain, projectId, etc.).
// 5. Create a .env.local file in your project root and add these values:
//    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
//    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
//    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
//    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
//    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
//    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
//    NEXT_PUBLIC_APP_ID_IDENTIFIER="your-chosen-app-id-for-firestore" (e.g., "blisszits-cms")
//
// 6. Also, ensure the authentication methods you intend to use (e.g., Email/Password, Google, Apple)
//    are enabled in Firebase Authentication > Sign-in method.
// -----------------------------------

const MISSING_CONFIG_ERROR_PREAMBLE =
  'Firebase Configuration Error: Critical value missing or using placeholder.';
const CONFIG_INSTRUCTIONS =
  'Please ensure this is set correctly in your .env.local file. ' +
  'You can get this value from your Firebase project settings (Project settings > General > Your apps > Firebase SDK snippet).';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID; // Renamed to avoid clash with internal APP_ID

const PLACEHOLDER_API_KEY = "INVALID_API_KEY_REPLACE_ME_IN_ENV_OR_HERE";
const PLACEHOLDER_AUTH_DOMAIN = "INVALID_AUTH_DOMAIN_REPLACE_ME";
const PLACEHOLDER_PROJECT_ID = "INVALID_PROJECT_ID_REPLACE_ME";
const PLACEHOLDER_STORAGE_BUCKET = "INVALID_STORAGE_BUCKET_REPLACE_ME";
const PLACEHOLDER_MESSAGING_SENDER_ID = "INVALID_MESSAGING_SENDER_ID_REPLACE_ME";
const PLACEHOLDER_FIREBASE_APP_ID = "INVALID_APP_ID_REPLACE_ME";


if (!apiKey || apiKey === PLACEHOLDER_API_KEY) {
  console.error(`${MISSING_CONFIG_ERROR_PREAMBLE} 'NEXT_PUBLIC_FIREBASE_API_KEY' is '${apiKey || 'undefined'}'. ${CONFIG_INSTRUCTIONS}`);
}
if (!authDomain || authDomain === PLACEHOLDER_AUTH_DOMAIN) {
  console.error(`${MISSING_CONFIG_ERROR_PREAMBLE} 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN' is '${authDomain || 'undefined'}'. ${CONFIG_INSTRUCTIONS}`);
}
if (!projectId || projectId === PLACEHOLDER_PROJECT_ID) {
  console.error(`${MISSING_CONFIG_ERROR_PREAMBLE} 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' is '${projectId || 'undefined'}'. ${CONFIG_INSTRUCTIONS}`);
}


const firebaseConfig = {
    apiKey: apiKey || PLACEHOLDER_API_KEY,
    authDomain: authDomain || PLACEHOLDER_AUTH_DOMAIN,
    projectId: projectId || PLACEHOLDER_PROJECT_ID,
    storageBucket: storageBucket || PLACEHOLDER_STORAGE_BUCKET,
    messagingSenderId: messagingSenderId || PLACEHOLDER_MESSAGING_SENDER_ID,
    appId: firebaseAppId || PLACEHOLDER_FIREBASE_APP_ID
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined' && getApps().length === 0) {
  // Initialize on client side if not already initialized
  // Server-side initialization might differ or might not be directly needed for this app structure
  // if all Firebase interactions are client-driven.
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Provide default stubs or handle appropriately if Firebase can't init
    // This is a fallback, ideally config should be correct.
    // @ts-ignore
    app = undefined; 
    // @ts-ignore
    db = undefined; 
    // @ts-ignore
    auth = undefined;
  }
} else if (getApps().length > 0) {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  // Fallback for non-browser environments if needed, or if init fails
  // For this Next.js app, client-side init is primary.
  // If you need server-side Firebase Admin SDK, that's a separate setup.
  console.warn("Firebase not initialized (not in browser or already initialized handling). This might be an issue if client-side Firebase is expected.");
   // @ts-ignore
  app = undefined;
   // @ts-ignore
  db = undefined;
   // @ts-ignore
  auth = undefined;
}


// This APP_ID is used for structuring data in Firestore (e.g., /artifacts/{APP_ID}/users/...).
// Ensure this is consistently set, preferably via an environment variable.
const APP_ID_IDENTIFIER = process.env.NEXT_PUBLIC_APP_ID_IDENTIFIER || 'default-app-id-replace-me';
if (APP_ID_IDENTIFIER === 'default-app-id-replace-me') {
    console.warn(
        "Firebase Configuration Warning: 'NEXT_PUBLIC_APP_ID_IDENTIFIER' is using a placeholder value. " +
        "This is used for Firestore data structuring. Please set a unique identifier for your app in .env.local."
    );
}


export { app, db, auth, APP_ID_IDENTIFIER as APP_ID };
