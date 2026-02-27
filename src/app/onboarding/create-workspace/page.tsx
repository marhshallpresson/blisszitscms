import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingCreateWorkspacePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create workspace</CardTitle>
          <CardDescription>Set your primary brand or client workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild><Link href="/onboarding">Continue in onboarding flow</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
