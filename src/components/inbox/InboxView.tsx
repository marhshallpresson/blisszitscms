// src/components/inbox/InboxView.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Instagram, MessageCircle, Linkedin, Video, Inbox as InboxIconLucide, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate';
import { useToast } from '@/hooks/use-toast';

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
    const [isLoading, setIsLoading] = useState(true); // Start as true to show initial loading state
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      // Simulate fetching messages. In a real app, this would be an API call.
      // For this review, we ensure it shows "No messages" if the fetch is empty.
      setIsLoading(true);
      setTimeout(() => {
        setMessages([]); // No demo data, so messages array remains empty
        setSelectedMessage(null);
        setIsLoading(false);
      }, 1000); // Simulate network delay
    }, []);

    const handleSelectMessage = (message: Message) => {
        setSelectedMessage(message);
        // In a real app, mark as read in backend
        // This will not do much here as messages array will be empty.
        setMessages(prevMessages => prevMessages.map(m => m.id === message.id ? {...m, read: true} : m));
    };

    const handleReply = () => {
        if (!replyText.trim() || !selectedMessage) return;
        console.log(`Replying to ${selectedMessage.user} on ${selectedMessage.platform}: ${replyText}`);
        toast({ title: "Reply Sent (Demo)", description: `Your reply to ${selectedMessage.user} would be sent here in a real application.` });
        // In a real app, you'd add the reply to the conversation thread.
        setReplyText('');
    };

    const filteredMessages = messages.filter(msg => 
        msg.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
    

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 h-full flex flex-col">
            <Card className="bg-card shadow-xl border-border/80">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <MessageCircle className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle className="text-3xl font-bold text-foreground font-headline">Unified Inbox</CardTitle>
                            <CardDescription className="text-base text-muted-foreground mt-1">Manage social DMs & comments. (Live integration pending)</CardDescription>
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
                                disabled={isLoading || messages.length === 0} 
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-grow">
                        {isLoading && (
                             <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-lg">Loading messages...</p>
                            </div>
                        )}
                        {!isLoading && filteredMessages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                <InboxIconLucide size={56} className="mb-4 opacity-70"/>
                                <h3 className="text-xl font-semibold text-foreground">Inbox is Empty</h3>
                                <p className="text-sm">No messages to display. Connect your accounts to see messages here.</p>
                            </div>
                        )}
                        {/* List rendering for actual messages would go here if messages were present */}
                        {!isLoading && filteredMessages.length > 0 && (
                            filteredMessages.map(msg => (
                                <button 
                                    key={msg.id}
                                    onClick={() => handleSelectMessage(msg)}
                                    className={`w-full text-left p-4 border-b border-border/50 hover:bg-muted/50 focus:bg-muted focus:outline-none ${selectedMessage?.id === msg.id ? 'bg-muted' : ''} ${!msg.read ? 'font-semibold' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={msg.avatar || `https://placehold.co/40x40.png?text=${msg.user.substring(0,1)}`} alt={msg.user} data-ai-hint="profile avatar"/>
                                                <AvatarFallback>{msg.user.substring(0,2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="text-sm text-foreground truncate max-w-[150px]">{msg.user}</h4>
                                                <p className={`text-xs truncate max-w-[150px] ${!msg.read ? 'text-primary' : 'text-muted-foreground'}`}>{msg.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end text-xs text-muted-foreground">
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
                                    <AvatarImage src={selectedMessage.avatar || `https://placehold.co/40x40.png?text=${selectedMessage.user?.substring(0,1)}`} alt={selectedMessage.user} data-ai-hint="profile avatar"/>
                                    <AvatarFallback>{selectedMessage.user?.substring(0,2).toUpperCase() || '??'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-foreground text-lg">{selectedMessage.user}</h3>
                                    <p className="text-xs text-muted-foreground">via {selectedMessage.platform}</p>
                                </div>
                            </div>
                            <ScrollArea className="flex-grow p-6 space-y-4">
                                {/* This is a simplified view of one message. A real chat would have multiple messages. */}
                                <div className="flex">
                                    <div className={`p-3 rounded-lg bg-muted text-foreground max-w-[75%] shadow ${selectedMessage.user === userProfile?.displayName ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-sm">{selectedMessage.message}</p>
                                        <p className="text-xs text-muted-foreground/80 mt-1.5 text-right"><ClientFormattedDate date={selectedMessage.timestamp} options={{timeStyle: 'short'}}/></p>
                                    </div>
                                </div>
                                 {/* Example of a reply (placeholder) */}
                                <div className="flex">
                                    <div className="ml-auto p-3 rounded-lg bg-primary text-primary-foreground max-w-[75%] shadow">
                                        <p className="text-sm">This is a simulated reply from you for context.</p>
                                        <p className="text-xs text-primary-foreground/80 mt-1.5 text-right"><ClientFormattedDate date={new Date()} options={{timeStyle: 'short'}}/></p>
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
                             <p className="text-sm text-muted-foreground mt-4">
                                {isLoading ? "Loading messages..." : "Your inbox is currently empty."}
                             </p>
                        </div>
                    )}
                </div>
            </Card>
             <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-700 flex items-start gap-3">
                <AlertTriangle size={24} className="flex-shrink-0"/>
                <div>
                    <h4 className="font-semibold">Illustrative Feature</h4>
                    <p className="text-sm">The Unified Inbox is for demonstration purposes. Actual social media account integration and real-time message fetching are not implemented in this version.</p>
                </div>
            </div>
        </div>
    );
};
