
"use client";

import Image from "next/image";
import { useState } from "react";
import { Topper } from "../data/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Star } from "lucide-react";
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
import { EditTopperDialog } from "./edit-topper-dialog";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface TopperCardProps {
  topper: Topper;
}

export function TopperCard({ topper }: TopperCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditOpen, setEditOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
        const { error } = await supabase.from('toppers').delete().eq('id', topper.id);
      if (error) throw error;
        router.refresh();
        router.refresh();
        toast({
            title: "Topper Removed",
            description: `The student "${topper.name}" has been removed from the toppers list.`,
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
         <CardHeader className="items-center text-center p-6">
            <Image
                src={topper.imageUrl || "https://placehold.co/128x128.png"}
                alt={topper.name}
                width={100}
                height={100}
                className="rounded-full border-4 border-primary/50 object-cover w-24 h-24 transition-transform duration-500 group-hover:scale-110"
                data-ai-hint="student portrait"
            />
        </CardHeader>
        <CardContent className="p-6 pt-0 text-center flex-grow">
             <CardTitle className="text-xl font-bold font-headline mb-1 truncate">{topper.name}</CardTitle>
             <p className="text-sm text-muted-foreground mb-4">Class: {topper.class}</p>
             <Badge className="bg-amber-400/20 text-amber-600 border-amber-400/30">
                <Star className="h-4 w-4 mr-2" />
                <span>{topper.score}</span>
             </Badge>
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
                    This action cannot be undone. This will permanently remove the topper <strong>{topper.name}</strong>.
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
    <EditTopperDialog topper={topper} isOpen={isEditOpen} onOpenChange={setEditOpen} />
    </>
  );
}
