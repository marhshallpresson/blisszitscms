import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize the plugin with your key
const googleAIPlugin = googleAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
});

export const ai = genkit({
  plugins: [googleAIPlugin],
});

// A safe stable fallback
const STABLE_DEFAULT = 'googleai/gemini-1.5-flash';

/**
 * Sanitizes strings from .env to remove accidental quotes or spaces
 */
const sanitize = (val: string | undefined): string => {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
};

/**
 * Ensures the string has the 'googleai/' prefix Genkit requires
 */
const formatModelName = (name: string): string => {
  const clean = sanitize(name);
  if (!clean) return '';
  return clean.startsWith('googleai/') ? clean : `googleai/${clean}`;
};

// 1. Resolve Primary Model
const primaryFromEnv = process.env.GEMINI_MODEL || process.env.GOOGLE_GENAI_MODEL;
const primaryModel = primaryFromEnv ? formatModelName(primaryFromEnv) : STABLE_DEFAULT;

// 2. Resolve Fallback List
const fallbackList = (process.env.GEMINI_FALLBACK_MODELS || '')
  .split(',')
  .map(formatModelName)
  .filter(Boolean);

// 3. Build the final chain (Primary -> Fallbacks -> Default)
// Using Set to ensure every string is unique
export const geminiModelChain = Array.from(
  new Set([primaryModel, ...fallbackList, STABLE_DEFAULT])
);

// Export the first model for simple imports
export const gemini15Flash = geminiModelChain[0];
