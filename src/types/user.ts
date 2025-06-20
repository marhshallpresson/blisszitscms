
// src/types/user.ts
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string; 
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // Store as "YYYY-MM-DD" string for date input compatibility
  interests?: string[];
  onboardingCompleted: boolean;
  createdAt?: Timestamp; 
  updatedAt?: Timestamp;
}
