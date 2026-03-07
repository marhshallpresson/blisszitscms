import type { ExecutablePrompt } from 'genkit';
import { geminiModelChain } from '@/ai/genkit';
import { isAiRateLimitError } from '@/lib/ai/format-ai-error';

const isUnknownGoogleModelActionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();
  return (
    normalized.includes('unknown action type returned from plugin googleai') ||
    normalized.includes('unknown model') ||
    normalized.includes('model not found')
  );
};

const getModelCandidates = (model: string): string[] => {
  const trimmed = model.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('googleai/')) {
    return [trimmed, trimmed.replace(/^googleai\//, '')];
  }
  return [trimmed, `googleai/${trimmed}`];
};

export async function executePromptWithModelFallback<I>(
  prompt: ExecutablePrompt<I, any, any>,
  input: I
): Promise<Awaited<ReturnType<typeof prompt>>> {
  try {
    // Use prompt's configured model first. This is the most stable path in Genkit.
    return await prompt(input);
  } catch (error) {
    if (!isAiRateLimitError(error)) {
      throw error;
    }
  }

  let lastRateLimitError: unknown;

  for (const model of geminiModelChain.slice(1)) {
    for (const candidate of getModelCandidates(model)) {
      try {
        return await prompt(input, { model: candidate });
      } catch (error) {
        if (isUnknownGoogleModelActionError(error)) {
          continue;
        }
        if (!isAiRateLimitError(error)) {
          throw error;
        }
        lastRateLimitError = error;
      }
    }
  }

  throw lastRateLimitError ?? new Error('AI request failed for all configured models.');
}
