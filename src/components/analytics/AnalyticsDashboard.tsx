
"use client";

declare global {
  interface Window {
    jspdf?: any;
    html2canvas?: any;
  }
}

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp, Loader2, Info, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

// NOTE: All actual data fetching is removed. This component now displays placeholders.
// The structure for KPIs and chart data is kept for illustrative purposes.

const kpiIcons: Record<string, React.ReactNode> = {
    "Follower Growth": <TrendingUp size={20} className="text-primary"/>,
    "Engagement": <BarChart3 size={20} className="text-primary"/>,
    "Reach": <LineChartIcon size={20} className="text-primary"/>,
    "Profile Visits": <PieChartIcon size={20} className="text-primary"/>,
    "Connections": <TrendingUp size={20} className="text-primary"/>,
    "Post Impressions": <BarChart3 size={20} className="text-primary"/>,
    "Video Views": <LineChartIcon size={20} className="text-primary"/>,
    "Shares": <PieChartIcon size={20} className="text-primary"/>,
};

const placeholderKpis = (platform: string) => {
    if (platform === "LinkedIn") {
        return [
            { title: "Connections", value: "N/A", change: "" },
            { title: "Post Impressions", value: "N/A", change: "" },
            { title: "Engagement Rate", value: "N/A", change: "" },
            { title: "Search Appearances", value: "N/A", change: "" }
        ];
    }
     if (platform === "TikTok") {
        return [
            { title: "Follower Growth", value: "N/A", change: "" },
            { title: "Video Views", value: "N/A", change: "" },
            { title: "Shares", value: "N/A", change: "" },
            { title: "Profile Views", value: "N/A", change: "" }
        ];
    }
    return [
        { title: "Follower Growth", value: "N/A", change: "" },
        { title: "Engagement", value: "N/A", change: "" },
        { title: "Reach", value: "N/A", change: "" },
        { title: "Profile Visits", value: "N/A", change: "" }
    ];
};

const emptyChartData: {name: string, value?: number, connections?: number, followers?: number, views?: number}[] = [];
const emptySentimentData: {name: string, value: number, color: string}[] = [
  { name: 'Positive', value: 0, color: 'hsl(var(--chart-1))' }, 
  { name: 'Neutral', value: 0, color: 'hsl(var(--chart-3))' }, 
  { name: 'Negative', value: 0, color: 'hsl(var(--destructive))' }
];
const emptyBestTimeData = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));

