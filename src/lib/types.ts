// src/lib/types.ts
// This file can be removed if all types are moved to src/types/
// For now, keeping EmailPasswordCredentials here if it was referenced elsewhere.
// But ideally, it should be in src/types/auth.ts or similar.

// export interface EmailPasswordCredentials {
//   email: string;
//   password: string;
// }

// Re-export from src/types for easier access if this file is kept
export type { UserProfile } from '@/types/user';
export type { EmailPasswordCredentials } from '@/types/auth'; // Corrected export name
