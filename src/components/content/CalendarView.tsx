// src/components/content/CalendarView.tsx
"use client";

import type { ContentItem } from '@/contexts/WorkspaceContext';
import { useState, useMemo } from 'react';
import { Calendar as ShadCalendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarDays, Eye } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface CalendarViewProps {
  contentItems: ContentItem[];
  onViewDetails: (item: ContentItem) => void;
  isLoading: boolean;
}

export const CalendarView = ({ contentItems, onViewDetails, isLoading }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    contentItems.forEach(item => {
      if (item.dueDate) {
        const date = new Date(item.dueDate);
        // Adjust for timezone offset to prevent day-off errors
        const utcDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
        const dateKey = format(utcDate, 'yyyy-MM-dd');
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(item);
      }
    });
    return map;
  }, [contentItems]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Calendar...</p>
      </div>
    );
  }

  const DayWithEvents = ({ date, displayMonth }: { date: Date, displayMonth: Date }) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate.get(dateKey) || [];

    if (dayEvents.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          {format(date, 'd')}
        </div>
      );
    }
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative w-full h-full flex items-center justify-center rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary">
            {format(date, 'd')}
            <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-primary" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-center text-sm">{format(date, 'MMMM d, yyyy')}</h4>
            <ul className="space-y-1">
              {dayEvents.map(item => (
                <li key={item.id} className="text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-auto p-1"
                    onClick={() => onViewDetails(item)}
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    <span className="truncate">{item.title}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </PopoverContent>
      </Popover>
    );
  };
  
  return (
    <Card className="shadow-lg border-border/80">
      <CardContent className="p-2 md:p-4">
        {contentItems.length === 0 && !isLoading ? (
          <div className="text-center py-20 border-2 border-dashed border-border/70 rounded-xl bg-card/50">
            <CalendarDays size={56} className="mx-auto text-muted-foreground opacity-70" />
            <h3 className="mt-6 text-2xl font-semibold font-headline text-card-foreground">Calendar is Empty</h3>
            <p className="mt-2 text-muted-foreground font-body">Add content with due dates to see them here.</p>
          </div>
        ) : (
          <ShadCalendar
            mode="single"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full"
            components={{
              Day: DayWithEvents
            }}
            modifiers={{
              hasEvent: (date) => eventsByDate.has(format(date, 'yyyy-MM-dd'))
            }}
            modifiersClassNames={{
              hasEvent: 'font-bold text-primary',
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
