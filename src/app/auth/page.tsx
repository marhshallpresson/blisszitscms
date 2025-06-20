// src/app/auth/page.tsx
"use client";

import { AuthScreen } from "@/components/auth/AuthScreen";
import { Suspense } from "react";

// Helper component to use useSearchParams
function AuthPageContent() {
  return <AuthScreen />;
}

export default function AuthPage() {
  return (
    // Suspense is necessary because AuthScreen uses useSearchParams
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <AuthPageContent />
    </Suspense>
  );
}
