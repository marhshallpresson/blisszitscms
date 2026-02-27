// src/components/analytics/AnalyticsDashboard.tsx
"use client";

import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, BarChart3, Loader2, Link as LinkIcon, TrendingUp, Users, MousePointer2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Badge } from '@/components/ui/badge';

const generateMockData = (platform: string) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(day => ({
    name: day,
    reach: Math.floor(Math.random() * 5000) + 1000,
    engagement: Math.floor(Math.random() * 800) + 200,
    clicks: Math.floor(Math.random() * 300) + 50,
  }));
};

export const AnalyticsDashboard = () => {
    const { socialAccounts } = useWorkspace();
    const [selectedPlatform, setSelectedPlatform] = useState<string>("Overall");
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const chartData = useMemo(() => generateMockData(selectedPlatform), [selectedPlatform]);

    const stats = useMemo(() => {
      const totalReach = chartData.reduce((acc, curr) => acc + curr.reach, 0);
      const totalEng = chartData.reduce((acc, curr) => acc + curr.engagement, 0);
      const totalClicks = chartData.reduce((acc, curr) => acc + curr.clicks, 0);
      return [
        { label: 'Total Reach', value: totalReach.toLocaleString(), icon: Eye, color: 'text-blue-500' },
        { label: 'Engagement', value: totalEng.toLocaleString(), icon: TrendingUp, color: 'text-purple-500' },
        { label: 'Link Clicks', value: totalClicks.toLocaleString(), icon: MousePointer2, color: 'text-orange-500' },
        { label: 'New Followers', value: '432', icon: Users, color: 'text-green-500' },
      ];
    }, [chartData]);

    const exportToPdf = async () => {
        setIsExporting(true);
        // Simulated export
        setTimeout(() => {
          toast({ title: "PDF Exported", description: "Your brand performance report has been generated." });
          setIsExporting(false);
        }, 1500);
    };

    if (socialAccounts.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed border-border/70 rounded-xl bg-card/50">
          <BarChart3 size={56} className="mx-auto text-muted-foreground opacity-70" />
          <h3 className="mt-6 text-2xl font-semibold font-headline text-card-foreground">No Accounts Connected</h3>
          <p className="mt-2 text-muted-foreground font-body max-w-md mx-auto">
            Connect your social media profiles in settings to unlock the analytics demo and future live metrics.
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
                                  <Badge variant="secondary">Simulated Data</Badge>
                                </div>
                                <CardDescription className="text-base text-muted-foreground mt-1">Demo dashboard with generated metrics. Live connectors are Phase 2.</CardDescription>
                             </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                <SelectTrigger className="w-full md:w-[180px] bg-background">
                                    <SelectValue placeholder="Select Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Overall">Overall</SelectItem>
                                    {socialAccounts.map(acc => (
                                      <SelectItem key={acc.id} value={acc.network}>{acc.network} ({acc.accountName})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={exportToPdf} disabled={isExporting} className="font-semibold shadow-md hover:shadow-lg bg-primary text-primary-foreground">
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download size={16} className="mr-2" />}
                                Export Report
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <Card key={i}>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader><CardTitle className="text-lg">Reach & Engagement Trends</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Traffic Distribution</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
        </div>
    );
};
