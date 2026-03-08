"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type PricingAddOn } from '@/lib/pricing-content';

interface AddOnSelectorProps {
  addons: PricingAddOn[];
}

export function AddOnSelector({ addons }: AddOnSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () =>
      addons.reduce<Record<string, number>>((acc, addon) => {
        acc[addon.id] = addon.defaultQty;
        return acc;
      }, {})
  );

  const total = useMemo(
    () =>
      addons.reduce((sum, addon) => {
        const qty = quantities[addon.id] ?? addon.defaultQty;
        return sum + qty * addon.unitPriceUsd;
      }, 0),
    [addons, quantities]
  );

  return (
    <Card className="border-[hsl(var(--mk-border))] bg-white">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-[hsl(var(--mk-ink))]">Add-ons</CardTitle>
            <CardDescription className="text-[hsl(var(--mk-muted))]">
              Estimate usage-based expansion costs by account, AI, and reporting needs.
            </CardDescription>
          </div>
          <Badge className="border-[hsl(var(--mk-mint-soft-border))] bg-[hsl(var(--mk-mint-soft))] text-[hsl(var(--mk-ink))]">
            Est. +${total}/mo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {addons.map((addon) => {
          const qty = quantities[addon.id] ?? addon.defaultQty;
          const rowTotal = qty * addon.unitPriceUsd;
          return (
            <div key={addon.id} className="rounded-md border border-[hsl(var(--mk-border))] bg-[hsl(var(--mk-paper))] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-[hsl(var(--mk-ink))]">{addon.name}</p>
                  <p className="text-xs text-[hsl(var(--mk-muted))]">{addon.description}</p>
                </div>
                <p className="text-sm text-[hsl(var(--mk-muted))]">
                  ${addon.unitPriceUsd}/{addon.unitLabel}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Input
                  type="number"
                  min={addon.minQty}
                  max={addon.maxQty}
                  value={qty}
                  onChange={(event) => {
                    const raw = Number(event.target.value);
                    const next = Number.isNaN(raw) ? addon.minQty : Math.max(addon.minQty, Math.min(addon.maxQty, raw));
                    setQuantities((prev) => ({ ...prev, [addon.id]: next }));
                  }}
                  className="w-24 border-[hsl(var(--mk-border))] bg-white"
                />
                <p className="text-sm text-[hsl(var(--mk-muted))]">Subtotal: ${rowTotal}/mo</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
