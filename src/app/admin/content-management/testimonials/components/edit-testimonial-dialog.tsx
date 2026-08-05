
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Testimonial, testimonialSchema } from "../data/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"

interface EditTestimonialDialogProps {
  testimonial: Testimonial;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const updateTestimonialSchema = testimonialSchema.omit({ id: true });


export function EditTestimonialDialog({ testimonial, isOpen, onOpenChange }: EditTestimonialDialogProps) {
  const router = useRouter();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof updateTestimonialSchema>>({
        resolver: zodResolver(updateTestimonialSchema) as any,
        defaultValues: {
            ...testimonial,
        },
    });

    async function onSubmit(values: z.infer<typeof updateTestimonialSchema>) {
       try {
            const { error } = await supabase.from('testimonials').update(values).eq('id', testimonial.id);
      if (error) throw error;
            router.refresh();
            router.refresh();
            toast({
                title: "Testimonial Updated",
                description: "The testimonial has been successfully updated.",
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
          <DialogTitle>Edit Testimonial by {testimonial.name}</DialogTitle>
          <DialogDescription>
            Update the testimonial details below. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto pr-4">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Parent, Student" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="quote"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Quote</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="A short testimonial quote." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                    value={String(field.value)}
                                    className="flex items-center space-x-2"
                                    >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <FormItem key={value} className="flex items-center space-x-1 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value={String(value)} id={`edit-rating-${value}`} className="sr-only" />
                                            </FormControl>
                                            <FormLabel htmlFor={`edit-rating-${value}`}>
                                                <Star className={`h-6 w-6 cursor-pointer ${field.value >= value ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                                            </FormLabel>
                                        </FormItem>
                                    ))}
                                    </RadioGroup>
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
