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
  stats: false, // Stats bar removed per user instruction
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

// Default settings object with full template & landing page customization
export const defaultSettings = {
  schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
  tagline: "Excellence in Academic Rigor & Timeless Values",
  ourStory: "Founded with a passionate vision to redefine education, PIISS embarked on a journey to build a premier institution where academic excellence and Quranic ethics unite. Guided by a belief in the transformational power of knowledge, our faculty fosters a community of eager scholars, all connected by the desire to explore, excel, and serve humanity.",
  logoUrl: "",
  contactPhone: "+92 300 1234567",
  contactEmail: "info@piiss.edu.pk",
  contactAddress: "Main Campus, Education City, Swat, KPK, Pakistan",
  officeHours: "Mon - Sat: 8:00 AM - 2:00 PM",
  aboutImageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
  contactImageUrl: "",
  schoolDataUrl: "",
  
  // Hero Section Template Customization
  heroEyebrow: "ABOUT US",
  heroTitlePart1: "We are the top",
  heroTitlePart2: "Learning Platform.",
  heroSub: "Empowering scholars with advanced learning tools, Quranic ethics, and FBISE board distinction merit to redefine education for a brighter future.",
  heroCtaText: "Register Now",
  heroCtaLink: "/admissions",
  heroCta2Text: "Learn More",
  heroCta2Link: "/#about",
  heroImageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
  heroTaglines: [hero.subtitle, "100% Federal Board (FBISE) Pass & Distinction Rate", "Empowering Scholars with Modern STEM & Robotics"],
  
  // Hero Bottom 3 Feature Cards
  heroCard1Title: "Quality Teachers",
  heroCard1Desc: "Certified & experienced educators dedicated to individual student growth and character building.",
  heroCard2Title: "Best Curriculum",
  heroCard2Desc: "Balanced FBISE academic rigor integrated with modern STEM robotics and Hifz pathways.",
  heroCard3Title: "Global Recognition",
  heroCard3Desc: "100% board pass percentage with top positions across Federal Board examinations.",

  // About Us Section Customization (Matching Reference Layout)
  aboutEyebrow: "How it Started",
  aboutTitle: "Our Dream is Global Educational Transformation",
  aboutStat1Value: "10+",
  aboutStat1Label: "Years Experience",
  aboutStat2Value: "100%",
  aboutStat2Label: "FBISE Pass Rate",
  aboutStat3Value: "2,500+",
  aboutStat3Label: "Enrolled Scholars",
  aboutStat4Value: "100+",
  aboutStat4Label: "Certified Faculty",

  noticeText: "Admissions Open for Academic Session 2026-2027! Entrance Test Registration ends soon.",
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
      const fetchedSettings = { ...data };

      // Unpack nested CMS config stored inside heroTaglines JSONB payload if present
      let cmsConfig: any = {};
      let heroTaglinesArray = defaultSettings.heroTaglines;

      if (fetchedSettings.heroTaglines) {
        if (typeof fetchedSettings.heroTaglines === 'object' && !Array.isArray(fetchedSettings.heroTaglines)) {
          cmsConfig = fetchedSettings.heroTaglines;
          heroTaglinesArray = Array.isArray(cmsConfig.taglines) ? cmsConfig.taglines : defaultSettings.heroTaglines;
        } else if (Array.isArray(fetchedSettings.heroTaglines)) {
          heroTaglinesArray = fetchedSettings.heroTaglines;
        } else if (typeof fetchedSettings.heroTaglines === 'string') {
          heroTaglinesArray = fetchedSettings.heroTaglines.split('\n').filter((line: string) => line.trim() !== '');
        }
      }

      const sectionOrder = (fetchedSettings.sectionOrder || cmsConfig.sectionOrder || DEFAULT_SECTION_ORDER).filter((s: string) => s !== 'stats');
      const sectionVisibility = { ...DEFAULT_SECTION_VISIBILITY, ...cmsConfig.sectionVisibility, ...fetchedSettings.sectionVisibility, stats: false };
      
      const sectionTitles = {
        ...defaultSettings.sectionTitles,
        ...(cmsConfig.sectionTitles || {}),
        ...(fetchedSettings.sectionTitles || {})
      };

      return {
        ...defaultSettings,
        ...cmsConfig,
        ...fetchedSettings,
        heroTaglines: heroTaglinesArray,
        sectionOrder,
        sectionVisibility,
        sectionTitles,
        schoolName: fetchedSettings.schoolName || cmsConfig.schoolName || defaultSettings.schoolName,
        tagline: fetchedSettings.tagline || cmsConfig.tagline || defaultSettings.tagline,
        heroEyebrow: fetchedSettings.heroEyebrow || cmsConfig.heroEyebrow || defaultSettings.heroEyebrow,
        heroTitlePart1: fetchedSettings.heroTitlePart1 || cmsConfig.heroTitlePart1 || defaultSettings.heroTitlePart1,
        heroTitlePart2: fetchedSettings.heroTitlePart2 || cmsConfig.heroTitlePart2 || defaultSettings.heroTitlePart2,
        heroSub: fetchedSettings.heroSub || cmsConfig.heroSub || defaultSettings.heroSub,
        heroCtaText: fetchedSettings.heroCtaText || cmsConfig.heroCtaText || defaultSettings.heroCtaText,
        heroCtaLink: fetchedSettings.heroCtaLink || cmsConfig.heroCtaLink || defaultSettings.heroCtaLink,
        heroCta2Text: fetchedSettings.heroCta2Text || cmsConfig.heroCta2Text || defaultSettings.heroCta2Text,
        heroCta2Link: fetchedSettings.heroCta2Link || cmsConfig.heroCta2Link || defaultSettings.heroCta2Link,
        heroImageUrl: fetchedSettings.heroImageUrl || cmsConfig.heroImageUrl || defaultSettings.heroImageUrl,
        heroCard1Title: fetchedSettings.heroCard1Title || cmsConfig.heroCard1Title || defaultSettings.heroCard1Title,
        heroCard1Desc: fetchedSettings.heroCard1Desc || cmsConfig.heroCard1Desc || defaultSettings.heroCard1Desc,
        heroCard2Title: fetchedSettings.heroCard2Title || cmsConfig.heroCard2Title || defaultSettings.heroCard2Title,
        heroCard2Desc: fetchedSettings.heroCard2Desc || cmsConfig.heroCard2Desc || defaultSettings.heroCard2Desc,
        heroCard3Title: fetchedSettings.heroCard3Title || cmsConfig.heroCard3Title || defaultSettings.heroCard3Title,
        heroCard3Desc: fetchedSettings.heroCard3Desc || cmsConfig.heroCard3Desc || defaultSettings.heroCard3Desc,
        aboutEyebrow: fetchedSettings.aboutEyebrow || cmsConfig.aboutEyebrow || defaultSettings.aboutEyebrow,
        aboutTitle: fetchedSettings.aboutTitle || cmsConfig.aboutTitle || defaultSettings.aboutTitle,
        aboutStat1Value: fetchedSettings.aboutStat1Value || cmsConfig.aboutStat1Value || defaultSettings.aboutStat1Value,
        aboutStat1Label: fetchedSettings.aboutStat1Label || cmsConfig.aboutStat1Label || defaultSettings.aboutStat1Label,
        aboutStat2Value: fetchedSettings.aboutStat2Value || cmsConfig.aboutStat2Value || defaultSettings.aboutStat2Value,
        aboutStat2Label: fetchedSettings.aboutStat2Label || cmsConfig.aboutStat2Label || defaultSettings.aboutStat2Label,
        aboutStat3Value: fetchedSettings.aboutStat3Value || cmsConfig.aboutStat3Value || defaultSettings.aboutStat3Value,
        aboutStat3Label: fetchedSettings.aboutStat3Label || cmsConfig.aboutStat3Label || defaultSettings.aboutStat3Label,
        aboutStat4Value: fetchedSettings.aboutStat4Value || cmsConfig.aboutStat4Value || defaultSettings.aboutStat4Value,
        aboutStat4Label: fetchedSettings.aboutStat4Label || cmsConfig.aboutStat4Label || defaultSettings.aboutStat4Label,
        noticeText: fetchedSettings.noticeText || cmsConfig.noticeText || defaultSettings.noticeText,
        noticeLink: fetchedSettings.noticeLink || cmsConfig.noticeLink || defaultSettings.noticeLink,
        adBannerTitle: fetchedSettings.adBannerTitle || cmsConfig.adBannerTitle || defaultSettings.adBannerTitle,
        adBannerSubtitle: fetchedSettings.adBannerSubtitle || cmsConfig.adBannerSubtitle || defaultSettings.adBannerSubtitle,
        adBannerCtaText: fetchedSettings.adBannerCtaText || cmsConfig.adBannerCtaText || defaultSettings.adBannerCtaText,
        adBannerImageUrl: fetchedSettings.adBannerImageUrl || cmsConfig.adBannerImageUrl || defaultSettings.adBannerImageUrl,
      };
    }
  } catch (error) {
    console.error("Error fetching settings from Supabase:", error);
  }
  return defaultSettings;
}
