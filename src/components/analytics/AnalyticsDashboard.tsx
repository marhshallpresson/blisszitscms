// src/components/analytics/AnalyticsDashboard.tsx
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
// Recharts components are imported but will show "No data" if data arrays are empty.
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

// KPI Icons remain for structure
const kpiIcons: Record<string, React.ReactNode> = {
    "Follower Growth": <TrendingUp size={20} className="text-primary"/>,
    "Engagement": <BarChart3 size={20} className="text-primary"/>,
    "Reach": <LineChartIcon size={20} className="text-primary"/>,
    "Profile Visits": <PieChartIcon size={20} className="text-primary"/>,
};

// All mock data is removed. Components will show "No data" or illustrative placeholders.
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
    const platforms = ["Overall Performance", "Platform A (Illustrative)", "Platform B (Illustrative)"];
    const [pdfLibsLoaded, setPdfLibsLoaded] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const currentPlatformKpis = emptyKpis(selectedPlatform);
    const currentFollowerData = emptyChartData; // No data
    const currentViewsData = emptyChartData; // No data
    const currentSentimentData = emptySentimentData; // No data
    const currentBestTimeData = emptyBestTimeData; // Illustrative structure

    useEffect(() => {
        if (window.jspdf && window.html2canvas) {
            setPdfLibsLoaded(true);
            return;
        }
        const jspdfScript = document.getElementById('jspdf-script');
        const html2canvasScript = document.getElementById('html2canvas-script');
        
        let jspdfLoaded = false;
        let html2canvasLoaded = false;

        const checkBothLoaded = () => {
            if (jspdfLoaded && html2canvasLoaded) {
                 setPdfLibsLoaded(true);
            }
        };

        if (jspdfScript) {
            jspdfScript.onload = () => { jspdfLoaded = true; checkBothLoaded(); };
            jspdfScript.onerror = () => console.error("Failed to load jsPDF script.");
        } else {
             console.warn("jsPDF script tag not found. PDF export may fail.");
             jspdfLoaded = true; // Assume it might load via other means or fail silently
        }

        if (html2canvasScript) {
            html2canvasScript.onload = () => { html2canvasLoaded = true; checkBothLoaded(); };
            html2canvasScript.onerror = () => console.error("Failed to load html2canvas script.");
        } else {
            console.warn("html2canvas script tag not found. PDF export may fail.");
            html2canvasLoaded = true; // Assume it might load
        }
        
        // Fallback check in case onload doesn't fire as expected for dynamically added scripts
        // or if scripts are already loaded by the time this effect runs.
        if (window.jspdf) jspdfLoaded = true;
        if (window.html2canvas) html2canvasLoaded = true;
        if (jspdfLoaded && html2canvasLoaded) setPdfLibsLoaded(true);

    }, []);

    const exportToPdf = async () => {
        if (!pdfLibsLoaded || !reportRef.current) {
            toast({ title: "PDF Export Not Ready", description: "Required PDF library or report content is missing. Please try again in a moment.", variant: "destructive" });
            if (!window.jspdf) console.error("jsPDF library is missing.");
            if (!window.html2canvas) console.error("html2canvas library is missing.");
            if (!reportRef.current) console.error("Report reference is missing.");
            return;
        }
        setIsExporting(true);
        try {
            const { jsPDF } = window.jspdf;
            const html2canvasInstance = window.html2canvas;

            const canvas = await html2canvasInstance(reportRef.current, { 
              scale: 2, 
              backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#ffffff', // Fallback color
              useCORS: true, 
              logging: false 
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            let imgHeight = pdfWidth / ratio;
            let heightLeft = imgHeight;
            let position = 0;

            if (imgHeight > pdfHeight) { // Content is taller than one page
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pdfHeight;
              while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
              }
            } else { // Content fits on one page
              pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            }
            
            pdf.save(`Blisszits-Analytics-${selectedPlatform.replace(/\s/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`);
            toast({ title: "PDF Exported", description: "Analytics report downloaded." });
        } catch (error) {
            console.error("PDF Export Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not generate PDF. Check console for details.";
            toast({ title: "PDF Export Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };
    
    const NoDataPlaceholder = ({ message, height = "h-[300px] md:h-[350px]" }: { message: string, height?: string }) => (
        <div className={`flex flex-col items-center justify-center text-muted-foreground p-8 text-center ${height}`}>
            <Info size={32} className="mb-3 opacity-70"/>
            <p className="text-lg font-medium">{message}</p>
            <p className="text-sm">Real data integration is pending for this section.</p>
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
                        <CardHeader><CardTitle className="font-headline text-xl">Follower Growth (Illustrative)</CardTitle></CardHeader>
                        <CardContent>
                           <NoDataPlaceholder message="Follower growth data unavailable." />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-border/70">
                        <CardHeader><CardTitle className="font-headline text-xl">Views/Impressions (Illustrative)</CardTitle></CardHeader>
                         <CardContent>
                           <NoDataPlaceholder message="Views/impressions data unavailable." />
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="shadow-md border-border/70">
                        <CardHeader><CardTitle className="font-headline text-xl">Sentiment Analysis (Illustrative)</CardTitle></CardHeader>
                         <CardContent>
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
                    <p className="text-sm">The analytics data shown here is for demonstration purposes and does not reflect live user or content data. Actual social media account integration and data fetching would be required for real insights.</p>
                </div>
            </div>
        </div>
    );
};
