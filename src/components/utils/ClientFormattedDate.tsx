
"use client";

import { useState, useEffect } from 'react';

interface ClientFormattedDateProps {
  date: Date | string | undefined;
  placeholder?: string;
  options?: Intl.DateTimeFormatOptions;
}

export const ClientFormattedDate = ({ date, placeholder = "...", options }: ClientFormattedDateProps) => {
  const [formattedDate, setFormattedDate] = useState<string>(placeholder);

  useEffect(() => {
    if (date) {
      try {
        const d = new Date(date);
        if (options && options.timeStyle) {
          setFormattedDate(d.toLocaleString(undefined, options));
        } else {
          setFormattedDate(d.toLocaleDateString(undefined, options));
        }
      } catch (error) {
        console.error("Error formatting date:", error, "with options:", options);
        setFormattedDate("Invalid date");
      }
    } else {
      setFormattedDate('N/A');
    }
  }, [date, options]);

  return <>{formattedDate}</>;
};

