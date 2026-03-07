"use client";

import { Loader2, Sparkles, Wand2, Scissors, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AiTextOperation } from '@/types/ai-assistant';

type DisableState = boolean | Partial<Record<AiTextOperation, boolean>>;

interface AiFieldActionsProps {
  onAction: (operation: AiTextOperation) => void;
  isLoading?: Partial<Record<AiTextOperation, boolean>>;
  disabled?: DisableState;
  onHashtags?: () => void;
  hashtagsLoading?: boolean;
  hashtagsDisabled?: boolean;
  className?: string;
}

const DEFAULT_LOADING: Partial<Record<AiTextOperation, boolean>> = {};

const isDisabled = (state: DisableState | undefined, operation: AiTextOperation) => {
  if (typeof state === 'boolean') return state;
  return Boolean(state?.[operation]);
};

export function AiFieldActions({
  onAction,
  isLoading = DEFAULT_LOADING,
  disabled,
  onHashtags,
  hashtagsLoading,
  hashtagsDisabled,
  className,
}: AiFieldActionsProps) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ''}`}>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onAction('generate')}
        disabled={isDisabled(disabled, 'generate') || Boolean(isLoading.generate)}
      >
        {isLoading.generate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onAction('improve')}
        disabled={isDisabled(disabled, 'improve') || Boolean(isLoading.improve)}
      >
        {isLoading.improve ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        Improve
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onAction('shorten')}
        disabled={isDisabled(disabled, 'shorten') || Boolean(isLoading.shorten)}
      >
        {isLoading.shorten ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
        Shorten
      </Button>
      {onHashtags ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onHashtags}
          disabled={hashtagsDisabled || hashtagsLoading}
        >
          {hashtagsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hash className="h-4 w-4" />}
          Hashtags
        </Button>
      ) : null}
    </div>
  );
}
