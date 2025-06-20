
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
        setFormattedDate(new Date(date).toLocaleDateString(undefined, options));
      } catch (error) {
        console.error("Error formatting date:", error);
        setFormattedDate("Invalid date");
      }
    } else {
      setFormattedDate('N/A');
    }
  }, [date, options]);

  return <>{formattedDate}</>;
};
