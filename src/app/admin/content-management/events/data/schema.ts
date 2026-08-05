
import { z } from "zod";
import { eventSchema as baseEventSchema } from "@/app/admin/data-schemas";

export const eventSchema = baseEventSchema;

export type Event = z.infer<typeof eventSchema>;
