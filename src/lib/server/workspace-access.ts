import type { Firestore } from 'firebase-admin/firestore';

export const assertWorkspaceOwner = async (
  db: Firestore,
  workspaceId: string,
  userId: string
): Promise<void> => {
  const workspaceRef = db.collection('workspaces').doc(workspaceId);
  const workspaceSnap = await workspaceRef.get();
  if (!workspaceSnap.exists) {
    throw new Error('Workspace not found.');
  }
  const ownerId = workspaceSnap.data()?.ownerId as string | undefined;
  if (!ownerId || ownerId !== userId) {
    throw new Error('Forbidden workspace access.');
  }
};
