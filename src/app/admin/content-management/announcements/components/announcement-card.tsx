
"use client";

import { useState } from "react";
import { Announcement } from "../data/schema";
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
import { EditAnnouncementDialog } from "./edit-announcement-dialog";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditOpen, setEditOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
        const { error } = await supabase.from('announcements').delete().eq('id', announcement.id);
      if (error) throw error;
        router.refresh();
        toast({
            title: "Announcement Deleted",
            description: `The announcement "${announcement.title}" has been removed.`,
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
    <Card className="h-full flex flex-col group perspective-1000 bg-secondary/30 border-border/20">
        <CardHeader className="p-6">
             <CardTitle className="text-xl font-bold font-headline mb-2">{announcement.title}</CardTitle>
             <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{format(new Date(announcement.date), "PPP")}</span>
             </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex-grow">
             <CardDescription className="line-clamp-4 text-sm whitespace-pre-wrap">
                {announcement.content}
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
                    This action cannot be undone. This will permanently delete the announcement: <strong>{announcement.title}</strong>.
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
    <EditAnnouncementDialog announcement={announcement} isOpen={isEditOpen} onOpenChange={setEditOpen} />
    </>
  );
}
