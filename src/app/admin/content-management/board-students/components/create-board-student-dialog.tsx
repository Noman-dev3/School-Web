
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { boardStudentSchema } from "../data/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"

interface CreateBoardStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const createBoardStudentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  class: z.string().min(1, "Class cannot be empty."),
  boardRollNo: z.string().min(1, "Board Roll No. cannot be empty."),
  obtainedMarks: z.coerce.number().min(0, "Obtained marks must be a positive number."),
  totalMarks: z.coerce.number().min(1, "Total marks must be greater than 0."),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal("")).nullable(),
});


export function CreateBoardStudentDialog({ isOpen, onOpenChange }: CreateBoardStudentDialogProps) {
  const router = useRouter();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof createBoardStudentSchema>>({
        resolver: zodResolver(createBoardStudentSchema) as any,
        defaultValues: {
            name: "",
            class: "",
            boardRollNo: "",
            obtainedMarks: 0,
            totalMarks: 0,
            imageUrl: "",
        },
    });

    async function onSubmit(values: z.infer<typeof createBoardStudentSchema>) {
       try {
           const { error } = await supabase.from('board_students').insert([values]);
           if (error) throw error;
           router.refresh();
           router.refresh();
           toast({
               title: "Board Student Added",
               description: "The new board student has been successfully added.",
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
          <DialogTitle>Add New Board Student</DialogTitle>
          <DialogDescription>
            Fill in the student&apos;s board result details below. Click add when you&apos;re done.
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
                                    <Input placeholder="e.g., Ahmed Hassan" {...field} />
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
                                    <Input placeholder="e.g., 9th" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="boardRollNo"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Board Roll No.</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 123456" {...field} />
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
                        <FormField
                            control={form.control}
                            name="obtainedMarks"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Obtained Marks</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 950" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="totalMarks"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Total Marks</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 1100" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Add Student</Button>
                    </DialogFooter>
                </form>
             </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
