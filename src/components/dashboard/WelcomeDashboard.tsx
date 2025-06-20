// src/components/dashboard/WelcomeDashboard.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Settings, LayoutDashboard as ManageWorkspacesIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Props related to old CMS functionality are removed as this is a simpler welcome.
interface WelcomeDashboardProps {
  // No complex props needed for a simple welcome screen for now
  // If this dashboard evolves, props can be added back.
  isOnboardingCompleted: boolean; // Kept for context
}

export const WelcomeDashboard = ({ isOnboardingCompleted }: WelcomeDashboardProps) => {
  const { userProfile } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-10">
      <Card className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground p-6 md:p-8 rounded-xl shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-10 h-10 md:w-12 md:h-12" />
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold font-headline">
                Welcome, {userProfile?.displayName || "Creator"}!
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 text-base md:text-lg mt-1">
                You're all set up. What would you like to do next?
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {/* Removed AI Recommendation Card as it's not part of this simplified dashboard focus */}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-border/70">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Settings size={22} className="text-primary"/> Account Settings
            </CardTitle>
            <CardDescription>
              Update your profile information, password, and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full md:w-auto bg-secondary hover:bg-secondary/80 text-secondary-foreground">
              <Link href="/settings">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow border-border/70">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <ManageWorkspacesIcon size={22} className="text-primary"/> Manage Workspaces
            </CardTitle>
            <CardDescription>
              Oversee your projects and content areas. (Future Feature Area)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full md:w-auto bg-secondary hover:bg-secondary/80 text-secondary-foreground">
              <Link href="/admin">Access Workspaces</Link>
            </Button>
             <p className="text-xs text-muted-foreground mt-3">
              Currently, workspace management offers basic overview. Full content tools within workspaces are planned.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Placeholder for future dashboard widgets or quick actions */}
       <div className="mt-12 text-center">
        <p className="text-muted-foreground">More features coming soon to your dashboard!</p>
      </div>

    </div>
  );
};
