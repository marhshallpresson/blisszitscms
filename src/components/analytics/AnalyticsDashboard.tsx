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
import { Download, BarChart3, Loader2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export const AnalyticsDashboard = () => {
    const [selectedPlatform, setSelectedPlatform] = useState<string>("Overall Performance");
    const platforms = ["Overall Performance", "Instagram", "TikTok", "LinkedIn"];
    const [pdfLibsLoaded, setPdfLibsLoaded] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
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
        <h3 className="mt-6 text-2xl font-semibold font-headline text-card-foreground">Connect Your Accounts</h3>
        <p className="mt-2 text-muted-foreground font-body max-w-md mx-auto">
          To see your analytics, you need to connect your social media accounts in your profile settings.
        </p>
        <Button asChild className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/app/settings">
            <LinkIcon size={18} className="mr-2" /> Connect Accounts
          </Link>
        </Button>
      </div>
    );

    return (
        <div className="space-y-8">
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
                   <div className="text-center py-10 text-muted-foreground">Detailed metrics view loading...</div>
                )}
            </div>
        </div>
    );
};
