// src/components/analytics/AnalyticsDashboard.tsx
"use client";

// This component is now for a general, non-workspace-specific analytics overview,
// or a placeholder if all analytics are moved into a workspace context.
// For the corporate site, this might show high-level brand metrics (if any connected).
// For now, it's a placeholder.

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

const kpiIcons: Record<string, React.ReactNode> = {
    "Follower Growth": <TrendingUp size={20} className="text-primary"/>,
    "Engagement": <BarChart3 size={20} className="text-primary"/>,
    "Reach": <LineChartIcon size={20} className="text-primary"/>,
    "Profile Visits": <PieChartIcon size={20} className="text-primary"/>,
};

// Demo data structures removed, will use placeholders or "No data" messages
const emptyKpis = (platform: string) => [
    { title: "Follower Growth", value: "N/A", change: "" },
    { title: "Engagement", value: "N/A", change: "" },
    { title: "Reach", value: "N/A", change: "" },
    { title: "Profile Visits", value: "N/A", change: "" }
];

const emptyChartData: {name: string, value?: number, connections?: number, followers?: number, views?: number}[] = [];
const emptySentimentData: {name: string, value: number, color: string}[] = [
  { name: 'Positive', value: 0, color: 'hsl(var(--chart-1))' }, 
  { name: 'Neutral', value: 0, color: 'hsl(var(--chart-3))' }, 
  { name: 'Negative', value: 0, color: 'hsl(var(--destructive))' }
];
const emptyBestTimeData = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));


export const AnalyticsDashboard = () => {
    const [selectedPlatform, setSelectedPlatform] = useState<string>("Overall Performance");
    const platforms = ["Overall Performance", "Platform A (Demo)", "Platform B (Demo)"]; // Generic placeholders
    const [pdfLibsLoaded, setPdfLibsLoaded] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const currentPlatformKpis = emptyKpis(selectedPlatform);
    const currentFollowerData = emptyChartData;
    const currentViewsData = emptyChartData;
    const currentSentimentData = emptySentimentData;
    const currentBestTimeData = emptyBestTimeData;

    useEffect(() => {
        if (window.jspdf && window.html2canvas) {
            setPdfLibsLoaded(true);
            return;
        }
        const jspdfScript = document.getElementById('jspdf-script');
        const html2canvasScript = document.getElementById('html2canvas-script');
        if (jspdfScript && html2canvasScript) {
            let loadedCount = 0;
            const checkLoaded = () => {
                if (window.jspdf && window.html2canvas) {
                    setPdfLibsLoaded(true);
                } else if (loadedCount < 10) {
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

            while (heightLeft > 0) {
              position -= pageHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pageHeight;
            }
            
            pdf.save(`Blisszits-Analytics-${selectedPlatform.replace(/\s/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`);
            toast({ title: "PDF Exported", description: "Analytics report downloaded." });
        } catch (error) {
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
            <p className="text-sm">Data for this section is illustrative or not yet connected.</p>
        </div>
    );


    return (
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
            <Card className="bg-card shadow-xl border-border/80">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                             <BarChart3 className="w-10 h-10 text-primary" />
                             <div>
                                <CardTitle className="text-3xl font-bold text-foreground font-headline">Brand Analytics Overview</CardTitle>
                                <CardDescription className="text-base text-muted-foreground mt-1">Track overall brand performance. (Data is illustrative)</CardDescription>
                             </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as string)}>
                                <SelectTrigger className="w-full md:w-[220px] bg-background focus:ring-primary" aria-label="Select analytics platform">
                                    <SelectValue placeholder="Select View" />
                                </SelectTrigger>
                                <SelectContent>
                                    {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button onClick={exportToPdf} disabled={!pdfLibsLoaded || isExporting} className="font-semibold shadow-md hover:shadow-lg w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download size={16} className="mr-2" />}
                                {isExporting ? 'Exporting...' : (pdfLibsLoaded ? 'Export PDF' : 'Loading Libs...')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>


            <div ref={reportRef} className="p-1 md:p-4 bg-card rounded-lg shadow-lg border border-border/70">
                <h2 className="text-2xl font-bold text-foreground font-headline mb-6 pl-2 md:pl-0">{selectedPlatform} Metrics</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {currentPlatformKpis.map((kpi) => (
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
                        <CardHeader><CardTitle className="font-headline text-xl">Follower Growth (Demo)</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]">
                            <NoDataPlaceholder message="Follower growth data unavailable." />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-border/70">
                        <CardHeader><CardTitle className="font-headline text-xl">Views/Impressions (Demo)</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]">
                            <NoDataPlaceholder message="Views data unavailable." />
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="shadow-md border-border/70">
                        <CardHeader><CardTitle className="font-headline text-xl">Sentiment Analysis (Demo)</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]">
                            <NoDataPlaceholder message="Sentiment data unavailable." />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-border/70">
                        <CardHeader><CardTitle className="font-headline text-xl">Engagement Heatmap (Illustrative)</CardTitle></CardHeader>
                        <CardContent>
                           <div className="grid grid-cols-7 gap-1 text-center text-xs mt-2">
                               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-semibold text-muted-foreground pb-1">{day}</div>)}
                               {currentBestTimeData.flat().map((value, i) => <div key={i} className="h-6 md:h-8 rounded-sm border border-border/30" style={{ backgroundColor: `hsla(var(--primary-hsl, 205 70% 45%), ${value * 0.8 + 0.05})` }} title={`${Math.floor(i/7)}:00-${Math.floor(i/7)+1}:00 on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i%7]}`}></div>)}
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
