import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Top Notice Bar Skeleton */}
      <div className="bg-primary/20 py-2.5 px-4 flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <Skeleton className="h-4 w-72 bg-primary/30 rounded-full" />
          <Skeleton className="h-4 w-28 bg-primary/30 rounded-full hidden sm:block" />
        </div>
      </div>

      {/* Header Skeleton */}
      <header className="w-full border-b border-border/30 py-3.5 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full bg-muted/80" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24 rounded bg-muted/80" />
            <Skeleton className="h-3 w-32 rounded bg-muted/60" />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      {/* Main Skeleton */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 space-y-16">
        {/* Hero Section Skeleton */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-6 w-44 rounded-full" />
            </div>
            <Skeleton className="h-14 sm:h-16 w-full max-w-xl rounded-2xl" />
            <Skeleton className="h-6 w-3/4 rounded-xl" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Skeleton className="h-5 w-full rounded-lg" />
              <Skeleton className="h-5 w-full rounded-lg" />
              <Skeleton className="h-5 w-full rounded-lg" />
              <Skeleton className="h-5 w-full rounded-lg" />
            </div>
            <div className="flex items-center gap-4 pt-4">
              <Skeleton className="h-12 w-44 rounded-full" />
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-80 sm:h-96 w-full rounded-3xl" />
          </div>
        </div>

        {/* Stats Strip Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl border border-border/60">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="space-y-1.5 w-full">
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-sm" />
              </div>
            </div>
          ))}
        </div>

        {/* Portal Grid Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
