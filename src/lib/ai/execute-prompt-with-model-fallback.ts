import type { ExecutablePrompt } from 'genkit';
import { geminiModelChain } from '@/ai/genkit';
import { isAiRateLimitError } from '@/lib/ai/format-ai-error';

export async function executePromptWithModelFallback<I>(
  prompt: ExecutablePrompt<I, any, any>,
  input: I
): Promise<Awaited<ReturnType<typeof prompt>>> {
  let lastError: unknown;

  for (const model of geminiModelChain) {
    try {
      return await prompt(input, { model });
    } catch (error) {
      lastError = error;
      if (!isAiRateLimitError(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error('AI request failed for all configured models.');
}
