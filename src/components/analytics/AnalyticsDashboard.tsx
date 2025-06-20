// src/components/analytics/AnalyticsDashboard.tsx
"use client";

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, BarChart3, Loader2, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useToast } from '@/hooks/use-toast';

export const AnalyticsDashboard = () => {
    const [selectedPlatform, setSelectedPlatform] = useState<string>("Overall Performance");
    const platforms = ["Overall Performance", "Instagram", "TikTok", "LinkedIn"];
    const [pdfLibsLoaded, setPdfLibsLoaded] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // NOTE: All mock data has been removed.
    // The component will now display an empty state until real data integration.
    const [kpis, setKpis] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // TODO: This is where you would fetch real analytics data from your backend
        // or a third-party API based on the `selectedPlatform`.
        // Example:
        //
        // const fetchData = async () => {
        //   try {
        //     const response = await fetch(`/api/analytics?platform=${selectedPlatform}`);
        //     const data = await response.json();
        //     setKpis(data.kpis);
        //     setChartData(data.chartData);
        //   } catch (error) {
        //     toast({ title: "Error", description: "Could not fetch analytics data.", variant: "destructive" });
        //   }
        // };
        // fetchData();

        // For now, we keep the data empty to reflect the lack of integration.
        setKpis([]);
        setChartData([]);
    }, [selectedPlatform, toast]);

    useEffect(() => {
        if (window.jspdf && window.html2canvas) {
            setPdfLibsLoaded(true);
        }
    }, []);

    const exportToPdf = async () => {
        if (!pdfLibsLoaded || !reportRef.current) {
            toast({ title: "PDF Export Not Ready", description: "The required PDF library is not loaded yet.", variant: "destructive" });
            return;
        }
        setIsExporting(true);
        try {
            const { jsPDF } = window.jspdf;
            const html2canvasInstance = window.html2canvas;
            
            const canvas = await html2canvasInstance(reportRef.current, { scale: 2, backgroundColor: '#f9fafb' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgHeight = pdfWidth / ratio;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight > pdfHeight ? pdfHeight : imgHeight);
            
            pdf.save(`Blisszits-Analytics-${selectedPlatform.replace(/\s/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`);
            toast({ title: "PDF Exported", description: "Analytics report downloaded." });
        } catch (error) {
            console.error("PDF Export Error:", error);
            toast({ title: "PDF Export Failed", description: "Could not generate PDF.", variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };
    
    const EmptyState = () => (
      <div className="text-center py-20 border-2 border-dashed border-border/70 rounded-xl bg-card/50">
        <BarChart3 size={56} className="mx-auto text-muted-foreground opacity-70" />
        <h3 className="mt-6 text-2xl font-semibold font-headline text-card-foreground">No Analytics Data</h3>
        <p className="mt-2 text-muted-foreground font-body max-w-md mx-auto">
          To see your analytics, connect your social media accounts in your profile settings. This feature is coming soon!
        </p>
        <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
          <LinkIcon size={18} className="mr-2" /> Connect Accounts (Coming Soon)
        </Button>
      </div>
    );

    return (
        <div className="container mx-auto px-0 py-0 space-y-8">
            <Card className="bg-card shadow-lg border-border/80">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                             <BarChart3 className="w-10 h-10 text-primary flex-shrink-0" />
                             <div>
                                <CardTitle className="text-3xl font-bold text-foreground font-headline">Brand Analytics</CardTitle>
                                <CardDescription className="text-base text-muted-foreground mt-1">Track your content performance across all platforms.</CardDescription>
                             </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as string)}>
                                <SelectTrigger className="w-full md:w-[180px] bg-background focus:ring-primary">
                                    <SelectValue placeholder="Select Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button onClick={exportToPdf} disabled={!pdfLibsLoaded || isExporting} className="font-semibold shadow-md hover:shadow-lg w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download size={16} className="mr-2" />}
                                {isExporting ? 'Exporting...' : 'Export PDF'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div ref={reportRef} className="p-1 md:p-4 bg-card rounded-lg shadow-lg border border-border/70">
                <h2 className="text-2xl font-bold text-foreground font-headline mb-6 pl-2 md:pl-0">{selectedPlatform} Metrics</h2>
                 {chartData.length === 0 ? (
                    <EmptyState />
                 ) : (
                   <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* NOTE: This section will be populated by the `kpis` state variable when data is available. */}
                        {kpis.map((kpi: any) => (
                            <Card key={kpi.title} className="shadow-md border-border/70">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                                    {/* Icon can be dynamic based on kpi.icon */}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
                                    <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{kpi.change} from last period</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="shadow-md border-border/70">
                            <CardHeader><CardTitle className="font-headline text-xl">Follower Growth</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    {/* NOTE: This chart will be populated by the `chartData` state variable. */}
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="followers" stroke="hsl(var(--primary))" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                         {/* Add other charts as needed */}
                    </div>
                  </>
                )}
            </div>
        </div>
    );
};
