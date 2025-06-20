// src/types/user.ts
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string; 
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // Store as "YYYY-MM-DD" string for date input compatibility
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string; // X
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
    pinterest?: string;
    snapchat?: string;
    reddit?: string;
    whatsapp?: string;
  };
  onboardingCompleted: boolean;
  createdAt?: Timestamp; 
  updatedAt?: Timestamp;
}
