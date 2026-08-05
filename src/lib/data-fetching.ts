import { supabase } from "@/lib/supabase";
import { z } from "zod";
import {
  topperSchema, Topper,
  teacherSchema, Teacher,
  eventSchema, Event,
  galleryItemSchema, GalleryItem,
  testimonialSchema, Testimonial,
  faqSchema, FAQ,
  boardStudentSchema, BoardStudent,
  resultSchema, Result,
  feeRecordSchema, FeeRecord,
  feeStructureSchema, FeeStructure,
} from "@/app/admin/data-schemas";
import { hero } from "./data";

// Helper map to bridge Firebase path names to Supabase table names if needed
const tableNameMap: Record<string, string> = {
  boardStudents: "board_students",
  gallery: "gallery",
};

// Generic function to fetch data from Supabase
async function fetchData<T extends { id: string }>(dbPath: string, schema: z.ZodType<T, any, any>): Promise<T[]> {
  try {
    const tableName = tableNameMap[dbPath] || dbPath;
    const { data, error } = await supabase.from(tableName).select('*');
    
    if (error) {
      // Fallback try original dbPath if table mapping failed
      if (tableName !== dbPath) {
        const fallbackRes = await supabase.from(dbPath).select('*');
        if (!fallbackRes.error && fallbackRes.data) {
          return parseDataArray(fallbackRes.data, schema);
        }
      }
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        console.warn(`Table '${tableName}' does not exist in Supabase yet. Please execute supabase_schema.sql in your Supabase SQL Editor.`);
      } else {
        console.error(`Error fetching data from Supabase table '${tableName}':`, error);
      }
      return [];
    }

    if (data && Array.isArray(data)) {
      return parseDataArray(data, schema);
    }
    return [];
  } catch (error) {
    console.error(`Error fetching data from ${dbPath}:`, error);
    return [];
  }
}

function parseDataArray<T extends { id: string }>(dataArray: any[], schema: z.ZodType<T, any, any>): T[] {
  const validItems = dataArray
    .map(item => {
      // Ensure id is converted to string if stored as number/uuid
      const formattedItem = { ...item, id: String(item.id ?? '') };
      const result = schema.safeParse(formattedItem);
      if (result.success) {
        return result.data;
      } else {
        return null;
      }
    })
    .filter((item): item is T => item !== null);

  let sortedData = validItems;
  if (sortedData.length > 0 && 'date' in sortedData[0]) {
    sortedData.sort((a, b) => new Date((b as any).date).getTime() - new Date((a as any).date).getTime());
  } else if (sortedData.length > 0 && 'submittedAt' in sortedData[0]) {
    sortedData.sort((a, b) => new Date((b as any).submittedAt).getTime() - new Date((a as any).submittedAt).getTime());
  } else if (sortedData.length > 0 && 'date_created' in sortedData[0]) {
    sortedData.sort((a, b) => new Date((b as any).date_created).getTime() - new Date((a as any).date_created).getTime());
  }
  return sortedData;
}

export const getToppers = () => fetchData<Topper>('toppers', topperSchema);
export const getTeachers = () => fetchData<Teacher>('teachers', teacherSchema);
export const getEvents = () => fetchData<Event>('events', eventSchema);
export const getGalleryItems = () => fetchData<GalleryItem>('gallery', galleryItemSchema);
export const getTestimonials = () => fetchData<Testimonial>('testimonials', testimonialSchema);
export const getFaqs = () => fetchData<FAQ>('faqs', faqSchema);
export const getBoardStudents = () => fetchData<BoardStudent>('boardStudents', boardStudentSchema);
export const getResults = () => fetchData<Result>('results', resultSchema);
export const getFeeRecords = () => fetchData<FeeRecord>('fees', feeRecordSchema);
export const getFeeStructures = () => fetchData<FeeStructure>('fee_structures', feeStructureSchema);

// Default settings object to prevent errors on the calling page
const defaultSettings = {
    ourStory: "Our school's story has not been set up yet.",
    logoUrl: "",
    contactPhone: "Not available",
    contactEmail: "Not available",
    contactAddress: "Not available",
    officeHours: "Not available",
    aboutImageUrl: "",
    contactImageUrl: "",
    schoolDataUrl: "",
    heroTaglines: [hero.subtitle],
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
};

export async function getSettings() {
    try {
        const { data, error } = await supabase.from('settings').select('*').limit(1).single();
        if (!error && data) {
            const fetchedSettings = data;
            if (typeof fetchedSettings.heroTaglines === 'string') {
                fetchedSettings.heroTaglines = fetchedSettings.heroTaglines.split('\n').filter((line: string) => line.trim() !== '');
            } else if (!Array.isArray(fetchedSettings.heroTaglines) || fetchedSettings.heroTaglines.length === 0) {
                fetchedSettings.heroTaglines = [hero.subtitle];
            }
            return { ...defaultSettings, ...fetchedSettings };
        }
    } catch (error) {
        console.error("Error fetching settings from Supabase:", error);
    }
    return defaultSettings;
}
