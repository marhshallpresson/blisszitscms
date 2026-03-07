"use client";

import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AiFieldActions } from '@/components/ai/AiFieldActions';
import { AiAssistantPreviewPanel } from '@/components/ai/AiAssistantPreviewPanel';
import { useAiTextAssistant } from '@/hooks/useAiTextAssistant';

interface ReplyComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  savedReplies: string[];
  onUseSavedReply: (reply: string) => void;
}

export function ReplyComposer({
  value,
  onChange,
  onSubmit,
  savedReplies,
  onUseSavedReply,
}: ReplyComposerProps) {
  const aiAssistant = useAiTextAssistant({
    getFieldValue: () => value,
    setFieldValue: (_fieldId, nextValue) => onChange(nextValue),
  });

  return (
    <div className="space-y-3 border-t border-border/70 bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {savedReplies.map((reply) => (
          <Button key={reply} variant="outline" size="sm" onClick={() => onUseSavedReply(reply)}>
            {reply}
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write a reply..."
          rows={3}
          className="min-h-[96px] flex-grow rounded-xl border-transparent bg-input px-4 py-3 focus-visible:ring-primary"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              onSubmit();
            }
          }}
        />
        <AiFieldActions
          onAction={(operation) => {
            void aiAssistant.runOperation({
              fieldId: 'reply',
              context: 'reply',
              operation,
              text: value,
              seed: value || savedReplies[0] || 'Craft a concise and helpful customer support reply.',
            });
          }}
          isLoading={{
            generate: aiAssistant.isLoading('reply', 'generate'),
            improve: aiAssistant.isLoading('reply', 'improve'),
            shorten: aiAssistant.isLoading('reply', 'shorten'),
          }}
          disabled={{
            generate: !value.trim() && savedReplies.length === 0,
            improve: !value.trim(),
            shorten: !value.trim(),
          }}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={onSubmit}
          disabled={!value.trim()}
          className="h-11 rounded-full px-5 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <span className="mr-2 text-sm font-semibold">Send</span>
          <Send size={20} />
        </Button>
      </div>
      <AiAssistantPreviewPanel
        preview={aiAssistant.preview}
        tone={aiAssistant.tone}
        onToneChange={aiAssistant.setTone}
        onApplyReplace={() => aiAssistant.applyPreview('replace')}
        onApplyAppend={() => aiAssistant.applyPreview('append')}
        onDismiss={aiAssistant.clearPreview}
        onUndo={aiAssistant.undoLastApply}
        canUndo={aiAssistant.hasUndo}
      />
    </div>
  );
}
