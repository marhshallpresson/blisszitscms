export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  featured?: boolean;
  limits: string[];
}

export interface PricingAddOn {
  id: string;
  name: string;
  description: string;
  unitPriceUsd: number;
  minQty: number;
  defaultQty: number;
  maxQty: number;
  unitLabel: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'For solo testing and light scheduling.',
    limits: ['1 workspace', '2 social accounts', 'Limited scheduling', 'Starter AI credits'],
  },
  {
    name: 'Starter',
    price: '$15-$29/mo',
    description: 'For creators and small teams publishing consistently.',
    featured: true,
    limits: ['1 workspace', '5 social accounts', 'Scheduling + publishing', 'Basic analytics'],
  },
  {
    name: 'Pro Team',
    price: '$49-$99/mo',
    description: 'For teams needing approvals and inbox collaboration.',
    limits: ['Approvals + inbox', '3-10 seats', 'Expanded AI credits', 'Priority support'],
  },
  {
    name: 'Agency',
    price: '$149-$299/mo',
    description: 'For multi-brand operations and client workflows.',
    limits: ['Multi-workspace', 'Client approvals', 'White-label reports', 'Advanced exports'],
  },
];

export const PRICING_ADDONS: PricingAddOn[] = [
  {
    id: 'extra_accounts',
    name: 'Extra Social Accounts',
    description: 'Scale channel count without forcing a full plan jump.',
    unitPriceUsd: 4,
    minQty: 1,
    defaultQty: 2,
    maxQty: 50,
    unitLabel: 'account',
  },
  {
    id: 'ai_credits',
    name: 'AI Credit Packs',
    description: 'Add more generation capacity for plans, scripts, and captions.',
    unitPriceUsd: 8,
    minQty: 1,
    defaultQty: 1,
    maxQty: 20,
    unitLabel: 'pack',
  },
  {
    id: 'white_label',
    name: 'White-label Portal',
    description: 'Branded client experience with custom presentation settings.',
    unitPriceUsd: 39,
    minQty: 0,
    defaultQty: 0,
    maxQty: 1,
    unitLabel: 'workspace',
  },
  {
    id: 'report_templates',
    name: 'Advanced Report Templates',
    description: 'Template packs for recurring client exports and handoffs.',
    unitPriceUsd: 15,
    minQty: 0,
    defaultQty: 0,
    maxQty: 5,
    unitLabel: 'template set',
  },
];
