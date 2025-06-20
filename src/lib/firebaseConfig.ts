
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
// 6. Also, ensure "Anonymous" sign-in is enabled in Firebase Authentication > Sign-in method.
// -----------------------------------

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "INVALID_API_KEY_REPLACE_ME_IN_ENV_OR_HERE",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "INVALID_AUTH_DOMAIN_REPLACE_ME",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "INVALID_PROJECT_ID_REPLACE_ME",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "INVALID_STORAGE_BUCKET_REPLACE_ME",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "INVALID_MESSAGING_SENDER_ID_REPLACE_ME",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "INVALID_APP_ID_REPLACE_ME"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
auth = getAuth(app);

// This APP_ID is used for structuring data in Firestore (e.g., /artifacts/{APP_ID}/users/...).
// Ensure this is consistently set, preferably via an environment variable.
const APP_ID = process.env.NEXT_PUBLIC_APP_ID_IDENTIFIER || 'default-app-id-replace-me';


export { app, db, auth, APP_ID };
