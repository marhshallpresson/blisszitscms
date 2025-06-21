
"use client";

import { useState, useEffect } from 'react';
import type { Timestamp } from 'firebase/firestore';

interface ClientFormattedDateProps {
  date: Date | string | number | Timestamp | undefined;
  placeholder?: string;
  options?: Intl.DateTimeFormatOptions;
}

// Helper to check if an object is a Firebase Timestamp
function isFirebaseTimestamp(obj: any): obj is Timestamp {
  return obj && typeof obj.toDate === 'function';
}


export const ClientFormattedDate = ({ date, placeholder = "...", options }: ClientFormattedDateProps) => {
  const [formattedDate, setFormattedDate] = useState<string>(placeholder);

  useEffect(() => {
    if (date) {
      try {
        let d: Date;

        if (isFirebaseTimestamp(date)) {
          d = date.toDate();
        } else if (typeof date === 'number') {
          // Handle unix timestamp in seconds
          d = new Date(date * 1000);
        } else {
          // Handle ISO string or Date object
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
  }, [date, options]); 

  return <>{formattedDate}</>;
};
