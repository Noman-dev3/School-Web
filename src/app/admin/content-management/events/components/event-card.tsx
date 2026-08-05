
"use client";

import Image from "next/image";
import { useState } from "react";
import { Event } from "../data/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar } from "lucide-react";
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
import { format } from "date-fns";
import { EditEventDialog } from "./edit-event-dialog";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditOpen, setEditOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
        const { error } = await supabase.from('events').delete().eq('id', event.id);
      if (error) throw error;
        router.refresh();
        router.refresh();
        router.refresh();
        toast({
            title: "Event Deleted",
            description: `The event "${event.title}" has been removed.`,
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
    <div className="group perspective-1000">
        <Card className="h-full flex flex-col transform-style-3d transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/20 bg-secondary/30 border-border/20">
            <CardHeader className="p-0">
                <Image
                    src={event.imageUrl || "https://placehold.co/600x400.png"}
                    alt={event.title}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-105"
                    data-ai-hint="school event"
                />
            </CardHeader>
            <CardContent className="p-6 flex-grow">
                 <CardTitle className="text-xl font-bold font-headline mb-2">{event.title}</CardTitle>
                 <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{format(new Date(event.date), "PPP")}</span>
                 </div>
                 <CardDescription className="line-clamp-3 text-sm">
                    {event.description}
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
                        This action cannot be undone. This will permanently delete the event <strong>{event.title}</strong>.
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
    </div>
    <EditEventDialog event={event} isOpen={isEditOpen} onOpenChange={setEditOpen} />
    </>
  );
}
