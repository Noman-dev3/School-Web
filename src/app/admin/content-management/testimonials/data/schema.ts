
import { z } from "zod";
import { testimonialSchema as baseTestimonialSchema } from "@/app/admin/data-schemas";

export const testimonialSchema = baseTestimonialSchema;

export type Testimonial = z.infer<typeof testimonialSchema>;
