
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Announcement, announcementSchema } from "../data/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"

interface EditAnnouncementDialogProps {
  announcement: Announcement;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const updateAnnouncementSchema = announcementSchema.omit({ id: true });


export function EditAnnouncementDialog({ announcement, isOpen, onOpenChange }: EditAnnouncementDialogProps) {
  const router = useRouter();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof updateAnnouncementSchema>>({
        resolver: zodResolver(updateAnnouncementSchema) as any,
        defaultValues: {
            ...announcement,
        },
    });

    async function onSubmit(values: z.infer<typeof updateAnnouncementSchema>) {
       try {
            const { error } = await supabase.from('announcements').update(values).eq('id', announcement.id);
      if (error) throw error;
            router.refresh();
            toast({
                title: "Announcement Updated",
                description: "The announcement has been successfully updated.",
            });
            onOpenChange(false);
       } catch (error) {
            toast({
                title: "Update Failed",
                description: (error as Error).message,
                variant: "destructive"
            });
       }
    }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
 <DialogTitle>Edit Announcement: {announcement.title}</DialogTitle>
          <DialogDescription>
            Update the announcement details below. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto pr-4">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., School Reopening Date" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl>
                                    <Textarea rows={6} placeholder="Full content of the announcement." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
             </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
