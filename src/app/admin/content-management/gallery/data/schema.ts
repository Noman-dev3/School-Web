
import { z } from "zod";
import { galleryItemSchema as baseGalleryItemSchema } from "@/app/admin/data-schemas";

export const galleryItemSchema = baseGalleryItemSchema;

export type GalleryItem = z.infer<typeof galleryItemSchema>;