export const AnalyticsDashboard = () => {
    const [selectedPlatform, setSelectedPlatform] = useState<string>("Overall");
    const platforms = ["Overall", "Instagram", "TikTok", "LinkedIn"];
    const [pdfLibsLoaded, setPdfLibsLoaded] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const currentPlatformKpis = placeholderKpis(selectedPlatform);
    // Data for charts will always be empty as no actual data fetching is implemented here
    const currentFollowerData = emptyChartData;
    const currentViewsData = emptyChartData;
    const currentSentimentData = emptySentimentData;
    const currentBestTimeData = emptyBestTimeData;

    useEffect(() => {
        // Check if libraries are already loaded
        if (window.jspdf && window.html2canvas) {
            setPdfLibsLoaded(true);
            return;
        }
        // Attempt to load scripts if not already present - this is a simplified approach
        // In a robust app, manage script loading more carefully or bundle them
        const jspdfScript = document.getElementById('jspdf-script');
        const html2canvasScript = document.getElementById('html2canvas-script');

        if (jspdfScript && html2canvasScript) {
            let loadedCount = 0;
            const checkLoaded = () => {
                if (window.jspdf && window.html2canvas) {
                    setPdfLibsLoaded(true);
                } else if (loadedCount < 10) { // Try for 5 seconds
                    loadedCount++;
                    setTimeout(checkLoaded, 500);
                } else {
                     console.warn("jsPDF or html2canvas still not loaded after attempts.");
                }
            };
            checkLoaded();
        } else {
            console.warn("PDF script tags not found in RootLayout. PDF export may fail.");
        }
    }, []);

    const exportToPdf = async () => {
        if (!pdfLibsLoaded || !reportRef.current) {
            toast({ title: "PDF Export Not Ready", description: "PDF library or content missing.", variant: "destructive" });
            return;
        }
        setIsExporting(true);
        try {
            const { jsPDF } = window.jspdf;
            const html2canvasInstance = window.html2canvas;

            const canvas = await html2canvasInstance(reportRef.current, { scale: 2, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background').trim(), useCORS: true, logging: false });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgHeight = pdfWidth / ratio;
            
            let heightLeft = imgHeight;
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) { // Changed to > 0
              position -= pageHeight; // Correctly calculate new position
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pageHeight;
            }
            
            pdf.save(`Blisszits-Analytics-${selectedPlatform}-${new Date().toISOString().split('T')[0]}.pdf`);
            toast({ title: "PDF Exported", description: "Analytics report downloaded." });
        } catch (error: unknown) {
            console.error("PDF Export Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not generate PDF. Check console.";
            toast({ title: "PDF Export Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };
    
    const NoDataPlaceholder = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
            <Info size={32} className="mb-3 opacity-70"/>
            <p className="text-lg font-medium">{message}</p>
            <p className="text-sm">Connect your accounts or add data to see analytics.</p>
        </div>
    );


    return (
        <div className="space-y-8">
            <Card className="bg-card shadow-xl border-border/80">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                             <BarChart3 className="w-10 h-10 text-primary" />
                             <div>
                                <CardTitle className="text-3xl font-bold text-foreground font-headline">General Analytics</CardTitle>
                                <CardDescription className="text-base text-muted-foreground mt-1">Track overall content performance. (Illustrative Data)</CardDescription>
                             </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as string)}>
                                <SelectTrigger className="w-full md:w-[180px] bg-background focus:ring-primary" aria-label="Select analytics platform">
                                    <SelectValue placeholder="Select Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button onClick={exportToPdf} disabled={!pdfLibsLoaded || isExporting} className="font-semibold shadow-md hover:shadow-lg w-full md:w-auto">
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download size={16} className="mr-2" />}
                                {isExporting ? 'Exporting...' : (pdfLibsLoaded ? 'Export PDF' : 'Loading Libs...')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>


            <div ref={reportRef} className="p-1 md:p-4 bg-card rounded-lg shadow-lg border border-border/70">
                <h2 className="text-2xl font-bold text-foreground font-headline mb-6 pl-2 md:pl-0">{selectedPlatform} Performance Metrics</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {currentPlatformKpis.map((kpi, index) => (
                        <Card key={kpi.title} className="shadow-md border-border/70">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                                {kpiIcons[kpi.title] || <BarChart3 size={20} className="text-muted-foreground"/>}
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
                                {kpi.change && <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{kpi.change} from last period</p>}
                                {(!kpi.value || kpi.value === "N/A") && <p className="text-xs text-muted-foreground mt-1">Data not available.</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card className="shadow-md border-border/70">
                        <CardHeader><CardTitle className="font-headline text-xl">{selectedPlatform === 'LinkedIn' ? 'Connections Growth' : 'Follower Growth'}</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]">
                          {currentFollowerData.length === 0 ? (
                            <NoDataPlaceholder message="Follower growth data unavailable." />
                          ) : (
                            <ResponsiveContainer width="100%" height="100%"><LineChart data={currentFollowerData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis domain={['dataMin - 100', 'dataMax + 100']} stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/><Legend wrapperStyle={{fontSize: "12px"}}/><Line type="monotone" dataKey={selectedPlatform === 'LinkedIn' ? 'connections' : 'followers'} stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} dot={{ strokeWidth: 1, r: 3, fill: "hsl(var(--primary))" }} /></LineChart></ResponsiveContainer>
                          )}
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-border/70">
                        <CardHeader><CardTitle className="font-headline text-xl">{selectedPlatform === 'LinkedIn' ? 'Impressions' : 'Views'}</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]">
                          {currentViewsData.length === 0 ? (
                            <NoDataPlaceholder message="Views data unavailable." />
                          ) : (
                            <ResponsiveContainer width="100%" height="100%"><BarChart data={currentViewsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5}/><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/><Legend wrapperStyle={{fontSize: "12px"}}/><Bar dataKey="views" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                          )}
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="shadow-md border-border/70">
                        <CardHeader><CardTitle className="font-headline text-xl">Sentiment Analysis</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]">
                           {currentSentimentData.every(d => d.value === 0) ? (
                            <NoDataPlaceholder message="Sentiment data unavailable." />
                          ) : (
                            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={currentSentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={"80%"} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => { const radius = innerRadius + (outerRadius - innerRadius) * 1.2; const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180)); const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180)); return (<text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>{`${name} (${(percent * 100).toFixed(0)}%)`}</text>);}}>{currentSentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2}/>)}</Pie><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/><Legend wrapperStyle={{fontSize: "12px"}}/></PieChart></ResponsiveContainer>
                           )}
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-border/70">
                        <CardHeader><CardTitle className="font-headline text-xl">Engagement Heatmap (Illustrative)</CardTitle></CardHeader>
                        <CardContent>
                           <div className="grid grid-cols-7 gap-1 text-center text-xs mt-2">
                               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-semibold text-muted-foreground pb-1">{day}</div>)}
                               {currentBestTimeData.flat().map((value, i) => <div key={i} className="h-6 md:h-8 rounded-sm border border-border/30" style={{ backgroundColor: `hsla(var(--primary-hsl, 190 70% 45%), ${value * 0.8 + 0.05})` }} title={`${Math.floor(i/7)}:00-${Math.floor(i/7)+1}:00 on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i%7]}`}></div>)}
                           </div>
                           <p className="text-xs text-muted-foreground text-center mt-3">Darker shades indicate higher engagement. (Data is illustrative)</p>
                        </CardContent>
                    </Card>
                 </div>
            </div>
             <div className="mt-8 p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-700 flex items-start gap-3">
                <AlertTriangle size={24} className="flex-shrink-0"/>
                <div>
                    <h4 className="font-semibold">Illustrative Data Only</h4>
                    <p className="text-sm">The analytics data shown here is for demonstration purposes and does not reflect live user or content data. Actual social media account integration is required for real insights.</p>
                </div>
            </div>
        </div>
    );
};
