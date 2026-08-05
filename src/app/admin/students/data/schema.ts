import { z } from "zod";

export const studentSchema = z.object({
  id: z.string(),
  Name: z.string(),
  Class: z.string(),
  Contact: z.string(),
  Date_Added: z.string(),
  Fee_Slip_Path: z.string().optional().or(z.literal('')),
  Gender: z.string(),
  Section: z.string(),
  Address: z.string(),
  profilePicture: z.string().url().optional().or(z.literal('')).nullable(),
});

export type Student = z.infer<typeof studentSchema>;
