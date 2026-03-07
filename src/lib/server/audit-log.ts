import { FieldValue, type Firestore } from 'firebase-admin/firestore';

export interface AuditLogEvent {
  workspaceId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  outcome: 'success' | 'failure';
  details?: Record<string, unknown>;
}

export const writeAuditLog = async (db: Firestore, event: AuditLogEvent): Promise<void> => {
  await db.collection(`workspaces/${event.workspaceId}/audit_logs`).add({
    ...event,
    createdAt: FieldValue.serverTimestamp(),
  });
};
