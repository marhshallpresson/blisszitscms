import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

type AdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

const parseAdminConfig = (): AdminConfig => {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin credentials are missing. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.'
    );
  }

  return { projectId, clientEmail, privateKey };
};

let appInstance: App | null = null;

export const getAdminApp = (): App => {
  if (appInstance) return appInstance;

  if (getApps().length > 0) {
    appInstance = getApps()[0];
    return appInstance;
  }

  const { projectId, clientEmail, privateKey } = parseAdminConfig();
  appInstance = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
  return appInstance;
};

export const getAdminAuth = () => getAuth(getAdminApp());
export const getAdminDb = () => getFirestore(getAdminApp());
