import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/platform', label: 'Platform' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/resources', label: 'Resources' },
  { href: '/security', label: 'Security' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export const MarketingFooter = () => {
  return (
    <footer className="border-t border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-paper))]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-headline text-xl font-semibold text-[hsl(var(--mk-ink))]">Blisszits</p>
          <p className="mt-2 max-w-xl text-sm text-[hsl(var(--mk-muted))]">
            Plan, publish, reply, and track social performance from one editorial-grade workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {FOOTER_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="text-[hsl(var(--mk-muted))] hover:text-[hsl(var(--mk-ink))]">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};
