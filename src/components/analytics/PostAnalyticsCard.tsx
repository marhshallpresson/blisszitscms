import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface PostAnalyticsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName: string;
}

export function PostAnalyticsCard({ label, value, icon: Icon, iconClassName }: PostAnalyticsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="mt-1 text-2xl font-bold">{value}</h3>
        </div>
        <Icon className={`h-8 w-8 opacity-80 ${iconClassName}`} />
      </CardContent>
    </Card>
  );
}
