
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Instagram, MessageCircle, Linkedin, Video, InboxIcon } from 'lucide-react'; 
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate'; 
import { useToast } from '@/hooks/use-toast';

// Removed mock data. This component will now show a placeholder.
// type Message = { id: string; platform: string; user: string; avatar: string; message: string; timestamp: string; read: boolean; };
type Message = any; // Using 'any' as data structure might change with real integration

const platformIcons: Record<string, React.ReactNode> = {
    Instagram: <Instagram className="text-pink-600 h-5 w-5" />,
    TikTok: <Video className="text-black h-5 w-5" />, 
    LinkedIn: <Linkedin className="text-blue-700 h-5 w-5" />
};

export const InboxView = () => {
    const [messages, setMessages] = useState<Message[]>([]); // No initial mock data
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [replyText, setReplyText] = useState('');
    const { toast } = useToast();

    // In a real app, messages would be fetched here via useEffect
    // useEffect(() => {
    //   // Fetch messages logic
    // }, []);

    const handleSelectMessage = (message: Message) => {
        setSelectedMessage(message);
        // In a real app, mark as read in backend
        setMessages(msgs => msgs.map(m => m.id === message.id ? {...m, read: true} : m));
    };

    const handleReply = () => {
        if (!replyText.trim() || !selectedMessage) return;
        // Real reply logic would go here (API call to social platform)
        console.log(`Replying to ${selectedMessage.user} on ${selectedMessage.platform}: ${replyText}`);
        
        toast({ title: "Reply Sent (Demo)", description: `Your reply to ${selectedMessage.user} has been logged.` });
        setReplyText('');
    };
    

    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            <h1 className="text-4xl font-bold text-foreground font-headline mb-2">Unified Inbox</h1>
            <p className="text-lg text-muted-foreground mb-6">Manage all your social media conversations in one place.</p>
            
            <Card className="flex-grow flex overflow-hidden shadow-xl">
                <div className="w-full md:w-1/3 border-r border-border flex flex-col">
                    <div className="p-4 border-b border-border">
                        <Input placeholder="Search messages..." className="bg-background" aria-label="Search messages"/>
                    </div>
                    <ScrollArea className="flex-grow">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                <InboxIcon size={48} className="mb-4"/>
                                <h3 className="text-lg font-semibold">No Messages Yet</h3>
                                <p className="text-sm">Connect your social accounts to see messages here.</p>
                                <p className="text-xs mt-4">(Demo: This inbox currently uses placeholder data.)</p>
                            </div>
                        )}
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                onClick={() => handleSelectMessage(msg)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSelectMessage(msg)}
                                role="button"
                                tabIndex={0}
                                aria-label={`Message from ${msg.user} on ${msg.platform}`}
                                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors
                                            ${selectedMessage?.id === msg.id ? 'bg-muted' : ''}
                                            ${!msg.read ? 'font-semibold' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        {platformIcons[msg.platform] || <MessageCircle className="h-5 w-5 text-muted-foreground" />}
                                        <span className={`truncate ${!msg.read ? 'text-foreground' : 'text-foreground/80'}`}>{msg.user}</span>
                                    </div>
                                    <span className={`text-xs ${!msg.read ? 'text-primary' : 'text-muted-foreground'}`}>
                                        <ClientFormattedDate date={msg.timestamp} options={{dateStyle:'short', timeStyle: 'short'}} />
                                    </span>
                                </div>
                                <p className={`text-sm truncate ${!msg.read ? 'text-foreground/90' : 'text-muted-foreground'}`}>{msg.message}</p>
                            </div>
                        ))}
                    </ScrollArea>
                </div>

                <div className="hidden md:flex w-2/3 flex-col bg-background">
                    {selectedMessage ? (
                        <>
                            <div className="p-4 border-b border-border flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={selectedMessage.avatar || `https://placehold.co/40x40.png`} alt={selectedMessage.user} data-ai-hint="profile avatar"/>
                                    <AvatarFallback>{selectedMessage.user?.substring(0,2).toUpperCase() || '??'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-foreground">{selectedMessage.user}</h3>
                                    <p className="text-xs text-muted-foreground">via {selectedMessage.platform}</p>
                                </div>
                            </div>
                            <ScrollArea className="flex-grow p-4 space-y-3">
                                
                                <div className="flex">
                                    <div className="p-3 rounded-lg bg-primary text-primary-foreground max-w-[75%]">
                                        <p>{selectedMessage.message}</p>
                                        <p className="text-xs text-primary-foreground/70 mt-1 text-right"><ClientFormattedDate date={selectedMessage.timestamp} options={{timeStyle: 'short'}}/></p>
                                    </div>
                                </div>
                                
                            </ScrollArea>
                            <div className="p-4 border-t border-border bg-background">
                               <div className="flex items-center gap-2">
                                 <Input 
                                    type="text" 
                                    value={replyText} 
                                    onChange={e => setReplyText(e.target.value)} 
                                    placeholder={`Reply to ${selectedMessage.user}...`} 
                                    className="flex-grow bg-muted focus-visible:ring-primary" 
                                    aria-label={`Reply to ${selectedMessage.user}`}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleReply())}
                                 />
                                 <Button onClick={handleReply} disabled={!replyText.trim()} className="font-semibold" aria-label="Send reply">
                                    <Send size={16} className="mr-0 md:mr-2"/> <span className="hidden md:inline">Send</span>
                                 </Button>
                               </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-muted-foreground">
                                <MessageCircle size={48} className="mx-auto mb-2" />
                                <p>Select a message to view and reply.</p>
                                {messages.length === 0 && <p className="text-xs mt-2">(No messages available to select)</p>}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            <p className="text-sm text-muted-foreground mt-6 text-center">Note: Inbox is a demo. Actual social media integration is required for full functionality.</p>
        </div>
    );
};

    