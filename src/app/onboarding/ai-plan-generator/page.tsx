import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingAiPlanGeneratorPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI plan generator</CardTitle>
          <CardDescription>Generate your first 30-day plan to seed content and workflows.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild><Link href="/onboarding">Run onboarding generator</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
