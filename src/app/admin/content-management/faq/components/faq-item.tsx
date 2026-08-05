
"use client";

import { useState } from "react";
import { FAQ } from "../data/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import { EditFaqDialog } from "./edit-faq-dialog";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface FaqItemProps {
  faq: FAQ;
}

export function FaqItem({ faq }: FaqItemProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditOpen, setEditOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
        const { error } = await supabase.from('faqs').delete().eq('id', faq.id);
      if (error) throw error;
        router.refresh();
        router.refresh();
        toast({
            title: "FAQ Deleted",
            description: `The FAQ has been removed.`,
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
        <AccordionItem value={faq.id}>
            <AccordionTrigger className="hover:no-underline">
                <div className="flex justify-between items-center w-full pr-4">
                    <span className="text-left font-semibold">{faq.question}</span>
                    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
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
                                This action cannot be undone. This will permanently delete this FAQ.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
            </AccordionContent>
        </AccordionItem>
        <EditFaqDialog faq={faq} isOpen={isEditOpen} onOpenChange={setEditOpen} />
    </>
  );
}
