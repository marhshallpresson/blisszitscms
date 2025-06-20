
// src/components/layout/AppSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Briefcase, BarChart3, Inbox, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "./AppLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const appNavItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/admin", label: "Workspaces", icon: Briefcase },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/inbox", label: "Inbox", icon: Inbox },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

interface AppSidebarProps {
  onNavigate?: () => void; // Optional callback for when a navigation link is clicked
}

export const AppSidebar = ({ onNavigate }: AppSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { currentWorkspace, currentWorkspaceId } = useWorkspace();

  const handleSignOut = async () => {
    await signOut();
    onNavigate?.();
    router.push("/auth");
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    onNavigate?.(); // Close mobile sheet on navigation
  };

  return (
    <aside className="w-full h-full bg-card text-card-foreground p-4 flex flex-col justify-between border-r border-border/70 shadow-md">
      <div>
        <div className="px-2 mb-8">
          <Link href="/app/dashboard" onClick={onNavigate}>
            <AppLogo iconSize={32} showName={true} />
          </Link>
        </div>
        <nav className="space-y-2">
          {appNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
            return (
              <Button
                key={item.label}
                variant={isActive ? "secondary" : "ghost"}
                onClick={() => handleNavigation(item.href)}
                className="w-full justify-start text-base py-3"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
      <div className="space-y-2">
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
