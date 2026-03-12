// src/components/layout/AppHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react"; // Import Search icon
import { AppLogo } from "./AppLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Input } from "@/components/ui/input"; // Import Input component

interface AppHeaderProps {
  onOpenMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  isDesktopSidebarOpen: boolean;
}

export const AppHeader = ({ onOpenMobileSidebar, onToggleDesktopSidebar, isDesktopSidebarOpen }: AppHeaderProps) => {
  const { user, signOut } = useAuth();
  const { currentWorkspace } = useWorkspace();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 shadow-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {/* Mobile sidebar trigger */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileSidebar}
        aria-label="Open side menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop sidebar toggle for smaller desktop screens */}
      {!isDesktopSidebarOpen && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="hidden md:inline-flex lg:hidden" // Only show on medium screens when desktop sidebar is closed
          onClick={onToggleDesktopSidebar}
          aria-label="Open side menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* App Logo for mobile and smaller desktop when sidebar is closed */}
      {!isDesktopSidebarOpen && (
        <div className="md:hidden lg:flex lg:flex-1 lg:justify-start">
          <Link href="/app/dashboard">
            <AppLogo iconSize={24} showName={true} />
          </Link>
        </div>
      )}
       {isDesktopSidebarOpen && (
        <div className="hidden lg:flex lg:flex-1 lg:justify-start"> {/* Spacer when desktop sidebar is open */}
        </div>
      )}


      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || "https://github.com/shadcn.png"} alt={user?.displayName || "User"} />
              <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.displayName || "My Account"}</DropdownMenuLabel>
          {currentWorkspace && (
            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">{currentWorkspace.name}</DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/app/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
