
"use client"
import { supabase } from "@/lib/supabase";
import { Topper, topperSchema } from './data/schema';
import { z } from 'zod';
import { TopperCard } from './components/topper-card';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CreateTopperDialog } from './components/create-topper-dialog';

export default function ToppersPage() {
  const [toppers, setToppers] = useState<Topper[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    async function loadToppers() {
      const { data, error } = await supabase.from('toppers').select('*');
      if (error) {
        console.error("Error fetching toppers:", error);
        setToppers([]);
      } else if (data) {
        const itemsArray = data.map(item => ({ ...item, id: String(item.id) }));
        const parsedItems = z.array(topperSchema).safeParse(itemsArray);
        if (parsedItems.success) {
          setToppers(parsedItems.data);
        } else {
          const validItems = itemsArray
            .map(item => topperSchema.safeParse(item))
            .map(r => r.success ? r.data : null).filter(Boolean) as any as any;
          setToppers(validItems);
        }
      }
      setLoading(false);
    }

    loadToppers();

    const channel = supabase.channel('toppers-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'toppers' }, () => loadToppers())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if(loading) {
    return (
       <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
       </div>
    )
  }

  return (
    <>
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Toppers Management</h2>
          <p className="text-muted-foreground">
            Manage the list of your school&apos;s top performing students.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Topper
        </Button>
      </div>
      
      {toppers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {toppers.map((item) => (
            <TopperCard key={item.id} topper={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
            <div className="flex flex-col items-center gap-1 text-center py-20">
                <h3 className="text-2xl font-bold tracking-tight">
                No toppers found
                </h3>
                <p className="text-sm text-muted-foreground">
                Click &quot;Add Topper&quot; to feature a student.
                </p>
            </div>
        </div>
      )}
    </div>
    <CreateTopperDialog isOpen={isCreateOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
