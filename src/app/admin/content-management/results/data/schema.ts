
import { z } from "zod";

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
  rank: z.number().optional(),
});

export type Result = z.infer<typeof resultSchema>;
