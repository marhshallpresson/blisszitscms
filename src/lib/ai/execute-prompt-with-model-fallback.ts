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

export async function executePromptWithModelFallback<I>(
  prompt: ExecutablePrompt<I, any, any>,
  input: I
): Promise<Awaited<ReturnType<typeof prompt>>> {
  let lastRecoverableError: unknown;

  try {
    // Use prompt's configured model first. This is the most stable path in Genkit.
    return await prompt(input);
  } catch (error) {
    if (!isAiRateLimitError(error) && !isUnknownGoogleModelActionError(error)) {
      throw error;
    }
    lastRecoverableError = error;
  }

  for (const model of geminiModelChain.slice(1)) {
    try {
      return await prompt(input, { model });
    } catch (error) {
      if (isUnknownGoogleModelActionError(error) || isAiRateLimitError(error)) {
        lastRecoverableError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastRecoverableError ?? new Error('AI request failed for all configured models.');
}
