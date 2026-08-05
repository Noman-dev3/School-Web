
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { faqSchema } from "../data/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"

interface CreateFaqDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const createFaqSchema = faqSchema.omit({ id: true });


export function CreateFaqDialog({ isOpen, onOpenChange }: CreateFaqDialogProps) {
  const router = useRouter();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof createFaqSchema>>({
        resolver: zodResolver(createFaqSchema) as any,
        defaultValues: {
            question: "",
            answer: "",
        },
    });

    async function onSubmit(values: z.infer<typeof createFaqSchema>) {
       try {
           const { error } = await supabase.from('faqs').insert([values]);
           if (error) throw error;
           router.refresh();
           router.refresh();
           toast({
               title: "FAQ Added",
               description: "The new FAQ has been successfully added.",
           });
           onOpenChange(false);
           form.reset();
       } catch (error) {
            toast({
                title: "Creation Failed",
                description: (error as Error).message,
                variant: "destructive"
            });
       }
    }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New FAQ</DialogTitle>
          <DialogDescription>
            Fill in the question and answer. Click create when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto pr-4">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="question"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., What are the school hours?" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="answer"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Answer</FormLabel>
                                <FormControl>
                                    <Textarea rows={5} placeholder="Provide a clear and concise answer." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Create FAQ</Button>
                    </DialogFooter>
                </form>
             </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
