// src/components/content/CalendarView.tsx
"use client";

// This component was part of the CMS dashboard.
// For the corporate website, it's not directly used.
// If a feature like an events calendar is added later, this could be adapted.

// import type { ContentItem } from '@/contexts/WorkspaceContext';
import { useState, useMemo } from 'react';
import { Calendar as ShadCalendar } from '@/components/ui/calendar'; // Renamed to avoid conflict
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarDays as CalendarDaysIconLucide } from 'lucide-react';

interface ContentItem { // Minimal placeholder type
  id: string;
  title: string;
  dueDate?: string;
  status?: string;
}

interface CalendarViewProps {
  // Props related to old CMS functionality
  // contentItems: ContentItem[];
  // onViewDetails: (item: ContentItem) => void;
  // isLoading: boolean;
}

export const CalendarView = ({ 
  // contentItems, 
  // onViewDetails, 
  // isLoading 
}: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const contentItems: ContentItem[] = []; // No data for corporate site
  const isLoading = false; // Not loading data

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    // Logic for mapping contentItems to dates removed as contentItems is empty
    return map;
  }, [/* contentItems */]); // Dependency removed

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Calendar...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-xl font-semibold text-foreground mb-4">Calendar View (Placeholder)</h2>
      <p className="text-muted-foreground mb-6">
        This component was for displaying a content calendar in the CMS dashboard.
        It is not used in the current corporate website layout.
      </p>
      <div className="p-1 bg-card rounded-lg shadow max-w-2xl mx-auto opacity-50 pointer-events-none">
        <ShadCalendar
          mode="single"
          selected={undefined}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="w-full"
          // DayContent logic removed as it depends on events
        />
      </div>
    </div>
  );
};
