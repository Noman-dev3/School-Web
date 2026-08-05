import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 rounded-full bg-primary/10 text-primary mb-6">
        <GraduationCap className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold font-headline text-foreground mb-2">404</h1>
      <h2 className="text-xl font-semibold text-foreground mb-4">Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <div className="flex items-center gap-4">
        <Button asChild className="rounded-full gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
