"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import type { InboxThread, InboxThreadStatus } from './types';

interface InboxThreadListProps {
  threads: InboxThread[];
  selectedThreadId?: string;
  onSelectThread: (thread: InboxThread) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  statusFilter: InboxThreadStatus | 'all';
  onStatusFilterChange: (value: InboxThreadStatus | 'all') => void;
}

export function InboxThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
}: InboxThreadListProps) {
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="space-y-3 border-b border-border/70 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter conversations..."
            className="bg-input pl-10"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as InboxThreadStatus | 'all')}>
          <SelectTrigger className="bg-input">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-grow">
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            className={`w-full border-b border-border/50 p-4 text-left transition-colors hover:bg-muted/50 focus:bg-muted focus:outline-none ${
              selectedThreadId === thread.id ? 'bg-muted' : ''
            } ${!thread.read ? 'bg-primary/5' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={thread.avatar || `https://picsum.photos/seed/${thread.id}/40/40`} alt={thread.user} />
                  <AvatarFallback>{thread.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className={`truncate text-sm ${!thread.read ? 'font-semibold' : ''}`}>{thread.user}</p>
                  <p className={`truncate text-xs ${!thread.read ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                    {thread.lastMessage}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-[10px] text-muted-foreground">
                <ClientFormattedDate date={thread.timestamp} options={{ month: 'short', day: 'numeric' }} />
                <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase">
                  {thread.status}
                </Badge>
              </div>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}
