// src/components/inbox/InboxView.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Instagram, MessageCircle, Linkedin, Video, Inbox as InboxIconLucide, Search, Loader2, Link as LinkIcon, CheckCircle2, Clock } from 'lucide-react';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Link from 'next/link';
import { Badge } from '../ui/badge';

type MessagePlatform = "Instagram" | "TikTok" | "LinkedIn" | "Other";

interface Thread {
  id: string;
  platform: MessagePlatform;
  user: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string | Date;
  read: boolean;
  status: 'open' | 'pending' | 'done';
}

const platformIcons: Record<MessagePlatform, React.ReactNode> = {
    Instagram: <Instagram className="text-pink-600 h-5 w-5" />,
    TikTok: <Video className="h-5 w-5 text-foreground" />, 
    LinkedIn: <Linkedin className="text-blue-600 h-5 w-5" />,
    Other: <MessageCircle className="text-muted-foreground h-5 w-5" />
};

export const InboxView = () => {
    const { socialAccounts } = useWorkspace();
    const [threads, setThreads] = useState<Thread[]>([]); 
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [replyText, setReplyText] = useState('');
    const { toast } = useToast();
    const { userProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      if (socialAccounts.length > 0) {
        setIsLoading(true);
        setTimeout(() => {
          setThreads([
            { id: '1', platform: 'Instagram', user: 'creative_mind', lastMessage: 'Loved your latest post about AI!', timestamp: new Date(), read: false, status: 'open' },
            { id: '2', platform: 'TikTok', user: 'tiktok_fan_99', lastMessage: 'Can you share the template for this?', timestamp: new Date(Date.now() - 3600000), read: true, status: 'pending' },
            { id: '3', platform: 'LinkedIn', user: 'Sarah Jenkins', lastMessage: 'Great insights on social strategy.', timestamp: new Date(Date.now() - 86400000), read: true, status: 'done' },
          ]);
          setIsLoading(false);
        }, 800);
      } else {
        setIsLoading(false);
      }
    }, [socialAccounts.length]);

    const handleSelectThread = (thread: Thread) => {
        setSelectedThread(thread);
        setThreads(prev => prev.map(t => t.id === thread.id ? {...t, read: true} : t));
    };

    const handleUpdateStatus = (status: 'open' | 'pending' | 'done') => {
      if (!selectedThread) return;
      setThreads(prev => prev.map(t => t.id === selectedThread.id ? {...t, status} : t));
      setSelectedThread(prev => prev ? {...prev, status} : null);
      toast({ title: `Thread marked as ${status}` });
    };

    const handleReply = () => {
        if (!replyText.trim() || !selectedThread) return;
        toast({ title: "Reply Sent", description: "Your message has been delivered." });
        setReplyText('');
    };
    
    const filteredThreads = threads.filter(t => 
        t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 h-full flex flex-col">
            <Card className="bg-card shadow-lg border-border/80 flex-shrink-0">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <MessageCircle className="w-10 h-10 text-primary flex-shrink-0" />
                        <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-3xl font-bold text-foreground font-headline">Unified Engagement Inbox</CardTitle>
                              <Badge variant="secondary">Simulated Data</Badge>
                            </div>
                            <CardDescription className="text-base text-muted-foreground mt-1">Demo inbox threads for UX validation. Live platform ingestion is not enabled in MVP.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
            
            <Card className="flex-grow flex flex-col md:flex-row overflow-hidden shadow-lg border-border/70 min-h-[600px]">
                <div className="w-full md:w-2/5 lg:w-1/3 border-r border-border/70 flex flex-col bg-card">
                    <div className="p-4 border-b border-border/70">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Filter conversations..." 
                                className="pl-10 bg-input" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-grow">
                        {isLoading ? (
                             <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-lg">Fetching threads...</p>
                            </div>
                        ) : socialAccounts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                <InboxIconLucide size={56} className="mb-4 opacity-70"/>
                                <h3 className="text-xl font-semibold text-foreground">No Social Channels</h3>
                                <p className="mt-2 text-sm max-w-xs mx-auto">Connect your social accounts in settings to unify your DMs and comments here.</p>
                                <Button asChild variant="default" className="mt-4 bg-primary">
                                  <Link href="/app/settings"><LinkIcon className="mr-2 h-4 w-4" /> Connect Channels</Link>
                                </Button>
                            </div>
                        ) : filteredThreads.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">No messages found.</div>
                        ) : (
                            filteredThreads.map(thread => (
                                <button 
                                    key={thread.id}
                                    onClick={() => handleSelectThread(thread)}
                                    className={`w-full text-left p-4 border-b border-border/50 hover:bg-muted/50 focus:bg-muted focus:outline-none transition-colors ${selectedThread?.id === thread.id ? 'bg-muted' : ''} ${!thread.read ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="relative">
                                              <Avatar className="h-10 w-10">
                                                  <AvatarImage src={thread.avatar || `https://picsum.photos/seed/${thread.id}/40/40`} alt={thread.user} />
                                                  <AvatarFallback>{thread.user.substring(0,2).toUpperCase()}</AvatarFallback>
                                              </Avatar>
                                              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm border border-border">
                                                {platformIcons[thread.platform]}
                                              </div>
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className={`text-sm truncate ${!thread.read ? 'font-bold text-foreground' : 'text-foreground'}`}>{thread.user}</h4>
                                                <p className={`text-xs truncate ${!thread.read ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{thread.lastMessage}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                                            <ClientFormattedDate date={thread.timestamp} options={{ month: 'short', day: 'numeric' }}/>
                                            {thread.status !== 'open' && <Badge variant="outline" className="mt-1 px-1 h-4 text-[9px] uppercase">{thread.status}</Badge>}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </ScrollArea>
                </div>

                <div className="hidden md:flex w-full md:w-3/5 lg:w-2/3 flex-col bg-background">
                    {selectedThread ? ( 
                        <>
                            <div className="p-4 border-b border-border/70 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur z-10">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                      <AvatarImage src={selectedThread.avatar || `https://picsum.photos/seed/${selectedThread.id}/40/40`} alt={selectedThread.user} />
                                      <AvatarFallback>{selectedThread.user.substring(0,2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <h3 className="font-semibold text-foreground text-lg">{selectedThread.user}</h3>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">{platformIcons[selectedThread.platform]} via {selectedThread.platform}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus('pending')} className={selectedThread.status === 'pending' ? 'bg-orange-100 text-orange-700' : ''}>
                                    <Clock className="h-4 w-4 mr-1" /> Pending
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus('done')} className={selectedThread.status === 'done' ? 'bg-green-100 text-green-700' : ''}>
                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Done
                                  </Button>
                                </div>
                            </div>
                            <ScrollArea className="flex-grow p-6 space-y-6">
                                <div className="flex max-w-[80%]">
                                    <div className="bg-muted p-4 rounded-2xl rounded-tl-none shadow-sm">
                                        <p className="text-sm leading-relaxed">{selectedThread.lastMessage}</p>
                                        <p className="text-[10px] opacity-60 mt-2"><ClientFormattedDate date={selectedThread.timestamp} options={{timeStyle: 'short'}}/></p>
                                    </div>
                                </div>
                                {/* Simulated conversation flow could be added here */}
                            </ScrollArea>
                            <div className="p-4 border-t border-border/70 bg-card mt-auto">
                               <div className="flex items-center gap-3">
                                 <Input 
                                    value={replyText} 
                                    onChange={e => setReplyText(e.target.value)} 
                                    placeholder={`Reply to ${selectedThread.user}...`} 
                                    className="flex-grow bg-input border-transparent focus-visible:ring-primary h-12 rounded-xl px-4" 
                                    onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                                 />
                                 <Button onClick={handleReply} disabled={!replyText.trim()} className="h-12 w-12 rounded-full p-0 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                                    <Send size={20} />
                                 </Button>
                               </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                            <InboxIconLucide size={64} className="mb-6 opacity-30" />
                            <h3 className="text-xl font-semibold text-foreground">Select a Conversation</h3>
                            <p className="max-w-xs mt-2">Pick a thread from the list to view the full message history and reply across platforms.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
