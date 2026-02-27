import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/platform', label: 'Platform' },
  { href: '/publishing', label: 'Publishing' },
  { href: '/engagement', label: 'Engagement' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/integrations', label: 'Integrations' },
];

export const MarketingHeader = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-headline font-bold text-foreground">
          Blisszits OS
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth?mode=signin">Log in</Link>
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href="/auth?mode=signup">Start free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
