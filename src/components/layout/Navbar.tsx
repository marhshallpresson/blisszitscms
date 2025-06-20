// src/components/layout/Navbar.tsx
"use client";

import Link from 'next/link';
import { AppLogo } from './AppLogo';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  // { href: '/portfolio', label: 'Portfolio' }, // Optional: Add if needed
  // { href: '/blog', label: 'Blog' }, // Optional: Add if needed
  { href: '/contact', label: 'Contact Us' },
];

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "bg-background/95 backdrop-blur-lg shadow-md" : "bg-transparent",
      isMobileMenuOpen && "bg-background/95 backdrop-blur-lg shadow-md" // Ensure bg on mobile menu open
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
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                asChild
                className={cn(
                  "font-medium text-base px-3 py-2 lg:px-4",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <Button asChild size="lg" className="ml-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-shadow">
              <Link href="/contact">Get a Quote</Link>
            </Button>
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
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start font-medium text-lg py-3",
                 pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground/80 hover:text-primary hover:bg-primary/10"
              )}
            >
              <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>{item.label}</Link>
            </Button>
          ))}
           <Button asChild size="lg" className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Get a Quote</Link>
            </Button>
        </nav>
      </div>
    </header>
  );
};
