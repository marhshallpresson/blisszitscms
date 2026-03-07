"use client";

import { Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AI_TONE_PRESETS, type AiPreviewState, type AiTonePreset } from '@/types/ai-assistant';

interface AiAssistantPreviewPanelProps {
  preview: AiPreviewState | null;
  tone: AiTonePreset;
  onToneChange: (tone: AiTonePreset) => void;
  onApplyReplace: () => void;
  onApplyAppend: () => void;
  onDismiss: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

const TONE_LABEL: Record<AiTonePreset, string> = {
  professional: 'Professional',
  casual: 'Casual',
  sales: 'Sales',
};

export function AiAssistantPreviewPanel({
  preview,
  tone,
  onToneChange,
  onApplyReplace,
  onApplyAppend,
  onDismiss,
  onUndo,
  canUndo = false,
}: AiAssistantPreviewPanelProps) {
  if (!preview) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">AI Content Assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {AI_TONE_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                size="sm"
                variant={tone === preset ? 'default' : 'outline'}
                onClick={() => onToneChange(preset)}
              >
                {TONE_LABEL[preset]}
              </Button>
            ))}
            {canUndo && onUndo ? (
              <Button type="button" size="sm" variant="ghost" onClick={onUndo}>
                <Undo2 className="mr-1 h-4 w-4" />
                Undo
              </Button>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Use field-side AI buttons to generate a preview, then apply with replace or append.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            AI Preview: {preview.operation[0].toUpperCase()}
            {preview.operation.slice(1)}
          </CardTitle>
          <Button type="button" variant="ghost" size="icon" onClick={onDismiss} aria-label="Dismiss AI preview">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border bg-background p-3 text-sm whitespace-pre-wrap">{preview.text}</div>
        <div className="flex flex-wrap gap-2">
          {AI_TONE_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              size="sm"
              variant={tone === preset ? 'default' : 'outline'}
              onClick={() => onToneChange(preset)}
            >
              {TONE_LABEL[preset]}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={onApplyReplace}>
            Replace
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onApplyAppend}>
            Append
          </Button>
          {canUndo && onUndo ? (
            <Button type="button" size="sm" variant="ghost" onClick={onUndo}>
              <Undo2 className="mr-1 h-4 w-4" />
              Undo
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
