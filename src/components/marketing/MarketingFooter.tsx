import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/security', label: 'Security' },
  { href: '/resources', label: 'Resources' },
  { href: '/pricing', label: 'Pricing' },
];

export const MarketingFooter = () => {
  return (
    <footer className="border-t border-border/70 bg-card/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-headline text-lg font-semibold text-foreground">Blisszits OS</p>
          <p className="text-sm text-muted-foreground">Plan, publish, reply, and track from one social workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {FOOTER_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};
