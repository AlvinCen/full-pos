'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl text-red-500">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            You do not have the necessary permissions to view this page.
          </p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}