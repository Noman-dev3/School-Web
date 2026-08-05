
"use client"
import { supabase } from "@/lib/supabase";
import { Event, eventSchema } from './data/schema';
import { z } from 'zod';
import { EventCard } from './components/event-card';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CreateEventDialog } from './components/create-event-dialog';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      const { data, error } = await supabase.from('events').select('*');
      if (error) {
        setEvents([]);
      } else if (data) {
        const formatted = data.map(item => ({ ...item, id: String(item.id) }));
        const parsed = z.array(eventSchema).safeParse(formatted);
        if (parsed.success) {
          setEvents(parsed.data);
        } else {
          const valid = formatted.map(i => eventSchema.safeParse(i)).map(r => r.success ? r.data : null).filter(Boolean) as any as any;
          setEvents(valid);
        }
      }
      setLoading(false);
    }
    loadEvents();
    const channel = supabase.channel('events-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => loadEvents())
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
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
       </div>
    )
  }

  return (
    <>
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">
            Manage upcoming and past school events.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>
      
      {events.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
            <div className="flex flex-col items-center gap-1 text-center py-20">
                <h3 className="text-2xl font-bold tracking-tight">
                No events found
                </h3>
                <p className="text-sm text-muted-foreground">
                Click &quot;Create Event&quot; to add a new event.
                </p>
            </div>
        </div>
      )}
    </div>
    <CreateEventDialog isOpen={isCreateOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
