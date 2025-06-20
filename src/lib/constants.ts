
export type ContentStatus = 'Draft' | 'In Progress' | 'For Review' | 'Approved' | 'Published';

export const CONTENT_STATUSES: ContentStatus[] = ['Draft', 'In Progress', 'For Review', 'Approved', 'Published'];

// APP_ID could also be defined here if not coming from environment variables or firebaseConfig.ts
// export const APP_ID = "default-app-id"; 
