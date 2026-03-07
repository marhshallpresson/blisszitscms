// src/components/analytics/AnalyticsDashboard.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, BarChart3, Loader2, Link as LinkIcon, TrendingUp, Users, MousePointer2, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { PostAnalyticsCard } from '@/components/analytics/PostAnalyticsCard';
import { BestTimeWidget } from '@/components/analytics/BestTimeWidget';

interface AnalyticsPoint {
  name: string;
  reach: number;
  engagement: number;
  clicks: number;
  followers: number;
  estimated: boolean;
}

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { socialAccounts, currentWorkspaceId } = useWorkspace();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Overall');
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [chartData, setChartData] = useState<AnalyticsPoint[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchWithAuth = async <TResponse,>(url: string, init?: RequestInit): Promise<TResponse> => {
    if (!user) throw new Error('User not authenticated.');
    const token = await user.getIdToken();
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } & TResponse;
    if (!response.ok) throw new Error(payload?.error || 'Request failed.');
    return payload as TResponse;
  };

  const loadOverview = async () => {
    if (!currentWorkspaceId || !user || socialAccounts.length === 0) {
      setChartData([]);
      return;
    }

    setIsLoadingData(true);
    try {
      const payload = await fetchWithAuth<{ points: AnalyticsPoint[] }>(
        `/api/analytics/overview?workspaceId=${encodeURIComponent(currentWorkspaceId)}&network=${encodeURIComponent(selectedPlatform)}&days=7`
      );
      setChartData(payload.points);
    } catch (error) {
      setChartData([]);
      toast({
        title: 'Analytics load failed',
        description: error instanceof Error ? error.message : 'Unable to load analytics overview.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const syncAnalytics = async () => {
    if (!currentWorkspaceId) {
      toast({ title: 'No workspace selected', variant: 'destructive' });
      return;
    }

    setIsSyncing(true);
    try {
      await fetchWithAuth<{ syncedDays: number; network: string }>('/api/analytics/sync', {
        method: 'POST',
        body: JSON.stringify({
          workspaceId: currentWorkspaceId,
          network: selectedPlatform,
          days: 7,
        }),
      });
      await loadOverview();
      toast({ title: 'Analytics synced', description: 'Latest analytics snapshot loaded.' });
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Unable to sync analytics.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    void loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspaceId, selectedPlatform, user, socialAccounts.length]);

  const stats = useMemo(() => {
    const totalReach = chartData.reduce((acc, curr) => acc + curr.reach, 0);
    const totalEng = chartData.reduce((acc, curr) => acc + curr.engagement, 0);
    const totalClicks = chartData.reduce((acc, curr) => acc + curr.clicks, 0);
    const totalFollowers = chartData.reduce((acc, curr) => acc + curr.followers, 0);
    return [
      { label: 'Total Reach', value: totalReach.toLocaleString(), icon: Eye, color: 'text-blue-500' },
      { label: 'Engagement', value: totalEng.toLocaleString(), icon: TrendingUp, color: 'text-purple-500' },
      { label: 'Link Clicks', value: totalClicks.toLocaleString(), icon: MousePointer2, color: 'text-orange-500' },
      { label: 'Follower Growth', value: totalFollowers.toLocaleString(), icon: Users, color: 'text-green-500' },
    ];
  }, [chartData]);

  const exportToCsv = async () => {
    if (chartData.length === 0) {
      toast({ title: 'No data to export', description: 'Sync analytics before exporting.' });
      return;
    }

    setIsExporting(true);
    try {
      const rows = ['day,reach,engagement,clicks,followers,estimated', ...chartData.map((item) => `${item.name},${item.reach},${item.engagement},${item.clicks},${item.followers},${item.estimated}`)];
      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.setAttribute('download', `blisszits-analytics-${selectedPlatform.toLowerCase()}-${Date.now()}.csv`);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast({ title: 'CSV Exported', description: 'Your analytics export is ready.' });
    } finally {
      setIsExporting(false);
    }
  };

  if (socialAccounts.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-border/70 rounded-xl bg-card/50">
        <BarChart3 size={56} className="mx-auto text-muted-foreground opacity-70" />
        <h3 className="mt-6 text-2xl font-semibold font-headline text-card-foreground">No Accounts Connected</h3>
        <p className="mt-2 text-muted-foreground font-body max-w-md mx-auto">
          Connect your social media profiles in settings to unlock analytics sync and snapshots.
        </p>
        <Button asChild className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/app/settings">
            <LinkIcon size={18} className="mr-2" /> Connect Accounts
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8" ref={reportRef}>
      <Card className="bg-card shadow-lg border-border/80">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-10 h-10 text-primary flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-3xl font-bold text-foreground font-headline">Performance Analytics</CardTitle>
                  <Badge variant="secondary">Connector Sync Ready</Badge>
                </div>
                <CardDescription className="text-base text-muted-foreground mt-1">
                  Workspace-backed analytics snapshots. Sync data to refresh chart windows.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-full md:w-[200px] bg-background">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Overall">Overall</SelectItem>
                  {socialAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.network}>
                      {acc.network} ({acc.accountName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => void syncAnalytics()} disabled={isSyncing} variant="outline">
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
                Sync
              </Button>
              <Button onClick={exportToCsv} disabled={isExporting} className="font-semibold shadow-md hover:shadow-lg bg-primary text-primary-foreground">
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download size={16} className="mr-2" />}
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <PostAnalyticsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconClassName={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle className="text-lg">Reach & Engagement Trends</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingData ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading chart data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="reach" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="hsl(var(--accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Traffic Distribution</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingData ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading chart data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <BestTimeWidget platformLabel={selectedPlatform} />
    </div>
  );
};
