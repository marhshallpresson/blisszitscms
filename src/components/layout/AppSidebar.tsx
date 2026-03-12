// src/components/layout/AppSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Briefcase, BarChart3, Inbox, Settings, LogOut, PanelLeftClose, Rocket, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "./AppLogo";
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
  showDesktopCloseButton?: boolean;
  onCloseSidebar?: () => void;
}

export const AppSidebar = ({ onNavigate, showDesktopCloseButton = false, onCloseSidebar }: AppSidebarProps) => {
  const pathname = usePathname();
  const activePath = pathname ?? "";
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

  const navItems = currentWorkspaceId
    ? [
        { href: `/app/workspace/${currentWorkspaceId}`, label: "Workspace Hub", icon: Rocket },
        ...appNavItems,
      ]
    : appNavItems;

  return (
    <aside className="w-full h-full bg-card text-card-foreground p-4 flex flex-col justify-between">
      <div>
        <div className="px-2 mb-8 flex items-center justify-between">
          <Link href="/app/dashboard" onClick={onNavigate}>
            <AppLogo iconSize={32} showName={true} />
          </Link>
          {showDesktopCloseButton && onCloseSidebar && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={onCloseSidebar}
              aria-label="Close side menu"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          )}
        </div>
        {currentWorkspaceId ? (
          <div className="mb-4 rounded-md p-3 text-sm bg-muted/40 text-muted-foreground border border-border/60">
            <p className="text-[10px] uppercase tracking-wide opacity-70 mb-1">Active Workspace</p>
            <p className="font-semibold text-foreground truncate">{currentWorkspace?.name || 'Workspace'}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full justify-start text-xs h-8"
              onClick={() => handleNavigation(`/app/workspace/${currentWorkspaceId}`)}
            >
              <PlusSquare className="mr-2 h-3.5 w-3.5" />
              Open Hub
            </Button>
          </div>
        ) : null}
        <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">General</h3>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              activePath === item.href ||
              (item.href !== "/app/dashboard" && activePath.startsWith(item.href));
            return (
              <Button
                key={item.label}
                variant="ghost"
                onClick={() => handleNavigation(item.href)}
                className={`w-full justify-start text-sm py-2 h-9 ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-accent/20 hover:text-foreground"}`}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
      <div className="space-y-1">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-sm py-2 h-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
