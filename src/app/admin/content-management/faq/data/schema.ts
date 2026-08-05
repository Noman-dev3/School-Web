
import { z } from "zod";
import { faqSchema as baseFaqSchema } from "@/app/admin/data-schemas";

export const faqSchema = baseFaqSchema;

export type FAQ = z.infer<typeof faqSchema>;
