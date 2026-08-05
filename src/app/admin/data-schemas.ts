// This file centralizes schemas that are used across both admin and public pages
// to avoid circular dependencies and import errors.

import { z } from "zod";

export const topperSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Name must be at least 3 characters long."),
  class: z.string().min(1, "Class cannot be empty."),
  score: z.string().min(1, "Score cannot be empty."),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal("")).nullable(),
});
export type Topper = z.infer<typeof topperSchema>;


export const teacherSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional().nullable(),
  contact: z.string().min(1, "Contact is required"),
  dateJoined: z.string().min(1, "Date joined is required"),
  department: z.string().min(1, "Department is required"),
  experience: z.string().min(1, "Experience is required"),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
});
export type Teacher = z.infer<typeof teacherSchema>;

export const eventSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal("")).nullable(),
});
export type Event = z.infer<typeof eventSchema>;

export const galleryItemSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url("Please enter a valid URL."),
});
export type GalleryItem = z.infer<typeof galleryItemSchema>;

export const testimonialSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Name must be at least 3 characters long."),
  role: z.string().min(2, "Role must be at least 2 characters long."),
  quote: z.string().min(10, "Quote must be at least 10 characters long."),
  rating: z.coerce.number().min(1, "Rating is required").max(5, "Rating cannot be more than 5"),
});
export type Testimonial = z.infer<typeof testimonialSchema>;

export const faqSchema = z.object({
  id: z.string(),
  question: z.string().min(10, "Question must be at least 10 characters long."),
  answer: z.string().min(10, "Answer must be at least 10 characters long."),
});
export type FAQ = z.infer<typeof faqSchema>;


export const boardStudentSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Name must be at least 3 characters long."),
  class: z.string().min(1, "Class cannot be empty."),
  boardRollNo: z.string().min(1, "Board Roll No. cannot be empty."),
  obtainedMarks: z.coerce.number().min(0, "Obtained marks must be a positive number."),
  totalMarks: z.coerce.number().min(1, "Total marks must be greater than 0."),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal("")).nullable(),
});
export type BoardStudent = z.infer<typeof boardStudentSchema>;

export const resultSchema = z.object({
    id: z.string(),
    class: z.string(),
    date_created: z.string(),
    grade: z.string(),
    max_marks: z.number(),
    percentage: z.number(),
    roll_number: z.string(),
    session: z.string(),
    student_id: z.string(),
    student_name: z.string(),
    subjects: z.record(z.string(), z.number()),
    total_marks: z.number(),
});
export type Result = z.infer<typeof resultSchema>;

export interface DynamicFeeField {
  id: string;
  name: string;
  amount: number;
}

export const feeRecordSchema = z.object({
  id: z.string(),
  challan_number: z.string(),
  student_id: z.string().optional().nullable(),
  student_name: z.string().min(1, "Student name is required"),
  class_name: z.string().min(1, "Class is required"),
  section: z.string().optional().nullable(),
  month_year: z.string().min(1, "Month/Year is required"),
  tuition_fee: z.coerce.number().default(0),
  lab_fee: z.coerce.number().default(0),
  exam_fee: z.coerce.number().default(0),
  arrears: z.coerce.number().default(0),
  discount: z.coerce.number().default(0),
  custom_fields: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amount: z.coerce.number(),
    })
  ).optional().default([]),
  total_amount: z.coerce.number().default(0),
  amount_paid: z.coerce.number().default(0),
  status: z.enum(['paid', 'pending', 'overdue', 'partial', 'pending_approval']).default('pending'),
  payment_method: z.string().optional().nullable(),
  payment_date: z.string().optional().nullable(),
  receipt_url: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
});
export type FeeRecord = z.infer<typeof feeRecordSchema>;

export const feeStructureSchema = z.object({
  id: z.string(),
  class_name: z.string().min(1, "Class name is required"),
  tuition_fee: z.coerce.number().min(0),
  admission_fee: z.coerce.number().min(0),
  exam_fee: z.coerce.number().min(0),
  lab_fee: z.coerce.number().min(0),
  custom_fields: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amount: z.coerce.number(),
    })
  ).optional().default([]),
  is_public: z.boolean().optional().default(true),
  kinship_enabled: z.boolean().optional().default(true),
  kinship_discount_percent: z.coerce.number().optional().default(25),
});
export type FeeStructure = z.infer<typeof feeStructureSchema>;
