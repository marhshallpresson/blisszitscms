
// Your web app's Firebase configuration directly embedded
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_e8VnGjnPALsVDYeBvAlQaWCvNDIUOYM",
  authDomain: "blisszits.firebaseapp.com", // Ensure this domain, and any domain you serve your app from (e.g., localhost for dev), are listed in Firebase Console > Authentication > Settings > Authorized domains.
  projectId: "blisszits",
  storageBucket: "blisszits.firebasestorage.app",
  messagingSenderId: "668053435356",
  appId: "1:668053435356:web:7c0d83f6d9ee5c50a61519",
  measurementId: "G-0FK5RSHQZ5"
};

// Import the functions you need from the SDKs you need
// import { getAnalytics } from "firebase/analytics"; // Analytics can be added if needed

import {initializeApp, getApps, type FirebaseApp} from 'firebase/app';
import {getDatabase, type Database as RealtimeDatabase} from 'firebase/database';
import {getFirestore, type Firestore} from 'firebase/firestore';
import {getAuth, type Auth} from 'firebase/auth';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let rtdb: RealtimeDatabase;
// let analytics; // Uncomment if getAnalytics is used

if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      rtdb = getDatabase(app);
      // analytics = getAnalytics(app); // Initialize analytics if needed
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // @ts-ignore
      app = undefined;
      // @ts-ignore
      db = undefined;
      // @ts-ignore
      auth = undefined;
      // @ts-ignore
      rtdb = undefined;
    }
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    rtdb = getDatabase(app);
    // analytics = getAnalytics(app); // Get analytics instance if app is already initialized
  }
} else {
  // Fallback for non-browser environments if needed
  // For this Next.js app, client-side init is primary.
  console.warn("Firebase not initialized (not in browser or an unexpected state). This might be an issue if client-side Firebase is expected.");
   // @ts-ignore
  app = undefined;
   // @ts-ignore
  db = undefined;
   // @ts-ignore
  auth = undefined;
   // @ts-ignore
  rtdb = undefined;
}

// This APP_ID_IDENTIFIER is used for structuring data in Firestore (e.g., /artifacts/{APP_ID_IDENTIFIER}/users/...).
// It's good practice to make this unique for your app.
const APP_ID_IDENTIFIER = 'blisszits-cms';

console.log(
    `Firebase Configuration Note: Using '${APP_ID_IDENTIFIER}' as the APP_ID_IDENTIFIER for Firestore structuring. ` +
    "Ensure your Firestore security rules and data paths align with this."
);


export {app, db, auth, rtdb, APP_ID_IDENTIFIER as APP_ID};
// export { app, db, auth, analytics, APP_ID_IDENTIFIER as APP_ID }; // export analytics if used

