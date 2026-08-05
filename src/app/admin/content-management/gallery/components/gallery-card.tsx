
"use client";

import Image from "next/image";
import { useState } from "react";
import { GalleryItem } from "../data/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditGalleryItemDialog } from "./edit-gallery-item-dialog";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface GalleryCardProps {
  item: GalleryItem;
}

export function GalleryCard({ item }: GalleryCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditOpen, setEditOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
        const { error } = await supabase.from('gallery').delete().eq('id', item.id);
      if (error) throw error;
        router.refresh();
        router.refresh();
        router.refresh();
        toast({
            title: "Image Deleted",
            description: `The image "${item.title}" has been removed from the gallery.`,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: (error as Error).message,
            variant: "destructive",
        });
    }
  };

  return (
    <>
    <Card className="h-full flex flex-col overflow-hidden group perspective-1000 bg-secondary/30 border-border/20">
        <CardHeader className="p-0 relative">
            <Image
                src={item.imageUrl}
                alt={item.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-105"
                data-ai-hint="gallery image"
            />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
             <CardTitle className="text-lg font-bold font-headline mb-1 truncate">{item.title}</CardTitle>
             <CardDescription className="line-clamp-2 text-sm h-[40px]">
                {item.description}
            </CardDescription>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-4 pt-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
                <Edit className="h-4 w-4 text-blue-500" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the image <strong>{item.title}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

        </CardFooter>
    </Card>
    <EditGalleryItemDialog item={item} isOpen={isEditOpen} onOpenChange={setEditOpen} />
    </>
  );
}
