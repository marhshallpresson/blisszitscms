import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';

export interface StoredOAuthCredential {
  network: string;
  workspaceId: string;
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: string;
  scope?: string[];
  accountId?: string;
  accountName?: string;
}

type CredentialDoc = {
  workspaceId: string;
  network: string;
  algorithm: 'aes-256-gcm';
  iv: string;
  authTag: string;
  ciphertext: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const COLLECTION = 'oauth_credentials';
const PREFIX = `firestore:${COLLECTION}/`;

const getKey = (): Buffer => {
  const value = process.env.TOKEN_ENCRYPTION_KEY;
  if (!value) {
    throw new Error('Missing TOKEN_ENCRYPTION_KEY for OAuth credential encryption.');
  }
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be base64 for a 32-byte key.');
  }
  return key;
};

const encryptCredential = (credential: StoredOAuthCredential) => {
  const iv = randomBytes(12);
  const key = getKey();
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(credential), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
};

const decryptCredential = (doc: CredentialDoc): StoredOAuthCredential => {
  const key = getKey();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(doc.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(doc.authTag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(doc.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString('utf8')) as StoredOAuthCredential;
};

export const saveCredential = async (
  db: Firestore,
  credential: StoredOAuthCredential,
  existingRef?: string
): Promise<string> => {
  const encrypted = encryptCredential(credential);
  const docId = existingRef?.startsWith(PREFIX)
    ? existingRef.slice(PREFIX.length)
    : db.collection(COLLECTION).doc().id;

  await db.collection(COLLECTION).doc(docId).set(
    {
      workspaceId: credential.workspaceId,
      network: credential.network,
      algorithm: 'aes-256-gcm',
      ...encrypted,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return `${PREFIX}${docId}`;
};

export const getCredential = async (
  db: Firestore,
  credentialRef: string
): Promise<StoredOAuthCredential> => {
  if (!credentialRef.startsWith(PREFIX)) {
    throw new Error('Unsupported credential reference.');
  }
  const id = credentialRef.slice(PREFIX.length);
  const snap = await db.collection(COLLECTION).doc(id).get();
  if (!snap.exists) {
    throw new Error('OAuth credential not found.');
  }
  return decryptCredential(snap.data() as CredentialDoc);
};
