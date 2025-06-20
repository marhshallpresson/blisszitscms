
"use client";

// Ensure window is defined for jsPDF and html2canvas if loaded globally
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
import { Download, LayoutDashboard, Video, BarChart3, Edit3, Loader2, Info } from 'lucide-react'; 
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';


// No mock data here. Data should be fetched or passed as props.
// Components will render placeholder states if data is not available.

const kpiIcons: Record<number, React.ReactNode> = {
    0: <LayoutDashboard size={20} className="text-primary"/>,
    1: <Video size={20} className="text-primary"/>,
    2: <BarChart3 size={20} className="text-primary"/>,
    3: <Edit3 size={20} className="text-primary"/>
};

// Sample KPI structure - values will be "N/A" or actual fetched data
const sampleKpis = [
    { title: "Follower Growth", value: "N/A", change: "" },
    { title: "Engagement", value: "N/A", change: "" },
    { title: "Reach", value: "N/A", change: "" },
    { title: "Profile Visits", value: "N/A", change: "" }
];

// Sample structure for charts, data will be empty or fetched
const emptyFollowerData: {name: string, followers?: number, connections?: number}[] = [];
const emptyViewsData: {name: string, views: number}[] = [];
const emptySentimentData: {name: string, value: number, color: string}[] = [
  { name: 'Positive', value: 0, color: '#10B981' }, { name: 'Neutral', value: 0, color: '#6B7280' }, { name: 'Negative', value: 0, color: '#EF4444' }
];
const emptyBestTimeData = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));

