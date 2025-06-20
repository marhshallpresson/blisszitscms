
// src/components/layout/AppSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutDashboard, Briefcase, BarChart3, Inbox, Settings, LogOut, ArrowLeftToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "./AppLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const appNavItems = [
  { href: "/app/dashboard", label: "Main Dashboard", icon: LayoutDashboard },
  { href: "/app/admin", label: "Manage Workspaces", icon: Briefcase },
  // Link to current workspace will be dynamic
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/inbox", label: "Inbox", icon: Inbox },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { currentWorkspaceId, currentWorkspace } = useWorkspace();

  const handleSignOut = async () => {
    await signOut();
    router.push("/"); // Redirect to corporate homepage on sign out
  };

  return (
    <aside className="w-64 bg-card text-card-foreground p-4 flex flex-col justify-between border-r border-border/70 shadow-md">
      <div>
        <div className="px-2 mb-8">
          <Link href="/app/dashboard">
            <AppLogo iconSize={32} showName={true} />
          </Link>
        </div>
        <nav className="space-y-2">
          {appNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/app/dashboard" && pathname === "/app") || (item.href.includes('/app/workspace') && pathname.startsWith('/app/workspace'));
            return (
              <Button
                key={item.label}
                variant={isActive ? "secondary" : "ghost"}
                asChild
                className="w-full justify-start text-base py-3"
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
          {currentWorkspaceId && currentWorkspace && (
             <Button
                variant={pathname.startsWith(`/app/workspace/${currentWorkspaceId}`) ? "secondary" : "ghost"}
                asChild
                className="w-full justify-start text-base py-3 bg-primary/10 text-primary hover:bg-primary/20"
              >
                <Link href={`/app/workspace/${currentWorkspaceId}`}>
                  <Home className="mr-3 h-5 w-5" />
                  {currentWorkspace.name || "Current Workspace"}
                </Link>
              </Button>
          )}
        </nav>
      </div>
      <div className="space-y-2 mt-auto pt-4 border-t border-border/60">
         <Button
            variant="ghost"
            asChild
            className="w-full justify-start text-base py-3 text-muted-foreground hover:text-primary"
          >
            <Link href="/">
              <ArrowLeftToLine className="mr-3 h-5 w-5" />
              Back to Website
            </Link>
        </Button>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-base py-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
