import * as refreshTokens from './refreshTokens';
import * as scheduler from './scheduler';
// Export all functions to Firebase
export const scheduledTokenRefresh = refreshTokens.refreshExpiredTokens;
export const processScheduledPosts = scheduler.processScheduledPosts;

// You might also export webhook processing functions if they were Cloud Functions,
// but in this setup, they are Next.js API routes (which run on Vercel/Cloud Run usually)
// and triggered via Cloud Tasks.
