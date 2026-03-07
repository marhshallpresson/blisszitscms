import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface BestTimeSlot {
  day: string;
  window: string;
  score: number;
}

interface BestTimeWidgetProps {
  platformLabel?: string;
  slots?: BestTimeSlot[];
}

const DEFAULT_SLOTS: BestTimeSlot[] = [
  { day: 'Mon', window: '9:00-11:00', score: 82 },
  { day: 'Tue', window: '10:00-12:00', score: 88 },
  { day: 'Wed', window: '11:00-13:00', score: 91 },
  { day: 'Thu', window: '12:00-14:00', score: 79 },
  { day: 'Fri', window: '8:00-10:00', score: 74 },
];

export function BestTimeWidget({ platformLabel = 'Overall', slots = DEFAULT_SLOTS }: BestTimeWidgetProps) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">Best Time to Post</CardTitle>
        <CardDescription>
          Rules-based recommendation windows for {platformLabel}. Upgrade to model-based optimization in Phase 2.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {slots.map((slot) => (
          <div key={`${slot.day}-${slot.window}`} className="grid grid-cols-[56px_1fr_72px] items-center gap-3 text-sm">
            <span className="font-medium">{slot.day}</span>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${slot.score}%` }} />
            </div>
            <span className="text-muted-foreground">{slot.window}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
