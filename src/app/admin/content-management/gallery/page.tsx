
"use client"
import { supabase } from "@/lib/supabase";
import { GalleryItem, galleryItemSchema } from './data/schema';
import { z } from 'zod';
import { GalleryCard } from './components/gallery-card';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CreateGalleryItemDialog } from './components/create-gallery-item-dialog';

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    async function loadGallery() {
      const { data, error } = await supabase.from('gallery').select('*');
      if (error) {
        setGalleryItems([]);
      } else if (data) {
        const formatted = data.map(item => ({ ...item, id: String(item.id) }));
        const parsed = z.array(galleryItemSchema).safeParse(formatted);
        if (parsed.success) {
          setGalleryItems(parsed.data);
        } else {
          const valid = formatted.map(i => galleryItemSchema.safeParse(i)).map(r => r.success ? r.data : null).filter(Boolean) as any as any;
          setGalleryItems(valid);
        }
      }
      setLoading(false);
    }
    loadGallery();
    const channel = supabase.channel('gallery-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => loadGallery())
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
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
       </div>
    )
  }

  return (
    <>
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gallery</h2>
          <p className="text-muted-foreground">
            Manage your school&apos;s public image gallery.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Image
        </Button>
      </div>
      
      {galleryItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {galleryItems.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
            <div className="flex flex-col items-center gap-1 text-center py-20">
                <h3 className="text-2xl font-bold tracking-tight">
                No images found
                </h3>
                <p className="text-sm text-muted-foreground">
                Click &quot;Add Image&quot; to upload an image to the gallery.
                </p>
            </div>
        </div>
      )}
    </div>
    <CreateGalleryItemDialog isOpen={isCreateOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
