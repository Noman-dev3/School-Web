'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App level error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold font-headline text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        An issue occurred while loading this section. You can try refreshing the page or attempting to reload.
      </p>
      <div className="flex items-center gap-4">
        <Button
          onClick={() => reset()}
          className="rounded-full gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="rounded-full"
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
}
