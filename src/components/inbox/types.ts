export type MessagePlatform = 'Instagram' | 'TikTok' | 'LinkedIn' | 'Other';
export type InboxThreadStatus = 'open' | 'pending' | 'done';
export type InboxMessageDirection = 'inbound' | 'outbound';

export interface InboxMessage {
  id: string;
  text: string;
  direction: InboxMessageDirection;
  timestamp: string | Date;
  author: string;
}

export interface InboxThread {
  id: string;
  platform: MessagePlatform;
  user: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string | Date;
  read: boolean;
  status: InboxThreadStatus;
  assignee: string;
  tags: string[];
  messages: InboxMessage[];
}
