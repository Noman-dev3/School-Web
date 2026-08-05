
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { topperSchema } from "../data/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"

interface CreateTopperDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const createTopperSchema = topperSchema.omit({ id: true });


export function CreateTopperDialog({ isOpen, onOpenChange }: CreateTopperDialogProps) {
  const router = useRouter();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof createTopperSchema>>({
        resolver: zodResolver(createTopperSchema) as any,
        defaultValues: {
            name: "",
            class: "",
            score: "",
            imageUrl: "",
        },
    });

    async function onSubmit(values: z.infer<typeof createTopperSchema>) {
       try {
           const { error } = await supabase.from('toppers').insert([values]);
           if (error) throw error;
           router.refresh();
           router.refresh();
           toast({
               title: "Topper Added",
               description: "The new topper has been successfully added.",
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
          <DialogTitle>Add New Topper</DialogTitle>
          <DialogDescription>
            Fill in the student&apos;s details below. Click add when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto pr-4">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Student Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Ali Khan" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="class"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Class</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 10th" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="score"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Score / Grade</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 98.5% or A+" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Image URL (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Add Topper</Button>
                    </DialogFooter>
                </form>
             </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
