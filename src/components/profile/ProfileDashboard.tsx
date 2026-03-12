// src/components/profile/ProfileDashboard.tsx
"use client";

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
// ✅ Edit appears once
import { Mail, Loader2, UserCircle, User, Edit, Save, Instagram, Linkedin, Video, Facebook, Globe, Trash2, Plus, Youtube, Twitter } from 'lucide-react';
import type { UserProfile } from '@/types/user';
import { SUPPORTED_NETWORKS, normalizeNetworkKey, type NetworkKey } from '@/lib/network-capabilities';
import { Badge } from '../ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';

const PLATFORM_ICON_MAP = {
  instagram: { icon: Instagram, color: 'text-pink-600' },
  tiktok: { icon: Video, color: 'text-black' },
  linkedin: { icon: Linkedin, color: 'text-blue-700' },
  facebook: { icon: Facebook, color: 'text-blue-600' },
  youtube: { icon: Youtube, color: 'text-red-600' },
  x: { icon: Twitter, color: 'text-foreground' },
} as const;

const OAUTH_FIRST_NETWORKS = new Set<NetworkKey>(['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'x']);

const encodeBase64Url = (bytes: Uint8Array): string => {
  const binary = Array.from(bytes)
    .map((byte) => String.fromCharCode(byte))
    .join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const createPkcePair = async (): Promise<{ codeVerifier: string; codeChallenge: string }> => {
  const random = new Uint8Array(32);
  window.crypto.getRandomValues(random);
  const codeVerifier = encodeBase64Url(random);
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  const codeChallenge = encodeBase64Url(new Uint8Array(digest));
  return { codeVerifier, codeChallenge };
};

export const ProfileDashboard = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const { socialAccounts, connectAccount, disconnectAccount, currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastOauthToastRef = useRef<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: '',
    phoneNumber: '',
  });

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        phoneNumber: userProfile.phoneNumber || '',
      });
    }
  }, [userProfile]);

  useEffect(() => {
    const network = searchParams?.get('oauth_network');
    const status = searchParams?.get('oauth_status');
    const reason = searchParams?.get('oauth_reason');
    if (!network || !status) return;

    const signature = `${network}:${status}:${reason || ''}`;
    if (lastOauthToastRef.current === signature) return;
    lastOauthToastRef.current = signature;

    const prettyNetwork = network.toUpperCase();
    if (status === 'connected') {
      toast({
        title: `${prettyNetwork} connected`,
        description: 'OAuth connection completed successfully.',
      });
    } else {
      toast({
        title: `${prettyNetwork} OAuth failed`,
        description: reason ? reason.replace(/_/g, ' ') : 'Connection could not be completed.',
        variant: 'destructive',
      });
    }

    router.replace('/app/settings', { scroll: false });
  }, [router, searchParams, toast]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingProfile(true);
    try {
      await updateUserProfile(formData);
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const startOAuthFlow = async (network: NetworkKey): Promise<'redirected' | 'not_configured'> => {
    if (!user || !currentWorkspace) throw new Error('No workspace selected.');

    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      throw new Error('Secure OAuth flow is not available in this browser context.');
    }

    const { codeVerifier, codeChallenge } = await createPkcePair();
    const redirectUri = `${window.location.origin}/api/integrations/${network}/callback`;
    const idToken = await user.getIdToken();

    const response = await fetch(`/api/integrations/${network}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        workspaceId: currentWorkspace.id,
        redirectUri,
        codeVerifier,
        codeChallenge,
        codeChallengeMethod: 'S256',
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { authorizationUrl?: string; message?: string; error?: string; status?: string }
      | null;

    if (response.status === 501 || payload?.status === 'not_configured') {
      return 'not_configured';
    }
    if (!response.ok || !payload?.authorizationUrl) {
      throw new Error(payload?.error || payload?.message || 'Unable to start OAuth flow.');
    }

    window.location.assign(payload.authorizationUrl);
    return 'redirected';
  };

  const handleConnect = async (network: NetworkKey, label: string) => {
    if (!currentWorkspace) {
      toast({ title: "Select a workspace first", variant: "destructive" });
      return;
    }
    setIsConnecting(network);
    try {
      if (OAUTH_FIRST_NETWORKS.has(network)) {
        const oauthStatus = await startOAuthFlow(network);
        if (oauthStatus === 'redirected') return;
      }

      await connectAccount(network, `${userProfile?.displayName || 'User'}'s ${label}`);
      toast({
        title: 'Account Connected',
        description: `Connected ${label} in metadata mode. Add OAuth credentials for live publishing.`,
      });
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error?.message || 'Unable to connect this account.', variant: "destructive" });
    } finally {
      setIsConnecting(null);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card shadow-xl border-border/80">
        <CardHeader>
            <div className="flex items-center gap-4">
                <UserCircle className="w-10 h-10 text-primary flex-shrink-0" />
                <div>
                    <CardTitle className="text-3xl font-bold text-foreground font-headline">Account & Settings</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">Manage your brand profiles and personal information.</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg border-border/70">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2"><Edit size={20} className="text-primary"/> Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="displayName">Full Name</Label>
                    <div className="relative mt-1">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="displayName" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="pl-9 bg-input"/>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                     <div className="relative mt-1">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" value={user?.email || ''} readOnly disabled className="pl-9 bg-muted/50 cursor-not-allowed"/>
                     </div>
                  </div>
                </div>
                <Button type="submit" disabled={isSubmittingProfile} className="bg-primary hover:bg-primary/90">
                  {isSubmittingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={16} className="mr-2" />}
                  Save Profile Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border/70">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="font-headline text-xl flex items-center gap-2"><Globe size={20} className="text-primary"/> Connected Social Accounts</CardTitle>
                  <CardDescription>Accounts connected to the current workspace: <span className="font-semibold text-foreground">{currentWorkspace?.name || 'None Selected'}</span></CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {socialAccounts.length > 0 ? (
                <div className="space-y-4">
                  {socialAccounts.map(acc => {
                    const networkKey = normalizeNetworkKey(acc.network);
                    const platform = networkKey ? PLATFORM_ICON_MAP[networkKey] : null;
                    const Icon = platform?.icon || Globe;
                    return (
                      <div key={acc.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                        <div className="flex items-center gap-4">
                          <Icon className={`h-6 w-6 ${platform?.color}`} />
                          <div>
                            <p className="font-semibold text-sm">{acc.accountName}</p>
                            <p className="text-xs text-muted-foreground capitalize">{acc.status}</p>
                            <p className="text-xs text-muted-foreground">Mode: {acc.integrationMode}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => disconnectAccount(acc.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground italic">No social accounts connected to this workspace.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="shadow-lg border-border/70">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2"><Plus size={20} className="text-primary"/> Connect a Channel</CardTitle>
              <CardDescription>Expand your reach by linking more platforms.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SUPPORTED_NETWORKS.map((network) => {
                const platform = PLATFORM_ICON_MAP[network.network];
                const Icon = platform?.icon || Globe;
                const isConnected = socialAccounts.some(
                  (account) => normalizeNetworkKey(account.network) === network.network
                );

                return (
                  <div key={network.network} className="rounded-md border border-border/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${platform?.color || ''}`} />
                        <div>
                          <p className="text-sm font-semibold">{network.label}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant={network.canPublish ? 'default' : 'outline'}>
                              {network.canPublish ? 'Publish' : 'No Publish'}
                            </Badge>
                            <Badge variant={network.canFetchComments ? 'default' : 'outline'}>
                              {network.canFetchComments ? 'Inbox' : 'No Inbox'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="h-10"
                        onClick={() => handleConnect(network.network, network.label)}
                        disabled={!!isConnecting || isConnected}
                      >
                        {isConnecting === network.network ? <Loader2 className="h-4 w-4 animate-spin" /> : `Connect`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Edit className="h-5 w-5" /> Pro Plan</CardTitle>
              <CardDescription className="text-primary-foreground/80">You are currently on the Pro plan ($29/mo). You have 12 social account slots remaining.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold">Upgrade to Agency</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
