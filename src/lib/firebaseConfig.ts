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
}

const APP_ID_IDENTIFIER = firebaseConfig.projectId || 'blisszits'; 

export {app, db, auth, rtdb, APP_ID_IDENTIFIER as APP_ID};
