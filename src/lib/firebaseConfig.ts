
// Your web app's Firebase configuration directly embedded
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_e8VnGjnPALsVDYeBvAlQaWCvNDIUOYM",
  authDomain: "blisszits.firebaseapp.com",
  projectId: "blisszits",
  storageBucket: "blisszits.firebasestorage.app",
  messagingSenderId: "668053435356",
  appId: "1:668053435356:web:7c0d83f6d9ee5c50a61519",
  measurementId: "G-0FK5RSHQZ5"
};

import {initializeApp, getApps, type FirebaseApp} from 'firebase/app';
import {getDatabase, type Database as RealtimeDatabase} from 'firebase/database';
import {getFirestore, type Firestore} from 'firebase/firestore';
import {getAuth, type Auth} from 'firebase/auth';

let app: FirebaseApp | undefined; // Allow undefined
let db: Firestore | undefined; // Allow undefined
let auth: Auth | undefined; // Allow undefined
let rtdb: RealtimeDatabase | undefined; // Allow undefined

if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      rtdb = getDatabase(app);
    } catch (error) {
      console.error('Firebase initialization error:', error);
      app = undefined;
      db = undefined;
      auth = undefined;
      rtdb = undefined;
    }
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    rtdb = getDatabase(app);
  }
} else {
  console.warn("Firebase not initialized (not in browser or an unexpected state). This is acceptable for a corporate site if no client-side Firebase features are used.");
  app = undefined;
  db = undefined;
  auth = undefined;
  rtdb = undefined;
}

const APP_ID_IDENTIFIER = 'blisszits-corporate-site'; // Changed for corporate site context

console.log(
    `Firebase Configuration Note: Using '${APP_ID_IDENTIFIER}' as the APP_ID_IDENTIFIER for Firestore structuring if used. ` +
    "Ensure your Firestore security rules and data paths align with this if any Firebase features are enabled."
);

export {app, db, auth, rtdb, APP_ID_IDENTIFIER as APP_ID};
