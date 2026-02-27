import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingImportContentPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import content (optional)</CardTitle>
          <CardDescription>Bring existing drafts and ideas into Blisszits to accelerate setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild><Link href="/app/admin">Open workspace and import</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
