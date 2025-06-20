
"use client";

import { useState, useEffect } from 'react';

interface ClientFormattedDateProps {
  date: Date | string | number | undefined; // Added number for Timestamp seconds
  placeholder?: string;
  options?: Intl.DateTimeFormatOptions;
}

export const ClientFormattedDate = ({ date, placeholder = "...", options }: ClientFormattedDateProps) => {
  const [formattedDate, setFormattedDate] = useState<string>(placeholder);

  useEffect(() => {
    if (date) {
      try {
        let d: Date;
        if (typeof date === 'number') { // Handle Firebase Timestamp seconds
          d = new Date(date * 1000);
        } else {
          d = new Date(date);
        }

        if (isNaN(d.getTime())) {
          setFormattedDate("Invalid date");
          return;
        }
        
        // Check if options specify time components
        const hasTimeOptions = options && (options.timeStyle || options.hour || options.minute || options.second);

        if (hasTimeOptions) {
          setFormattedDate(d.toLocaleString(undefined, options));
        } else {
          setFormattedDate(d.toLocaleDateString(undefined, options));
        }
      } catch (error) {
        console.error("Error formatting date:", date, "with options:", options, error);
        setFormattedDate("Invalid date");
      }
    } else {
      setFormattedDate('N/A');
    }
  }, [date, options]); // Re-run if options object identity changes

  return <>{formattedDate}</>;
};
