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
    <Card className="border-border/70">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Add-ons</CardTitle>
            <CardDescription>Estimate usage-based expansion costs by account, AI, and reporting needs.</CardDescription>
          </div>
          <Badge variant="secondary">Est. +${total}/mo</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {addons.map((addon) => {
          const qty = quantities[addon.id] ?? addon.defaultQty;
          const rowTotal = qty * addon.unitPriceUsd;
          return (
            <div key={addon.id} className="rounded-md border border-border/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{addon.name}</p>
                  <p className="text-xs text-muted-foreground">{addon.description}</p>
                </div>
                <p className="text-sm text-muted-foreground">
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
                  className="w-24"
                />
                <p className="text-sm text-muted-foreground">Subtotal: ${rowTotal}/mo</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
