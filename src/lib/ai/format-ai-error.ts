const GENERIC_AI_ERROR =
  'AI is temporarily unavailable. Please try again in a moment.';

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error && typeof error.message === 'string') {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '';
};

const parseRetryDelaySeconds = (message: string): number | null => {
  const match = message.match(/retry in\s+([\d.]+)s/i);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 0) return null;

  return Math.ceil(value);
};

export function isAiRateLimitError(error: unknown): boolean {
  const normalized = extractErrorMessage(error).trim().toLowerCase();
  return (
    normalized.includes('resource_exhausted') ||
    normalized.includes('quota exceeded') ||
    normalized.includes('too many requests') ||
    normalized.includes('[429')
  );
}

export function formatAiError(error: unknown): string {
  const rawMessage = extractErrorMessage(error).trim();
  const normalized = rawMessage.toLowerCase();

  if (isAiRateLimitError(error)) {
    const retrySeconds = parseRetryDelaySeconds(rawMessage);
    if (retrySeconds !== null) {
      return `AI request limit reached. Please try again in about ${retrySeconds} seconds.`;
    }
    return 'AI request limit reached. Please wait a bit and try again.';
  }

  const isAuthIssue =
    normalized.includes('api key') ||
    normalized.includes('permission denied') ||
    normalized.includes('unauthorized') ||
    normalized.includes('[401') ||
    normalized.includes('[403');

  if (isAuthIssue) {
    return 'AI is not configured correctly right now. Check the Gemini API key and permissions.';
  }

  if (!rawMessage) {
    return GENERIC_AI_ERROR;
  }

  return rawMessage;
}
