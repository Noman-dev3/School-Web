-- =========================================================================
-- Supabase SQL Patch: Landing Page CMS & Dynamic Section Customizer
-- Run this in Supabase Dashboard -> SQL Editor
-- =========================================================================

-- 1. Ensure columns exist on public.settings for CMS customizer
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "sectionOrder" JSONB DEFAULT '["hero","stats","portals","programs","features","adBanner","about","toppers","boardResults","teachers","events","gallery","testimonials","faq","contact"]'::jsonb;

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "sectionVisibility" JSONB DEFAULT '{"hero":true,"stats":true,"portals":true,"programs":true,"features":true,"adBanner":true,"about":true,"toppers":true,"boardResults":true,"teachers":true,"events":true,"gallery":true,"testimonials":true,"faq":true,"contact":true}'::jsonb;

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "noticeText" TEXT DEFAULT '📢 Admissions Open for Academic Session 2026-2027! Entrance Test Registration ends soon.';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "noticeLink" TEXT DEFAULT '/admissions';

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "heroTitle" TEXT DEFAULT 'Pakistan Islamic International School System';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "heroSub" TEXT DEFAULT 'Nurturing Academic Excellence & Quranic Ethics with 100% FBISE Distinction Rate';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "heroCtaText" TEXT DEFAULT 'Apply for Admission 2026';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "heroCtaLink" TEXT DEFAULT '/admissions';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "heroImageUrl" TEXT DEFAULT 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80';

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "adBannerTitle" TEXT DEFAULT 'Grand Annual Quran Recitation & STEM Exhibition 2026';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "adBannerSubtitle" TEXT DEFAULT 'Join us at the Main Auditorium as our young scholars present cutting-edge robotics projects & Hifz distinctions.';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "adBannerCtaText" TEXT DEFAULT 'View Event Highlights';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "adBannerImageUrl" TEXT DEFAULT 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "sectionTitles" JSONB DEFAULT '{
  "portalsTitle": "Key Academic Services & Portals",
  "portalsDesc": "Quickly access essential school resources, admission forms, board examination results, and upcoming academic events.",
  "programsTitle": "Academic Programs & Pathways",
  "programsDesc": "Structured Montessori, Primary, and High School Curricula aligned with FBISE.",
  "featuresTitle": "Why Choose PIISS Swat",
  "featuresDesc": "Our core pillars of educational rigor, Quranic values, and modern STEM innovation.",
  "aboutTitle": "About School & Institutional Mission",
  "aboutDesc": "Learn about our founding story, vision, and dedication to Islamic character development.",
  "toppersTitle": "FBISE Board Achievers & Distinction Holders",
  "toppersDesc": "Celebrating outstanding academic merit and board exam toppers.",
  "teachersTitle": "Distinguished Faculty & Educators",
  "teachersDesc": "Experienced educators dedicated to academic excellence and moral leadership.",
  "eventsTitle": "Upcoming School Events & Academic Calendar",
  "eventsDesc": "Important dates for board examinations, sports galas, and Quran exhibitions.",
  "faqTitle": "Frequently Asked Questions",
  "faqDesc": "Clear answers to common questions about admissions, fee vouchers, and campus life.",
  "contactTitle": "Campus Contact & Inquiry Info",
  "contactDesc": "Reach out to our admissions office for enrollment guidelines and campus tours."
}'::jsonb;

-- 2. Update default row with default values if empty
UPDATE public.settings
SET 
  "sectionOrder" = COALESCE("sectionOrder", '["hero","stats","portals","programs","features","adBanner","about","toppers","boardResults","teachers","events","gallery","testimonials","faq","contact"]'::jsonb),
  "sectionVisibility" = COALESCE("sectionVisibility", '{"hero":true,"stats":true,"portals":true,"programs":true,"features":true,"adBanner":true,"about":true,"toppers":true,"boardResults":true,"teachers":true,"events":true,"gallery":true,"testimonials":true,"faq":true,"contact":true}'::jsonb)
WHERE id = 1;
