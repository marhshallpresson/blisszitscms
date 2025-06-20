
"use client";

import type { ContentItem } from '@/contexts/WorkspaceContext';
import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarDays as CalendarDaysIconLucide } from 'lucide-react'; // Renamed to avoid conflict

interface CalendarViewProps {
  contentItems: ContentItem[];
  onViewDetails: (item: ContentItem) => void;
  isLoading: boolean;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Draft': return 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300';
    case 'In Progress': return 'bg-blue-200 text-blue-800 hover:bg-blue-300';
    case 'For Review': return 'bg-purple-200 text-purple-800 hover:bg-purple-300';
    case 'Approved': return 'bg-green-200 text-green-800 hover:bg-green-300';
    case 'Published': return 'bg-teal-200 text-teal-800 hover:bg-teal-300';
    default: return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  }
};

export const CalendarView = ({ contentItems, onViewDetails, isLoading }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    contentItems.forEach(item => {
      if (item.dueDate) {
        try {
          // Attempt to parse date, ensure it's valid before using
          const dateObj = new Date(item.dueDate);
          if (isNaN(dateObj.getTime())) {
            console.warn(`Invalid due date for item "${item.title}": ${item.dueDate}`);
            return; // Skip invalid date
          }
          const dateKey = dateObj.toDateString(); // Use the valid date object
          if (!map.has(dateKey)) {
            map.set(dateKey, []);
          }
          map.get(dateKey)!.push(item);
        } catch (e) {
          console.warn(`Error processing due date for item "${item.title}": ${item.dueDate}`, e);
        }
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
  
  if (contentItems.filter(item => !!item.dueDate).length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card/50 p-10">
        <CalendarDaysIconLucide className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-xl font-semibold text-foreground">No Content with Due Dates</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add content items with due dates to see them on the calendar.
        </p>
      </div>
    );
  }


  return (
    <div className="p-1 bg-card rounded-lg shadow">
      <Calendar
        mode="single"
        selected={undefined} // No single date selection, calendar is for display
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className="w-full"
        components={{
          DayContent: ({ date, displayMonth }) => {
            if (date.getMonth() !== displayMonth.getMonth()) {
              return <div className="text-muted-foreground/50 p-1.5 text-right">{date.getDate()}</div>;
            }
            const dateKey = date.toDateString();
            const dayEvents = eventsByDate.get(dateKey) || [];
            return (
              <div className="h-full w-full p-1.5 flex flex-col items-end relative">
                <span className={`mb-1 ${new Date().toDateString() === dateKey ? 'text-primary font-bold' : ''}`}>{date.getDate()}</span>
                {dayEvents.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="w-full mt-auto">
                        <Badge
                          variant="secondary"
                          className="w-full text-xs justify-center cursor-pointer hover:bg-accent line-clamp-1"
                          aria-label={`${dayEvents.length} event(s) on ${date.toLocaleDateString()}`}
                        >
                          {dayEvents.length} post{dayEvents.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 max-h-96 z-10" side="bottom" align="center">
                      <h4 className="font-medium text-center mb-2 pb-2 border-b">
                        {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h4>
                      <ScrollArea className="max-h-72">
                        {dayEvents.map(event => (
                          <Button
                            key={event.id}
                            variant="ghost"
                            className="w-full justify-start h-auto py-2 px-2 mb-1 text-left flex flex-col items-start"
                            onClick={() => onViewDetails(event)}
                          >
                            <span className="font-semibold text-sm line-clamp-1 text-foreground">{event.title}</span>
                            <Badge variant="outline" className={`mt-1 text-xs ${getStatusColor(event.status)} border-0`}>{event.status}</Badge>
                          </Button>
                        ))}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            );
          },
        }}
        classNames={{
          day: 'h-24 md:h-28 relative focus-within:relative focus-within:z-20', 
          day_disabled: 'text-muted-foreground opacity-50 h-24 md:h-28',
          cell: 'h-24 md:h-28 text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
        }}
      />
    </div>
  );
};
