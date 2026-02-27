import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const googleAIPlugin = googleAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
});

export const ai = genkit({
  plugins: [googleAIPlugin],
});

export const gemini15Flash =
  process.env.GEMINI_MODEL ||
  process.env.GOOGLE_GENAI_MODEL ||
  'googleai/gemini-2.5-flash';
