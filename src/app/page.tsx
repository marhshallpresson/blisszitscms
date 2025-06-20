
// src/app/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; 
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, userProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile) {
      if (user) {
        if (userProfile?.onboardingCompleted) {
          router.replace('/app/dashboard'); 
        } else {
          router.replace('/onboarding'); 
        }
      } else {
        router.replace('/auth?mode=signin');
      }
      setIsChecking(false);
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Initializing...</p>
    </div>
  );
}