export const AnalyticsDashboard = () => {
    const [selectedPlatform, setSelectedPlatform] = useState<string>("Overall"); 
    const platforms = ["Overall", "Instagram", "TikTok", "LinkedIn"]; 
    const [pdfLibsLoaded, setPdfLibsLoaded] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // NOTE: In a real app, you'd fetch platform-specific data here based on `selectedPlatform`
    // For now, we use empty/placeholder structures.
    const currentPlatformKpis = sampleKpis; // This would be dynamically set
    const currentFollowerData = emptyFollowerData;
    const currentViewsData = emptyViewsData;
    const currentSentimentData = emptySentimentData;
    const currentBestTimeData = emptyBestTimeData;

    useEffect(() => {
        if (window.jspdf && window.html2canvas) {
            setPdfLibsLoaded(true);
        } else {
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (window.jspdf && window.html2canvas) {
                    setPdfLibsLoaded(true);
                    clearInterval(interval);
                } else if (attempts > 10) { 
                    console.warn("jsPDF or html2canvas not loaded after 5 seconds.");
                    clearInterval(interval);
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, []);

    const exportToPdf = async () => {
        if (!pdfLibsLoaded || !reportRef.current) {
            toast({ title: "PDF Export Not Ready", description: "PDF generation library is still loading or content not found.", variant: "destructive" });
            return;
        }
        setIsExporting(true);
        try {
            const { jsPDF } = window.jspdf;
            const html2canvas = window.html2canvas;

            const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: null, useCORS: true, logging: false });
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

            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pageHeight;
            }
            
            pdf.save(`Blisszits-Analytics-${selectedPlatform}-${new Date().toISOString().split('T')[0]}.pdf`);
            toast({ title: "PDF Exported", description: "Analytics report has been downloaded." });
        } catch (error: unknown) {
            console.error("PDF Export Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not generate PDF. Check console for errors.";
            toast({ title: "PDF Export Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-foreground font-headline">General Analytics Overview</h1>
                    <p className="text-lg text-muted-foreground mt-1">Track your overall content performance. Workspace-specific analytics are available within each workspace.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as string)}>
                        <SelectTrigger className="w-[180px]" aria-label="Select analytics platform">
                            <SelectValue placeholder="Select Platform" />
                        </SelectTrigger>
                        <SelectContent>
                            {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={exportToPdf} disabled={!pdfLibsLoaded || isExporting} className="font-semibold">
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download size={16} className="mr-2" />}
                        {isExporting ? 'Exporting...' : (pdfLibsLoaded ? 'Export PDF' : 'Libs Loading...')}
                    </Button>
                </div>
            </div>

            <div ref={reportRef} className="p-1 md:p-4 bg-background rounded-lg"> 
                <h2 className="text-2xl font-bold text-foreground font-headline mb-6 pl-2 md:pl-0">{selectedPlatform} Performance (Placeholder Data)</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {currentPlatformKpis.map((kpi, index) => (
                        <Card key={kpi.title} className="shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                                {kpiIcons[index] || <BarChart3 size={20} className="text-muted-foreground"/>}
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
                                {kpi.change && <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{kpi.change} from last period</p>}
                                {!kpi.value || kpi.value === "N/A" && <p className="text-xs text-muted-foreground mt-1">Data not available.</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card className="shadow-md">
                        <CardHeader><CardTitle className="font-headline">{selectedPlatform === 'LinkedIn' ? 'Connections Growth' : 'Follower Growth'}</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]">
                          {currentFollowerData.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground"><Info size={20} className="mr-2"/>No data to display for follower growth.</div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%"><LineChart data={currentFollowerData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis domain={['dataMin - 100', 'dataMax + 100']} stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/><Legend wrapperStyle={{fontSize: "12px"}}/><Line type="monotone" dataKey={selectedPlatform === 'LinkedIn' ? 'connections' : 'followers'} stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer>
                          )}
                        </CardContent>
                    </Card>
                    <Card className="shadow-md">
                        <CardHeader><CardTitle className="font-headline">{selectedPlatform === 'LinkedIn' ? 'Impressions' : 'Views'}</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]">
                          {currentViewsData.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground"><Info size={20} className="mr-2"/>No data to display for views.</div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%"><BarChart data={currentViewsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3}/><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/><Legend wrapperStyle={{fontSize: "12px"}}/><Bar dataKey="views" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                          )}
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="shadow-md">
                        <CardHeader><CardTitle className="font-headline">Sentiment Analysis</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]">
                           {currentSentimentData.every(d => d.value === 0) ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground"><Info size={20} className="mr-2"/>No sentiment data available.</div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={currentSentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={"80%"} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => { const radius = innerRadius + (outerRadius - innerRadius) * 1.2; const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180)); const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180)); return (<text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>{`${name} (${(percent * 100).toFixed(0)}%)`}</text>);}}>{currentSentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2}/>)}</Pie><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/><Legend wrapperStyle={{fontSize: "12px"}}/></PieChart></ResponsiveContainer>
                           )}
                        </CardContent>
                    </Card>
                    <Card className="shadow-md">
                        <CardHeader><CardTitle className="font-headline">Best Times to Post (Engagement Heatmap)</CardTitle></CardHeader>
                        <CardContent>
                           <div className="grid grid-cols-7 gap-1 text-center text-xs mt-2">
                               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-semibold text-muted-foreground pb-1">{day}</div>)}
                               {currentBestTimeData.flat().map((value, i) => <div key={i} className="h-6 md:h-8 rounded-sm border border-border/30" style={{ backgroundColor: `hsla(var(--primary-raw, 240 50% 60%), ${value * 0.8 + 0.1})` }} title={`${Math.floor(i/7)}:00-${Math.floor(i/7)+1}:00 on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i%7]}`}></div>)}
                           </div>
                           <p className="text-xs text-muted-foreground text-center mt-2">Darker means higher engagement. (Illustrative - No real data)</p>
                        </CardContent>
                    </Card>
                 </div>
            </div>
             <p className="text-sm text-muted-foreground mt-6 text-center">Note: General analytics data is illustrative. Real data integration is required for accurate insights. Workspace-specific analytics will be shown within each workspace.</p>
        </div>
    );
};
