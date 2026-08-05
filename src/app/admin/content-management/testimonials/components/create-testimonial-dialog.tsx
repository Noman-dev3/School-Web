
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { testimonialSchema } from "../data/schema"
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

interface CreateTestimonialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const createTestimonialSchema = testimonialSchema.omit({ id: true });


export function CreateTestimonialDialog({ isOpen, onOpenChange }: CreateTestimonialDialogProps) {
  const router = useRouter();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof createTestimonialSchema>>({
        resolver: zodResolver(createTestimonialSchema) as any,
        defaultValues: {
            name: "",
            role: "",
            quote: "",
            rating: 5,
        },
    });

    async function onSubmit(values: z.infer<typeof createTestimonialSchema>) {
       try {
           const { error } = await supabase.from('testimonials').insert([values]);
           if (error) throw error;
           router.refresh();
           router.refresh();
           toast({
               title: "Testimonial Added",
               description: "The new testimonial has been successfully added.",
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
          <DialogTitle>Create New Testimonial</DialogTitle>
          <DialogDescription>
            Fill in the details for the new testimonial. Click create when you&apos;re done.
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
                                                <RadioGroupItem value={String(value)} id={`rating-${value}`} className="sr-only" />
                                            </FormControl>
                                            <FormLabel htmlFor={`rating-${value}`}>
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
                        <Button type="submit">Create Testimonial</Button>
                    </DialogFooter>
                </form>
             </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
