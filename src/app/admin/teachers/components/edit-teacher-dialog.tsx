
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Teacher, teacherSchema } from "../data/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase";

interface EditTeacherDialogProps {
  teacher: Teacher;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const updateTeacherSchema = teacherSchema.omit({ id: true });


export function EditTeacherDialog({ teacher, isOpen, onOpenChange }: EditTeacherDialogProps) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof updateTeacherSchema>>({
        resolver: zodResolver(updateTeacherSchema) as any,
        defaultValues: {
            name: teacher.name,
            contact: teacher.contact,
            department: teacher.department,
            experience: teacher.experience,
            dateJoined: teacher.dateJoined,
            bio: teacher.bio || '',
            imageUrl: teacher.imageUrl || '',
        },
    });

    async function onSubmit(values: z.infer<typeof updateTeacherSchema>) {
       try {
            const { error } = await supabase.from('teachers').update(values).eq('id', teacher.id);
            if (error) throw error;
            toast({
               title: "Teacher Updated",
               description: "The teacher's details have been successfully updated.",
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
          <DialogTitle>Edit Teacher: {teacher.name}</DialogTitle>
          <DialogDescription>
            Update the teacher&apos;s information below. Click save when you&apos;re done.
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
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Teacher's full name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contact"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Contact Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Teacher contact number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Science, Arts" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="experience"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Experience</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 5 years" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dateJoined"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Date Joined</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
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
                                <FormLabel>Profile Image URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="A short biography of the teacher." {...field} value={field.value ?? ''} />
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
