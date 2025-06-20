// src/components/layout/Navbar.tsx
"use client";

import Link from 'next/link';
import { AppLogo } from './AppLogo';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, LayoutDashboard, Settings } from 'lucide-react'; // Added Settings icon
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const publicNavItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact Us' },
];

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut, isLoadingAuth } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); 
    setIsMobileMenuOpen(false);
  };

  const renderNavLinks = (isMobile: boolean) => {
    const commonClass = cn(
      "font-medium text-base px-3 py-2 lg:px-4",
      isMobile && "w-full justify-start text-lg py-3"
    );

    return publicNavItems.map((item) => (
      <Button
        key={item.label}
        variant="ghost"
        asChild
        className={cn(
          commonClass,
          pathname === item.href
            ? "text-primary bg-primary/10"
            : "text-foreground/70 hover:text-primary hover:bg-primary/5"
        )}
      >
        <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>{item.label}</Link>
      </Button>
    ));
  };


  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "bg-background/95 backdrop-blur-lg shadow-md" : "bg-background/80 md:bg-transparent",
      isMobileMenuOpen && "bg-background/95 backdrop-blur-lg shadow-md"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" passHref legacyBehavior>
            <a className="flex items-center" aria-label="Blisszits - Back to homepage">
              <AppLogo iconSize={36} showName={true} />
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {renderNavLinks(false)}
            {isLoadingAuth ? (
              <Button size="lg" className="ml-4" disabled>Loading...</Button>
            ) : user ? (
              <>
                <Button variant="ghost" asChild className={cn("font-medium text-base px-3 py-2 lg:px-4", pathname === '/dashboard' ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-primary hover:bg-primary/5")}>
                  <Link href="/dashboard"><LayoutDashboard size={18} className="mr-1.5"/>Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild className={cn("font-medium text-base px-3 py-2 lg:px-4", pathname === '/settings' ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-primary hover:bg-primary/5")}>
                  <Link href="/settings"><Settings size={18} className="mr-1.5"/>Settings</Link>
                </Button>
                <Button onClick={handleSignOut} variant="outline" size="default" className="ml-2 border-primary text-primary hover:bg-primary/5 hover:text-primary">
                  <LogOut size={18} className="mr-1.5"/> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild size="default" className="ml-4 text-foreground/80 hover:text-primary">
                  <Link href="/auth?mode=signin">Sign In</Link>
                </Button>
                <Button asChild size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-shadow">
                  <Link href="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className="text-foreground hover:text-primary"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-background shadow-lg border-t border-border transition-all duration-300 ease-in-out overflow-y-auto",
          isMobileMenuOpen ? "max-h-[calc(100vh-5rem)] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        )}
      >
        <nav className="flex flex-col space-y-2 px-4">
          {renderNavLinks(true)}
          <div className="pt-2 border-t border-border mt-2">
            {isLoadingAuth ? (
               <Button className="w-full justify-start text-lg py-3" disabled>Loading...</Button>
            ) : user ? (
              <>
                <Button variant="ghost" asChild className={cn("w-full justify-start font-medium text-lg py-3", pathname === '/dashboard' ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-primary hover:bg-primary/10")}>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}><LayoutDashboard className="mr-2"/>Dashboard</Link>
                </Button>
                 <Button variant="ghost" asChild className={cn("w-full justify-start font-medium text-lg py-3", pathname === '/settings' ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-primary hover:bg-primary/10")}>
                  <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}><Settings className="mr-2"/>Settings</Link>
                </Button>
                <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-lg py-3 text-red-600 hover:bg-red-500/10 hover:text-red-700">
                  <LogOut size={20} className="mr-2"/> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="w-full justify-start text-lg py-3 text-foreground/80 hover:text-primary hover:bg-primary/10">
                  <Link href="/auth?mode=signin" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button asChild size="lg" className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
