
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Instagram, MessageCircle, Linkedin, Video } from 'lucide-react'; // Using Video for TikTok for now
import { ClientFormattedDate } from '@/components/utils/ClientFormattedDate'; // Assuming this component exists

// Mock Data (from old script, adapted)
const initialInboxData = [
    { id: '1', platform: 'Instagram', user: 'techie_tom', avatar: 'https://placehold.co/40x40.png', message: 'This AI tool tip is a game changer! 🔥 Thanks so much for sharing, Marshall! I was wondering if you could do a follow-up on advanced prompting techniques?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false },
    { id: '2', platform: 'TikTok', user: 'sara_sings_official', avatar: 'https://placehold.co/40x40.png', message: 'Love your videos! Can you do one on color grading for short-form content? Specifically for a moody cinematic look. Keep up the great work!', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: false },
    { id: '3', platform: 'LinkedIn', user: 'Jane Doe, Marketing Director', avatar: 'https://placehold.co/40x40.png', message: 'Hi Marshall, great insights on personal branding from your recent post. I\'d love to connect and discuss potential collaboration opportunities for our upcoming campaign.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true },
    { id: '4', platform: 'Instagram', user: 'creative_carly', avatar: 'https://placehold.co/40x40.png', message: 'Your 30-day challenge is so inspiring! What editing software do you recommend for beginners?', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: true },
];

type Message = typeof initialInboxData[0];

const platformIcons: Record<string, React.ReactNode> = {
    Instagram: <Instagram className="text-pink-600 h-5 w-5" />,
    TikTok: <Video className="text-black h-5 w-5" />, // Lucide doesn't have a TikTok icon
    LinkedIn: <Linkedin className="text-blue-700 h-5 w-5" />
};

export const InboxView = () => {
    const [messages, setMessages] = useState<Message[]>(initialInboxData);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(messages.length > 0 ? messages[0] : null);
    const [replyText, setReplyText] = useState('');

    const handleSelectMessage = (message: Message) => {
        setSelectedMessage(message);
        setMessages(msgs => msgs.map(m => m.id === message.id ? {...m, read: true} : m));
    };

    const handleReply = () => {
        if (!replyText.trim() || !selectedMessage) return;
        console.log(`Replying to ${selectedMessage.user} on ${selectedMessage.platform}: ${replyText}`);
        // Here you would integrate with actual messaging APIs
        toast({ title: "Reply Sent (Demo)", description: `Your reply to ${selectedMessage.user} has been logged.` });
        setReplyText('');
    };
    
    // Basic toast for demo
    const toast = ({title, description}: {title: string, description: string}) => {
        // In a real app, use the actual useToast hook here
        alert(`${title}: ${description}`);
    }


    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            <h1 className="text-4xl font-bold text-foreground font-headline mb-2">Unified Inbox</h1>
            <p className="text-lg text-muted-foreground mb-6">Manage all your social media conversations in one place.</p>
            
            <Card className="flex-grow flex overflow-hidden shadow-xl">
                <div className="w-full md:w-1/3 border-r border-border flex flex-col">
                    <div className="p-4 border-b border-border">
                        <Input placeholder="Search messages..." className="bg-background" />
                    </div>
                    <ScrollArea className="flex-grow">
                        {messages.length === 0 && <p className="p-4 text-center text-muted-foreground">No messages yet.</p>}
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                onClick={() => handleSelectMessage(msg)}
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
                                    <AvatarImage src={selectedMessage.avatar} alt={selectedMessage.user} data-ai-hint="profile avatar" />
                                    <AvatarFallback>{selectedMessage.user.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-foreground">{selectedMessage.user}</h3>
                                    <p className="text-xs text-muted-foreground">via {selectedMessage.platform}</p>
                                </div>
                            </div>
                            <ScrollArea className="flex-grow p-4 space-y-3">
                                {/* Mocking a single message display for now */}
                                <div className="flex">
                                    <div className="p-3 rounded-lg bg-primary text-primary-foreground max-w-[75%]">
                                        <p>{selectedMessage.message}</p>
                                        <p className="text-xs text-primary-foreground/70 mt-1 text-right"><ClientFormattedDate date={selectedMessage.timestamp} options={{timeStyle: 'short'}}/></p>
                                    </div>
                                </div>
                                {/* Add more messages here for a conversation view */}
                            </ScrollArea>
                            <div className="p-4 border-t border-border bg-background">
                               <div className="flex items-center gap-2">
                                 <Input 
                                    type="text" 
                                    value={replyText} 
                                    onChange={e => setReplyText(e.target.value)} 
                                    placeholder={`Reply to ${selectedMessage.user}...`} 
                                    className="flex-grow bg-muted focus-visible:ring-primary" 
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleReply())}
                                 />
                                 <Button onClick={handleReply} disabled={!replyText.trim()} className="font-semibold">
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
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            <p className="text-sm text-muted-foreground mt-6 text-center">Note: Inbox is a demo with mock data. Actual social media integration is required.</p>
        </div>
    );
};
