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
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
    pinterest?: string;
    snapchat?: string;
    reddit?: string;
    whatsapp?: string;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
