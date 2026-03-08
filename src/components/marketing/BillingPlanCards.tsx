import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type PricingPlan } from '@/lib/pricing-content';

interface BillingPlanCardsProps {
  plans: PricingPlan[];
}

export function BillingPlanCards({ plans }: BillingPlanCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`border-[hsl(var(--mk-border))] bg-white ${plan.featured ? 'ring-2 ring-[hsl(var(--mk-mint-strong))]/40' : ''}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-[hsl(var(--mk-ink))]">{plan.name}</CardTitle>
              {plan.featured ? (
                <Badge className="border-[hsl(var(--mk-mint-soft-border))] bg-[hsl(var(--mk-mint-soft))] text-[hsl(var(--mk-ink))]">Popular</Badge>
              ) : null}
            </div>
            <CardDescription className="text-lg font-semibold text-[hsl(var(--mk-ink))]">{plan.price}</CardDescription>
            <CardDescription className="text-[hsl(var(--mk-muted))]">{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[hsl(var(--mk-muted))]">
              {plan.limits.map((limit) => (
                <li key={limit}>- {limit}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
