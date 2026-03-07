"use client";

import { ArrowLeft, CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import type { InboxThread, InboxThreadStatus } from './types';
import { ReplyComposer } from './ReplyComposer';

interface InboxThreadViewProps {
  thread: InboxThread | null;
  replyText: string;
  savedReplies: string[];
  onReplyTextChange: (value: string) => void;
  onReplySubmit: () => void;
  onUseSavedReply: (reply: string) => void;
  onStatusChange: (status: InboxThreadStatus) => void;
  onAssigneeChange: (assignee: string) => void;
  onToggleTag: (tag: string) => void;
  onBack?: () => void;
}

const QUICK_TAGS = ['priority', 'sales', 'support', 'brand'];
const ASSIGNEES = ['Unassigned', 'Ariana', 'Marcus', 'Leah'];

export function InboxThreadView({
  thread,
  replyText,
  savedReplies,
  onReplyTextChange,
  onReplySubmit,
  onUseSavedReply,
  onStatusChange,
  onAssigneeChange,
  onToggleTag,
  onBack,
}: InboxThreadViewProps) {
  if (!thread) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <MessageCircle size={64} className="mb-6 opacity-30" />
        <h3 className="text-xl font-semibold text-foreground">Select a conversation</h3>
        <p className="mt-2 max-w-xs">Choose a thread to view the full history, assignment, tags, and replies.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="sticky top-0 z-10 border-b border-border/70 bg-background/80 p-4 backdrop-blur">
        {onBack ? (
          <Button type="button" variant="ghost" size="sm" className="mb-2 md:hidden" onClick={onBack}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to threads
          </Button>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={thread.avatar || `https://picsum.photos/seed/${thread.id}/40/40`} alt={thread.user} />
              <AvatarFallback>{thread.user.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{thread.user}</h3>
              <p className="text-xs text-muted-foreground">{thread.platform}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange('pending')}
              className={thread.status === 'pending' ? 'bg-orange-100 text-orange-700' : ''}
            >
              <Clock className="mr-1 h-4 w-4" /> Pending
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange('done')}
              className={thread.status === 'done' ? 'bg-green-100 text-green-700' : ''}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" /> Done
            </Button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <Select value={thread.assignee || 'Unassigned'} onValueChange={onAssigneeChange}>
            <SelectTrigger className="h-9 bg-input">
              <SelectValue placeholder="Assign owner" />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNEES.map((assignee) => (
                <SelectItem key={assignee} value={assignee}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => {
              const selected = thread.tags.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={selected ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => onToggleTag(tag)}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-grow">
        <div className="space-y-4 p-6">
          {thread.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${
                  message.direction === 'outbound'
                    ? 'rounded-tr-none bg-primary text-primary-foreground'
                    : 'rounded-tl-none bg-muted text-foreground'
                }`}
              >
                <p>{message.text}</p>
                <p className="mt-2 text-[10px] opacity-80">
                  <ClientFormattedDate date={message.timestamp} options={{ timeStyle: 'short', month: 'short', day: 'numeric' }} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <ReplyComposer
        value={replyText}
        onChange={onReplyTextChange}
        onSubmit={onReplySubmit}
        savedReplies={savedReplies}
        onUseSavedReply={onUseSavedReply}
      />
    </div>
  );
}
