
import { z } from "zod";

export const announcementSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters long."),
  content: z.string().min(10, "Content must be at least 10 characters long."),
  date: z.string(),
});

export type Announcement = z.infer<typeof announcementSchema>;
