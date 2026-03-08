"use client";

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const NAV_ITEMS = [
  { href: '/platform', label: 'Platform' },
  { href: '/publishing', label: 'Publishing' },
  { href: '/engagement', label: 'Engagement' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/customers', label: 'Customers' },
  { href: '/resources', label: 'Resources' },
];

export const MarketingHeader = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-paper))]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-headline font-bold text-[hsl(var(--mk-ink))]">
          Blisszits
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-[hsl(var(--mk-border))] bg-white p-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full text-[hsl(var(--mk-muted))] hover:bg-[hsl(var(--mk-paper))] hover:text-[hsl(var(--mk-ink))]"
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden text-[hsl(var(--mk-muted))] hover:text-[hsl(var(--mk-ink))] sm:inline-flex">
            <Link href="/auth?mode=signin">Log in</Link>
          </Button>
          <Button asChild size="sm" className="bg-[hsl(var(--mk-ink))] text-white hover:bg-[hsl(var(--mk-night-soft-border))]">
            <Link href="/auth?mode=signup">Start free</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-[hsl(var(--mk-border))] bg-white md:hidden">
                <Menu className="h-4 w-4 text-[hsl(var(--mk-ink))]" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] border-[hsl(var(--mk-border))] bg-white">
              <div className="mt-10 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <Button key={item.href} asChild variant="ghost" className="w-full justify-start text-[hsl(var(--mk-ink))]">
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                <Button asChild variant="outline" className="w-full border-[hsl(var(--mk-border))]">
                  <Link href="/auth?mode=signin">Log in</Link>
                </Button>
                <Button asChild className="w-full bg-[hsl(var(--mk-ink))] text-white">
                  <Link href="/auth?mode=signup">Start free</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
