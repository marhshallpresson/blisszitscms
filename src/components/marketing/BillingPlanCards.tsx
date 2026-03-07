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
        <Card key={plan.name} className={`border-border/70 ${plan.featured ? 'ring-2 ring-primary/40' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{plan.name}</CardTitle>
              {plan.featured ? <Badge>Popular</Badge> : null}
            </div>
            <CardDescription className="text-lg font-semibold text-foreground">{plan.price}</CardDescription>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
