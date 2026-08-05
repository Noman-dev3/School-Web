
"use client"
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database } from 'lucide-react';

export default function SchoolDataPage() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchoolDataUrl() {
      const { data } = await supabase.from('settings').select('schoolDataUrl').limit(1).single();
      if (data && data.schoolDataUrl) {
        setUrl(data.schoolDataUrl);
      } else {
        setUrl(null);
      }
      setLoading(false);
    }

    loadSchoolDataUrl();
  }, []);

  return (
    <div className="h-screen flex-1 flex-col flex">
       <div className="flex items-center justify-between space-y-2 p-8 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">School Data Management</h2>
              <p className="text-muted-foreground">
                Embedded portal for managing students, teachers, and results.
              </p>
            </div>
        </div>

        <div className="flex-1 p-8 pt-0">
            {loading ? (
                <Skeleton className="w-full h-full rounded-lg" />
            ) : url ? (
                <iframe
                    src={url}
                    className="w-full h-full border-2 border-border rounded-lg"
                    title="School Data Management"
                />
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Database className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-2xl font-bold tracking-tight">
                            No URL Configured
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Please set the &apos;School Data App URL&apos; in the settings page to enable this view.
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
