
import { z } from "zod";
import { topperSchema as baseTopperSchema } from "@/app/admin/data-schemas";

export const topperSchema = baseTopperSchema;

export type Topper = z.infer<typeof topperSchema>;
