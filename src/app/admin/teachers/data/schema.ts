
import { z } from "zod";
import { teacherSchema as baseTeacherSchema } from "@/app/admin/data-schemas";

export const teacherSchema = baseTeacherSchema;

export type Teacher = z.infer<typeof teacherSchema>;
