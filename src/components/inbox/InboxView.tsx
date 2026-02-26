// src/components/inbox/InboxView.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Instagram, MessageCircle, Linkedin, Video, Inbox as InboxIconLucide, Search, Loader2, Link as LinkIcon } from 'lucide-react';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

type MessagePlatform = "Instagram" | "TikTok" | "LinkedIn" | "Other";

interface Message {
  id: string;
  platform: MessagePlatform;
  user: string;
  avatar?: string;
  message: string;
  timestamp: string | Date;
  read: boolean;
}

const platformIcons: Record<MessagePlatform, React.ReactNode> = {
    Instagram: <Instagram className="text-pink-600 h-5 w-5" />,
    TikTok: <Video className="h-5 w-5 text-foreground" />, 
    LinkedIn: <Linkedin className="text-blue-600 h-5 w-5" />,
    Other: <MessageCircle className="text-muted-foreground h-5 w-5" />
};

export const InboxView = () => {
    const [messages, setMessages] = useState<Message[]>([]); 
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [replyText, setReplyText] = useState('');
    const { toast } = useToast();
    const { userProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      setIsLoading(true);
      setTimeout(() => {
        setMessages([]);
        setSelectedMessage(null);
        setIsLoading(false);
      }, 1000);
    }, []);

    const handleSelectMessage = (message: Message) => {
        setSelectedMessage(message);
        setMessages(prevMessages => prevMessages.map(m => m.id === message.id ? {...m, read: true} : m));
    };

    const handleReply = () => {
        if (!replyText.trim() || !selectedMessage) return;
        toast({ title: "Reply Sent (Demo)", description: `This is a demo. No real message was sent.` });
        setReplyText('');
    };
    
    const filteredMessages = messages.filter(msg => 
        msg.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 h-full flex flex-col">
            <Card className="bg-card shadow-lg border-border/80 flex-shrink-0">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <MessageCircle className="w-10 h-10 text-primary flex-shrink-0" />
                        <div>
                            <CardTitle className="text-3xl font-bold text-foreground font-headline">Unified Inbox</CardTitle>
                            <CardDescription className="text-base text-muted-foreground mt-1">Manage your social media DMs & comments in one place.</CardDescription>
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
                                placeholder="Search messages..." 
                                className="pl-10 bg-input focus:ring-primary" 
                                aria-label="Search messages"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-grow">
                        {isLoading ? (
                             <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-lg">Loading messages...</p>
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                <InboxIconLucide size={56} className="mb-4 opacity-70"/>
                                <h3 className="text-xl font-semibold text-foreground">Connect Your Accounts</h3>
                                <p className="mt-2 text-sm max-w-xs mx-auto">Connect your social accounts in settings to start receiving messages and comments here.</p>
                                <Button asChild variant="default" className="mt-4">
                                  <Link href="/app/settings"><LinkIcon className="mr-2 h-4 w-4" /> Go to Settings</Link>
                                </Button>
                            </div>
                        ) : (
                            filteredMessages.map(msg => (
                                <button 
                                    key={msg.id}
                                    onClick={() => handleSelectMessage(msg)}
                                    className={`w-full text-left p-4 border-b border-border/50 hover:bg-muted/50 focus:bg-muted focus:outline-none ${selectedMessage?.id === msg.id ? 'bg-muted' : ''} ${!msg.read ? 'font-semibold' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={msg.avatar || `https://placehold.co/40x40.png?text=${msg.user.substring(0,1)}`} alt={msg.user} data-ai-hint="profile avatar" />
                                                <AvatarFallback>{msg.user.substring(0,2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden">
                                                <h4 className="text-sm text-foreground truncate">{msg.user}</h4>
                                                <p className={`text-xs truncate ${!msg.read ? 'text-primary' : 'text-muted-foreground'}`}>{msg.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end text-xs text-muted-foreground flex-shrink-0 ml-2">
                                            {platformIcons[msg.platform]}
                                            <ClientFormattedDate date={msg.timestamp} options={{ month: 'short', day: 'numeric' }}/>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </ScrollArea>
                </div>

                <div className="hidden md:flex w-full md:w-3/5 lg:w-2/3 flex-col bg-background">
                    {selectedMessage ? ( 
                        <>
                            <div className="p-4 border-b border-border/70 flex items-center gap-3 sticky top-0 bg-background z-10">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedMessage.avatar || `https://placehold.co/40x40.png?text=${selectedMessage.user?.substring(0,1)}`} alt={selectedMessage.user} data-ai-hint="profile avatar" />
                                    <AvatarFallback>{selectedMessage.user?.substring(0,2).toUpperCase() || '??'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-foreground text-lg">{selectedMessage.user}</h3>
                                    <p className="text-xs text-muted-foreground">via {selectedMessage.platform}</p>
                                </div>
                            </div>
                            <ScrollArea className="flex-grow p-6 space-y-4">
                                <div className="flex">
                                    <div className={`p-3 rounded-lg text-foreground max-w-[75%] shadow ${selectedMessage.user === userProfile?.displayName ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-sm">{selectedMessage.message}</p>
                                        <p className="text-xs opacity-80 mt-1.5 text-right"><ClientFormattedDate date={selectedMessage.timestamp} options={{timeStyle: 'short'}}/></p>
                                    </div>
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t border-border/70 bg-card mt-auto">
                               <div className="flex items-center gap-3">
                                 <Input 
                                    type="text" 
                                    value={replyText} 
                                    onChange={e => setReplyText(e.target.value)} 
                                    placeholder={`Reply to ${selectedMessage.user}...`} 
                                    className="flex-grow bg-input focus-visible:ring-primary text-base py-2.5" 
                                    aria-label={`Reply to ${selectedMessage.user}`}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleReply())}
                                 />
                                 <Button onClick={handleReply} disabled={!replyText.trim()} className="font-semibold shadow-md hover:shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground" aria-label="Send reply">
                                    <Send size={18} className="mr-0 md:mr-2"/> <span className="hidden md:inline">Send</span>
                                 </Button>
                               </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                            <InboxIconLucide size={64} className="mb-6 opacity-50" />
                            <h3 className="text-xl font-semibold text-foreground">No Message Selected</h3>
                            <p className="text-center mt-1">Select a message from the list to view its content and reply.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
