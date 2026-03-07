import { useState } from 'react';
import { transformText } from '@/ai/flows/transform-text';
import type { AiApplyMode, AiPreviewState, AiTextContext, AiTextOperation, AiTonePreset } from '@/types/ai-assistant';
import { formatAiError } from '@/lib/ai/format-ai-error';

type LoadingState = Record<string, boolean>;

interface RunOperationInput {
  fieldId: string;
  context: AiTextContext;
  operation: AiTextOperation;
  text?: string;
  seed?: string;
  network?: string;
  customRequest?: () => Promise<string>;
}

interface UseAiTextAssistantOptions {
  getFieldValue: (fieldId: string) => string;
  setFieldValue: (fieldId: string, value: string) => void;
  onError?: (message: string) => void;
}

export function useAiTextAssistant({ getFieldValue, setFieldValue, onError }: UseAiTextAssistantOptions) {
  const [tone, setTone] = useState<AiTonePreset>('professional');
  const [preview, setPreview] = useState<AiPreviewState | null>(null);
  const [loadingByKey, setLoadingByKey] = useState<LoadingState>({});
  const [lastApplied, setLastApplied] = useState<{ fieldId: string; previousValue: string } | null>(null);

  const setLoading = (key: string, value: boolean) => {
    setLoadingByKey((prev) => ({ ...prev, [key]: value }));
  };

  const isLoading = (fieldId: string, operation: AiTextOperation) =>
    Boolean(loadingByKey[`${fieldId}:${operation}`]);

  const canRun = (operation: AiTextOperation, value: string, seed?: string) => {
    if (operation === 'generate') {
      return Boolean(value.trim() || seed?.trim());
    }
    return Boolean(value.trim());
  };

  const runOperation = async ({
    fieldId,
    context,
    operation,
    text,
    seed,
    network,
    customRequest,
  }: RunOperationInput) => {
    const value = text ?? getFieldValue(fieldId);
    if (!canRun(operation, value, seed)) {
      const message =
        operation === 'generate'
          ? 'Provide some context before generating text.'
          : `${operation[0].toUpperCase()}${operation.slice(1)} needs existing text.`;
      onError?.(message);
      return;
    }

    const loadingKey = `${fieldId}:${operation}`;
    setLoading(loadingKey, true);

    try {
      const outputText =
        customRequest != null
          ? await customRequest()
          : (
              await transformText({
                operation,
                context,
                tone,
                text: value || undefined,
                seed: seed || undefined,
                network: network || undefined,
              })
            ).text;

      if (!outputText.trim()) {
        throw new Error('AI returned an empty response.');
      }

      setPreview({
        fieldId,
        context,
        operation,
        tone,
        text: outputText.trim(),
      });
    } catch (error) {
      const message = formatAiError(error);
      onError?.(message);
    } finally {
      setLoading(loadingKey, false);
    }
  };

  const applyPreview = (mode: AiApplyMode) => {
    if (!preview) return;
    const previousValue = getFieldValue(preview.fieldId);
    const nextValue =
      mode === 'replace'
        ? preview.text
        : previousValue.trim()
          ? `${previousValue.trim()}\n\n${preview.text}`
          : preview.text;

    setFieldValue(preview.fieldId, nextValue);
    setLastApplied({ fieldId: preview.fieldId, previousValue });
    setPreview(null);
  };

  const undoLastApply = () => {
    if (!lastApplied) return;
    setFieldValue(lastApplied.fieldId, lastApplied.previousValue);
    setLastApplied(null);
  };

  const clearPreview = () => setPreview(null);

  return {
    tone,
    setTone,
    preview,
    isLoading,
    runOperation,
    applyPreview,
    clearPreview,
    undoLastApply,
    hasUndo: lastApplied !== null,
  };
}
