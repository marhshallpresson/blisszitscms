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

let app: FirebaseApp | undefined; 
let db: Firestore | undefined; 
let auth: Auth | undefined; 
let rtdb: RealtimeDatabase | undefined; 

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
  // This case can be hit during SSR or in non-browser environments.
  // Firebase client SDKs are typically for client-side use.
  // If server-side Firebase Admin SDK is used, its initialization is separate.
  console.warn("Firebase client SDK not initialized (not in browser or during SSR). This might be expected.");
  app = undefined;
  db = undefined;
  auth = undefined;
  rtdb = undefined;
}

// This APP_ID_IDENTIFIER is primarily for namespacing Firestore collections if you were to use a shared Firestore instance.
// For Blisszits, where 'blisszits' is the projectId, collections are already namespaced by project.
// However, if you adopt a pattern like users/{app_id_prefix}_{userId}/data, this can be useful.
// For now, we'll use the projectId itself or a simple identifier.
const APP_ID_IDENTIFIER = firebaseConfig.projectId || 'blisszits'; 

console.log(
    `Firebase Context: Using '${APP_ID_IDENTIFIER}' as the APP_ID for potential data namespacing if complex Firestore structures are used. Current Project ID: ${firebaseConfig.projectId}`
);

export {app, db, auth, rtdb, APP_ID_IDENTIFIER as APP_ID};
