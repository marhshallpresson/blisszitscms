import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingConnectAccountsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect accounts</CardTitle>
          <CardDescription>Connect Meta and LinkedIn first for MVP publishing and analytics.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild><Link href="/app/settings">Open social account settings</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
