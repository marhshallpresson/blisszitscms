
"use client";

// Ensure window is defined for jsPDF and html2canvas if loaded globally
declare global {
  interface Window {
    jspdf?: any; // Adjust type as needed if you have specific jsPDF typings
    html2canvas?: any; // Adjust type as needed
  }
}

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, LayoutDashboard, Video, BarChart3, Edit3, Loader2 } from 'lucide-react'; // Using BarChart3 for distinctness
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

// Mock Data (from old script)
const analyticsData = {
    Instagram: { kpis: [ { title: "Follower Growth", value: "+1,380", change: "+27%" }, { title: "Engagement", value: "8,945", change: "+45%" }, { title: "Reach", value: "198.1k", change: "+75%" }, { title: "Profile Visits", value: "11.4k", change: "+62%" }], followerData: [{ name: 'W1', followers: 5120 }, { name: 'W2', followers: 5340 }, { name: 'W3', followers: 5890 }, { name: 'W4', followers: 6500 }], viewsData: [{ name: 'P1', views: 21400 }, { name: 'P2', views: 35500 }, { name: 'P3', views: 41800 }, { name: 'P4', views: 39200 }, { name: 'P5', views: 45100 }, { name: 'P6', views: 52300 }] },
    TikTok: { kpis: [ { title: "Follower Growth", value: "+10,200", change: "+90%" }, { title: "Video Views", value: "2.4M", change: "+150%" }, { title: "Shares", value: "55.2k", change: "+120%" }, { title: "Profile Views", value: "48.7k", change: "+110%" }], followerData: [{ name: 'W1', followers: 11250 }, { name: 'W2', followers: 13800 }, { name: 'W3', followers: 17200 }, { name: 'W4', followers: 21450 }], viewsData: [{ name: 'P1', views: 180500 }, { name: 'P2', views: 250100 }, { name: 'P3', views: 450600 }, { name: 'P4', views: 390800 }, { name: 'P5', views: 510200 }, { name: 'P6', views: 680000 }] },
    LinkedIn: { kpis: [ { title: "Connections", value: "+235", change: "+19%" }, { title: "Post Impressions", value: "56.2k", change: "+35%" }, { title: "Engagement Rate", value: "4.8%", change: "+15%" }, { title: "Search Apps", value: "1,240", change: "+22%" }], followerData: [{ name: 'W1', connections: 1240 }, { name: 'W2', connections: 1295 }, { name: 'W3', connections: 1380 }, { name: 'W4', connections: 1475 }], viewsData: [{ name: 'P1', views: 5200 }, { name: 'P2', views: 7800 }, { name: 'P3', views: 9100 }, { name: 'P4', views: 8400 }, { name: 'P5', views: 11500 }, { name: 'P6', views: 14200 }] }
};
type Platform = keyof typeof analyticsData;
const platforms = Object.keys(analyticsData) as Platform[];

const sentimentData = [ { name: 'Positive', value: 480, color: '#10B981' }, { name: 'Neutral', value: 320, color: '#6B7280' }, { name: 'Negative', value: 85, color: '#EF4444' }];
const bestTimeData = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => Math.random())); // Days x Hours

const kpiIcons: Record<number, React.ReactNode> = {
    0: <LayoutDashboard size={20} className="text-primary"/>,
    1: <Video size={20} className="text-primary"/>,
    2: <BarChart3 size={20} className="text-primary"/>,
    3: <Edit3 size={20} className="text-primary"/>
};

export const AnalyticsDashboard = () => {
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>(platforms[0]);
    const [pdfLibsLoaded, setPdfLibsLoaded] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Check if libraries are loaded (they are loaded via Script in RootLayout)
        if (window.jspdf && window.html2canvas) {
            setPdfLibsLoaded(true);
        } else {
            // Poll for a few seconds in case they are slow to load
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (window.jspdf && window.html2canvas) {
                    setPdfLibsLoaded(true);
                    clearInterval(interval);
                } else if (attempts > 10) { // Stop after ~5 seconds
                    console.warn("jsPDF or html2canvas not loaded after 5 seconds.");
                    clearInterval(interval);
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, []);


    const currentPlatformData = analyticsData[selectedPlatform];

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
                    <h1 className="text-4xl font-bold text-foreground font-headline">Analytics Overview</h1>
                    <p className="text-lg text-muted-foreground mt-1">Track your content performance across platforms.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as Platform)}>
                        <SelectTrigger className="w-[180px]">
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

            <div ref={reportRef} className="p-1 md:p-4 bg-background rounded-lg"> {/* Added padding for PDF export */}
                <h2 className="text-2xl font-bold text-foreground font-headline mb-6 pl-2 md:pl-0">{selectedPlatform} Performance</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {currentPlatformData.kpis.map((kpi, index) => (
                        <Card key={kpi.title} className="shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                                {kpiIcons[index] || <BarChart3 size={20} className="text-muted-foreground"/>}
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
                                <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{kpi.change} from last period</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card className="shadow-md">
                        <CardHeader><CardTitle className="font-headline">{selectedPlatform === 'LinkedIn' ? 'Connections Growth' : 'Follower Growth'}</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={currentPlatformData.followerData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis domain={['dataMin - 100', 'dataMax + 100']} stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/><Legend wrapperStyle={{fontSize: "12px"}}/><Line type="monotone" dataKey={selectedPlatform === 'LinkedIn' ? 'connections' : 'followers'} stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></CardContent>
                    </Card>
                    <Card className="shadow-md">
                        <CardHeader><CardTitle className="font-headline">{selectedPlatform === 'LinkedIn' ? 'Impressions' : 'Views (5-Day Periods)'}</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={currentPlatformData.viewsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3}/><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/><Legend wrapperStyle={{fontSize: "12px"}}/><Bar dataKey="views" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="shadow-md">
                        <CardHeader><CardTitle className="font-headline">Sentiment Analysis (Mock)</CardTitle></CardHeader>
                        <CardContent className="h-[300px] md:h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={"80%"} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => { const radius = innerRadius + (outerRadius - innerRadius) * 1.2; const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180)); const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180)); return (<text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>{`${name} (${(percent * 100).toFixed(0)}%)`}</text>);}}>
                                        {sentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2}/>)}
                                    </Pie><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/><Legend wrapperStyle={{fontSize: "12px"}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md">
                        <CardHeader><CardTitle className="font-headline">Best Times to Post (Mock Heatmap)</CardTitle></CardHeader>
                        <CardContent>
                           <div className="grid grid-cols-7 gap-1 text-center text-xs mt-2">
                               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-semibold text-muted-foreground pb-1">{day}</div>)}
                               {bestTimeData.flat().map((value, i) => <div key={i} className="h-6 md:h-8 rounded-sm border border-border/30" style={{ backgroundColor: `hsla(var(--primary-raw), ${value * 0.8 + 0.1})` }} title={`${Math.floor(i/7)}:00-${Math.floor(i/7)+1}:00 on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i%7]}`}></div>)}
                           </div>
                           <p className="text-xs text-muted-foreground text-center mt-2">Darker means higher engagement (mock data).</p>
                        </CardContent>
                    </Card>
                 </div>
            </div>
             <p className="text-sm text-muted-foreground mt-6 text-center">Note: All analytics data is currently mocked for demonstration purposes.</p>
        </div>
    );
};

    