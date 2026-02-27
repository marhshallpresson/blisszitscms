
// src/components/rtdb/RealtimeGreeting.tsx
"use client";

import { useRtdbValue } from '@/hooks/useRtdbValue';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

interface GreetingData {
  message?: string;
  author?: string;
}

export const RealtimeGreeting = () => {
  // Fetches data from path: /app-config/greeting
  // The hook returns `undefined` initially, then the data (object or null if path empty/not found).
  const greetingData = useRtdbValue<GreetingData | null>('app-config/greeting');

  // Case 1: Still loading or RTDB initialization error (greetingData is undefined)
  if (greetingData === undefined) {
    return (
      <div className="mt-6 p-4 border rounded-lg shadow-sm bg-card animate-pulse">
        <h3 className="text-lg font-semibold font-headline text-primary">A Realtime Message For You:</h3>
        <Skeleton className="h-6 w-3/4 mt-2 bg-muted/50" />
        <Skeleton className="h-4 w-1/4 mt-1 bg-muted/50" />
      </div>
    );
  }

  // Case 2: Path does not exist in DB or is explicitly set to null
  if (greetingData === null) {
    return (
      <div className="mt-6 p-4 border border-dashed rounded-lg bg-card/50 text-center">
         <h3 className="text-lg font-semibold font-headline text-primary mb-2">A Realtime Message For You:</h3>
        <p className="text-sm text-muted-foreground font-body">
          To display a greeting, set data at path <code className="bg-muted p-1 rounded text-xs">/app-config/greeting</code>
          <br />
          (e.g., <code className="bg-muted p-1 rounded text-xs">{`{ "message": "Hello from RTDB!", "author": "Admin" }`}</code>)
          <br />
          in your Firebase Realtime Database.
        </p>
      </div>
    );
  }
  
  // Case 3: Data is an object (could be empty {} or have content)
  const { message, author } = greetingData;

  // Case 3a: Path exists, data object is present, but 'message' field is missing or empty.
  // This also covers greetingData being an empty object {}.
  if (!message) { 
     return (
      <div className="mt-6 p-4 border rounded-lg shadow-sm bg-card">
        <h3 className="text-lg font-semibold font-headline text-primary">A Realtime Message For You:</h3>
        <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2 font-body">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span>Greeting data at <code className="bg-muted p-1 rounded text-xs">/app-config/greeting</code> is missing a 'message' field or is empty.</span>
        </div>
      </div>
    );
  }
  
  // Case 3b: 'message' exists, render it.
  return (
    <div className="mt-6 p-4 border rounded-lg shadow-sm bg-card">
      <h3 className="text-lg font-semibold font-headline text-primary">A Realtime Message For You:</h3>
      <p className="mt-2 text-card-foreground font-body text-xl">"{message}"</p>
      {author && ( // Only show author if 'author' field exists and is not empty
         <p className="mt-1 text-xs text-muted-foreground font-body">- {author}</p>
      )}
    </div>
  );
};
