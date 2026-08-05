
"use client"
import { supabase } from "@/lib/supabase";
import { Announcement, announcementSchema } from './data/schema';
import { z } from 'zod';
import { AnnouncementCard } from './components/announcement-card';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CreateAnnouncementDialog } from './components/create-announcement-dialog';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    async function loadAnnouncements() {
      const { data, error } = await supabase.from('announcements').select('*');
      if (error) {
        setAnnouncements([]);
      } else if (data) {
        const formatted = data.map(item => ({ ...item, id: String(item.id) }));
        const parsed = z.array(announcementSchema).safeParse(formatted);
        if (parsed.success) {
          setAnnouncements(parsed.data);
        } else {
          const valid = formatted.map(i => announcementSchema.safeParse(i)).map(r => r.success ? r.data : null).filter(Boolean) as any as any;
          setAnnouncements(valid);
        }
      }
      setLoading(false);
    }
    loadAnnouncements();
    const channel = supabase.channel('announcements-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => loadAnnouncements())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if(loading) {
    return (
       <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
       </div>
    )
  }

  return (
    <>
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
          <p className="text-muted-foreground">
            Manage important school-wide announcements.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Announcement
        </Button>
      </div>
      
      {announcements.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((item) => (
            <AnnouncementCard key={item.id} announcement={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
            <div className="flex flex-col items-center gap-1 text-center py-20">
                <h3 className="text-2xl font-bold tracking-tight">
                No announcements found
                </h3>
                <p className="text-sm text-muted-foreground">
                Click &quot;Create Announcement&quot; to post a new one.
                </p>
            </div>
        </div>
      )}
    </div>
    <CreateAnnouncementDialog isOpen={isCreateOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
