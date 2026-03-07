import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const googleAIPlugin = googleAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
});

export const ai = genkit({
  plugins: [googleAIPlugin],
});

const normalizeModelName = (model: string): string => {
  const trimmed = model.trim();
  if (!trimmed) return '';
  return trimmed.includes('/') ? trimmed : `googleai/${trimmed}`;
};

const parseModelList = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map(normalizeModelName)
    .filter(Boolean);
};

const primaryModel = normalizeModelName(
  process.env.GEMINI_MODEL ||
    process.env.GOOGLE_GENAI_MODEL ||
    'googleai/gemini-2.5-flash'
);

const fallbackModels = parseModelList(process.env.GEMINI_FALLBACK_MODELS);

export const geminiModelChain = [primaryModel, ...fallbackModels].filter(
  (model, index, self) => self.indexOf(model) === index
);

export const gemini15Flash = geminiModelChain[0];
