
import { z } from "zod";
import { boardStudentSchema as baseBoardStudentSchema } from "@/app/admin/data-schemas";

export const boardStudentSchema = baseBoardStudentSchema;

export type BoardStudent = z.infer<typeof boardStudentSchema>;
