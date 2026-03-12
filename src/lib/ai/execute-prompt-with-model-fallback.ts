import type { ExecutablePrompt } from 'genkit';
import { geminiModelChain } from '@/ai/genkit';
import { isAiRateLimitError } from '@/lib/ai/format-ai-error';
import { ZodTypeAny } from 'zod';

/**
 * Checks if the error is related to an invalid or unsupported model name
 * in the Google AI Genkit plugin.
 */
const isUnknownGoogleModelActionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();
  return (
    normalized.includes('unknown action type returned from plugin googleai') ||
    normalized.includes('unknown model') ||
    normalized.includes('model not found') ||
    normalized.includes('not found') ||
    normalized.includes('invalid')
  );
};

const isServiceUnavailableError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();
  return (
    normalized.includes('503') ||
    normalized.includes('service unavailable') ||
    normalized.includes('high demand')
  );
};

/**
 * Executes a Genkit prompt with an automated fallback chain.
 * If the primary model fails due to a naming error or rate limit, 
 * it tries the next model in the geminiModelChain.
 */
export async function executePromptWithModelFallback<I, O extends ZodTypeAny, S extends ZodTypeAny>(
  prompt: ExecutablePrompt<I, O, S>,
  input: I
): Promise<Awaited<ReturnType<typeof prompt>>> {
  let lastRecoverableError: unknown;

  // 1. Try the primary model (the one defined in the prompt)
  try {
    return await prompt(input);
  } catch (error) {
    // If it's a critical error (like code crash), throw immediately
    if (!isAiRateLimitError(error) && !isUnknownGoogleModelActionError(error)) {
      throw error;
    }
    console.warn(`Primary model failed, starting fallback chain...`);
    lastRecoverableError = error;
  }

  // 2. Iterate through the fallback chain (skipping the first as it was likely the primary)
  const fallbacks = geminiModelChain.slice(1);
  
  for (const modelName of fallbacks) {
    try {
      console.log(`Attempting fallback model: ${modelName}`);
      // In Genkit, we pass the model string in the second argument options
      return await prompt(input, { model: modelName as any });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Fallback model ${modelName} failed:`, errorMsg);

      // In the fallback loop catch:
if (isUnknownGoogleModelActionError(error) || isAiRateLimitError(error) || isServiceUnavailableError(error)) {
        lastRecoverableError = error;
        continue; // Try the next one
      }
      throw error;
    }
  }

  // 3. If everything fails, throw the last relevant error
  throw lastRecoverableError ?? new Error('AI request failed for all configured models.');
}
