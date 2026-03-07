export const AI_TEXT_OPERATIONS = ['generate', 'improve', 'shorten'] as const;
export type AiTextOperation = (typeof AI_TEXT_OPERATIONS)[number];

export const AI_TONE_PRESETS = ['professional', 'casual', 'sales'] as const;
export type AiTonePreset = (typeof AI_TONE_PRESETS)[number];

export const AI_TEXT_CONTEXTS = [
  'idea',
  'script',
  'caption',
  'variant',
  'reply',
  'comment',
  'workspace_description',
  'workspace_topic',
] as const;
export type AiTextContext = (typeof AI_TEXT_CONTEXTS)[number];

export type AiApplyMode = 'replace' | 'append';

export interface AiFieldAction {
  operation: AiTextOperation;
  label: string;
  requiresExistingText?: boolean;
}

export interface AiPreviewState {
  fieldId: string;
  context: AiTextContext;
  operation: AiTextOperation;
  tone: AiTonePreset;
  text: string;
}
