import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Card className="w-full border-border/70">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>Complete verification from your inbox, then continue to your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full"><Link href="/auth?mode=signin">Go to sign in</Link></Button>
          <Button asChild variant="outline" className="w-full"><Link href="/app/dashboard">Open app</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
