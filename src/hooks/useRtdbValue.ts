
// src/hooks/useRtdbValue.ts
"use client";

import { useState, useEffect } from 'react';
import { rtdb } from '@/lib/firebaseConfig';
import { ref, onValue, off, type DataSnapshot } from 'firebase/database';

/**
 * Custom hook to listen to a value at a specific Firebase Realtime Database path.
 * @param path The path to the data in RTDB.
 * @returns The data at the specified path, `null` if the path doesn't exist or data is explicitly null,
 *          or `undefined` if RTDB is not initialized, path is invalid, an error occurs, or during initial load.
 */
export function useRtdbValue<T = any>(path: string): T | null | undefined {
  const [value, setValue] = useState<T | null | undefined>(undefined); // undefined indicates initial/loading/error state
  // You could expose error/loading states if needed by the component
  // const [error, setError] = useState<Error | null>(null);
  // const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!rtdb) {
      console.error("Realtime Database is not initialized.");
      // setError(new Error("Realtime Database is not initialized."));
      setValue(undefined); 
      // setIsLoading(false);
      return;
    }
    if (!path) {
        // setError(new Error("RTDB path is invalid."));
        setValue(undefined); 
        // setIsLoading(false);
        return;
    }

    // setIsLoading(true);
    // setError(null);
    const dbRef = ref(rtdb, path);

    const listener = onValue(dbRef, (snapshot: DataSnapshot) => {
      setValue(snapshot.val() as T | null); // .val() can be null if the path doesn't exist
      // setIsLoading(false);
    }, (err) => {
      console.error(`Error fetching RTDB value at path "${path}":`, err);
      // setError(err);
      setValue(undefined); // Indicate error state
      // setIsLoading(false);
    });

    return () => {
      // Ensure rtdb and path were valid for listener setup before trying to call off()
      if (rtdb && path) { 
        off(dbRef, 'value', listener);
      }
    };
  }, [path]); 

  return value;
}
