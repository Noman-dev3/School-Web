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
      if (tableName !== dbPath) {
        const fallbackRes = await supabase.from(dbPath).select('*');
        if (!fallbackRes.error && fallbackRes.data) {
          return parseDataArray(fallbackRes.data, schema);
        }
      }
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        console.warn(`Table '${tableName}' does not exist in Supabase yet.`);
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

export const DEFAULT_SECTION_ORDER = [
  "hero",
  "stats",
  "portals",
  "programs",
  "features",
  "adBanner",
  "about",
  "toppers",
  "boardResults",
  "teachers",
  "events",
  "gallery",
  "testimonials",
  "faq",
  "contact"
];

export const DEFAULT_SECTION_VISIBILITY = {
  hero: true,
  stats: true,
  portals: true,
  programs: true,
  features: true,
  adBanner: true,
  about: true,
  toppers: true,
  boardResults: true,
  teachers: true,
  events: true,
  gallery: true,
  testimonials: true,
  faq: true,
  contact: true
};

// Default settings object to prevent errors on the calling page
const defaultSettings = {
  schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
  tagline: "Excellence in Academic Rigor & Timeless Values",
  ourStory: "Founded with a pioneering spirit, the Pakistan Islamic International School System (PIISS) embarked on a mission to redefine education.",
  logoUrl: "",
  contactPhone: "+92 300 1234567",
  contactEmail: "info@piiss.edu.pk",
  contactAddress: "Main Campus, Education City, Islamabad, Pakistan",
  officeHours: "Mon - Sat: 8:00 AM - 2:00 PM",
  aboutImageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
  contactImageUrl: "",
  schoolDataUrl: "",
  heroTaglines: [hero.subtitle, "100% Federal Board (FBISE) Pass & Distinction Rate", "Empowering Scholars with Modern STEM & Robotics"],
  heroTitle: "Pakistan Islamic International School System",
  heroSub: "Nurturing Academic Excellence & Quranic Ethics with 100% FBISE Distinction Rate",
  heroCtaText: "Apply for Admission 2026",
  heroCtaLink: "/admissions",
  heroImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
  noticeText: "📢 Admissions Open for Academic Session 2026-2027! Entrance Test Registration ends soon.",
  noticeLink: "/admissions",
  adBannerTitle: "Grand Annual Quran Recitation & STEM Exhibition 2026",
  adBannerSubtitle: "Join us at the Main Auditorium as our young scholars present cutting-edge robotics projects & Hifz distinctions.",
  adBannerCtaText: "View Event Highlights",
  adBannerImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  linkedinUrl: "https://linkedin.com",
  twitterUrl: "https://twitter.com",
  sectionOrder: DEFAULT_SECTION_ORDER,
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
  sectionTitles: {
    portalsTitle: "Key Academic Services & Portals",
    portalsDesc: "Quickly access essential school resources, admission forms, board examination results, and upcoming academic events.",
    programsTitle: "Academic Programs & Pathways",
    programsDesc: "Structured Montessori, Primary, and High School Curricula aligned with FBISE.",
    featuresTitle: "Why Choose PIISS Swat",
    featuresDesc: "Our core pillars of educational rigor, Quranic values, and modern STEM innovation.",
    aboutTitle: "About School & Institutional Mission",
    aboutDesc: "Learn about our founding story, vision, and dedication to Islamic character development.",
    toppersTitle: "FBISE Board Achievers & Distinction Holders",
    toppersDesc: "Celebrating outstanding academic merit and board exam toppers.",
    teachersTitle: "Distinguished Faculty & Educators",
    teachersDesc: "Experienced educators dedicated to academic excellence and moral leadership.",
    eventsTitle: "Upcoming School Events & Academic Calendar",
    eventsDesc: "Important dates for board examinations, sports galas, and Quran exhibitions.",
    faqTitle: "Frequently Asked Questions",
    faqDesc: "Clear answers to common questions about admissions, fee vouchers, and campus life.",
    contactTitle: "Campus Contact & Inquiry Info",
    contactDesc: "Reach out to our admissions office for enrollment guidelines and campus tours."
  }
};

export async function getSettings() {
  try {
    const { data, error } = await supabase.from('settings').select('*').limit(1).single();
    if (!error && data) {
      const fetchedSettings = data;
      if (typeof fetchedSettings.heroTaglines === 'string') {
        fetchedSettings.heroTaglines = fetchedSettings.heroTaglines.split('\n').filter((line: string) => line.trim() !== '');
      } else if (!Array.isArray(fetchedSettings.heroTaglines) || fetchedSettings.heroTaglines.length === 0) {
        fetchedSettings.heroTaglines = defaultSettings.heroTaglines;
      }

      const sectionOrder = Array.isArray(fetchedSettings.sectionOrder) && fetchedSettings.sectionOrder.length > 0
        ? fetchedSettings.sectionOrder
        : DEFAULT_SECTION_ORDER;

      const sectionVisibility = (typeof fetchedSettings.sectionVisibility === 'object' && fetchedSettings.sectionVisibility !== null)
        ? { ...DEFAULT_SECTION_VISIBILITY, ...fetchedSettings.sectionVisibility }
        : DEFAULT_SECTION_VISIBILITY;

      const sectionTitles = (typeof fetchedSettings.sectionTitles === 'object' && fetchedSettings.sectionTitles !== null)
        ? { ...defaultSettings.sectionTitles, ...fetchedSettings.sectionTitles }
        : defaultSettings.sectionTitles;

      return {
        ...defaultSettings,
        ...fetchedSettings,
        sectionOrder,
        sectionVisibility,
        sectionTitles
      };
    }
  } catch (error) {
    console.error("Error fetching settings from Supabase:", error);
  }
  return defaultSettings;
}
