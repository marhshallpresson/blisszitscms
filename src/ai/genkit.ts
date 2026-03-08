import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const googleAIPlugin = googleAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
});

export const ai = genkit({
  plugins: [googleAIPlugin],
});

const DEFAULT_MODEL = 'googleai/gemini-2.5-flash';

const SUPPORTED_GOOGLE_AI_MODELS = new Set([
  'gemini',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-3.1-pro-preview',
  'gemini-3.1-pro-preview-customtools',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
  'gemini-3-pro-image-preview',
  'gemini-2.5-flash-image',
  'gemma-3-12b-it',
  'gemma-3-1b-it',
  'gemma-3-27b-it',
  'gemma-3-4b-it',
  'gemma-3n-e4b-it',
]);

const MODEL_ALIASES: Record<string, string> = {
  'gemini-3-flash': 'gemini-3-flash-preview',
  'gemini-3-pro': 'gemini-3-pro-preview',
};

const normalizeModelId = (rawModel: string): string => {
  const trimmed = rawModel.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed) return '';

  let modelId = trimmed.toLowerCase();
  modelId = modelId.replace(/^googleai\//, '');
  modelId = modelId.replace(/^models\//, '');
  modelId = modelId.replace(/\s+/g, '-');
  modelId = modelId.replace(/_+/g, '-');
  modelId = modelId.replace(/-+/g, '-');

  return MODEL_ALIASES[modelId] ?? modelId;
};

const normalizeModelName = (model: string): string => {
  const modelId = normalizeModelId(model);
  if (!modelId) return '';
  if (!SUPPORTED_GOOGLE_AI_MODELS.has(modelId)) {
    return '';
  }
  return `googleai/${modelId}`;
};

const parseModelList = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map(normalizeModelName)
    .filter(Boolean);
};

const configuredPrimaryModel = normalizeModelName(
  process.env.GEMINI_MODEL ||
    process.env.GOOGLE_GENAI_MODEL ||
    DEFAULT_MODEL
);

const fallbackModels = parseModelList(process.env.GEMINI_FALLBACK_MODELS);

const primaryModel = configuredPrimaryModel || DEFAULT_MODEL;

export const geminiModelChain = [primaryModel, ...fallbackModels, DEFAULT_MODEL].filter(
  (model, index, self) => self.indexOf(model) === index
);

export const gemini15Flash = geminiModelChain[0];
