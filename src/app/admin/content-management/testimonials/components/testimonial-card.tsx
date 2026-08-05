
"use client";

import { useState } from "react";
import { Testimonial } from "../data/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Star, User } from "lucide-react";
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
import { EditTestimonialDialog } from "./edit-testimonial-dialog";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditOpen, setEditOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
        const { error } = await supabase.from('testimonials').delete().eq('id', testimonial.id);
      if (error) throw error;
        router.refresh();
        router.refresh();
        toast({
            title: "Testimonial Deleted",
            description: `The testimonial from "${testimonial.name}" has been removed.`,
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
        <CardHeader className="flex-row gap-4 items-start p-6">
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
                <CardTitle className="text-lg font-bold font-headline mb-1">{testimonial.name}</CardTitle>
                <CardDescription>{testimonial.role}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex-grow">
             <blockquote className="text-base text-foreground border-l-4 border-primary pl-4 italic">
                &quot;{testimonial.quote}&quot;
            </blockquote>
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-2 p-6 pt-0">
            <div className="flex items-center gap-1">
                {Array(testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                ))}
                {Array(5 - testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-muted-foreground/30" />
                ))}
            </div>

            <div className="flex gap-2">
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
                        This action cannot be undone. This will permanently delete the testimonial by <strong>{testimonial.name}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardFooter>
    </Card>
    <EditTestimonialDialog testimonial={testimonial} isOpen={isEditOpen} onOpenChange={setEditOpen} />
    </>
  );
}
