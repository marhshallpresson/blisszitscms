# `src/ai/genkit.ts`

```typescript
import { configureGenkit } from '@genkit-ai/core';
import { gemini } from '@genkit-ai/google-genai';

configureGenkit({
  plugins: [
    gemini({
      apiKey: process.env.GEMINI_API_KEY!,
      defaultOutputModel: 'gemini-2.0-flash',
      defaultFlowRuntime: 'node',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const ai = gemini; // Export the Gemini instance for use in auto-responder etc.
```

# `functions/src/index.ts` (Firebase Cloud Functions entry point)

```typescript
import * as refreshTokens from './refreshTokens';
import * as scheduler from './scheduler';
// Export all functions to Firebase
export const scheduledTokenRefresh = refreshTokens.refreshExpiredTokens;
export const processScheduledPosts = scheduler.processScheduledPosts;

// You might also export webhook processing functions if they were Cloud Functions,
// but in this setup, they are Next.js API routes (which run on Vercel/Cloud Run usually)
// and triggered via Cloud Tasks.
```

# Additional Setup

1.  **Install `@google-cloud/tasks`:**
    ```bash
    npm install @google-cloud/tasks
    ```
2.  **Genkit Configuration:**
    Ensure `src/ai/genkit.ts` is configured correctly. Create this file if it doesn't exist, using the content above. Also, ensure `GEMINI_API_KEY` is set in your `.env`.
3.  **Firebase Project Setup:**
    *   Enable the Cloud Tasks API in your Google Cloud Project.
    *   Create two Cloud Task queues: `webhook-processor` and `linkedin-webhook-processor`.
    *   Ensure your service account (`FIREBASE_CLIENT_EMAIL`) has the `Cloud Tasks Enqueuer` role and the `Service Account Token Creator` role.
4.  **Meta and LinkedIn App Setup:**
    *   Refer to sections 3 and 4 of `social-media-platform-final-v3.md` for detailed instructions on setting up your Meta Business App (including Tech Provider Registration and Facebook Login for Business `config_id`) and LinkedIn App (Community Management API).
    *   Configure webhooks for Meta and LinkedIn to point to your deployed `NEXT_PUBLIC_APP_URL/api/webhooks/meta` and `NEXT_PUBLIC_APP_URL/api/webhooks/linkedin` respectively.

**To run the project:**
1.  Fill in all placeholder values in the newly created `.env` file.
2.  Install dependencies: `npm install`
3.  Run the development server: `npm run dev`
4.  Deploy Cloud Functions (if applicable): `firebase deploy --only functions`

Please let me know if you have any questions or need further modifications.
