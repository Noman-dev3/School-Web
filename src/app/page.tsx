import React from "react";
import AboutSection from "@/components/about-section";
import { AcademicPrograms } from "@/components/academic-programs";
import { AdBanner } from "@/components/ad-banner";
import { BackToTopButton } from "@/components/back-to-top-button";
import BoardResultsSection from "@/components/board-results-section";
import ContactSection from "@/components/contact-section";
import EventsSection from "@/components/events-section";
import FaqSection from "@/components/faq-section";
import { Features } from "@/components/features";
import Footer from "@/components/footer";
import GallerySection from "@/components/gallery-section";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { NoticeTicker } from "@/components/notice-ticker";
import { QuickPortalGrid } from "@/components/quick-portal-grid";
import TeachersSection from "@/components/teachers-section";
import TestimonialsSection from "@/components/testimonials-section";
import ToppersSection from "@/components/toppers-section";
import { 
  getBoardStudents, getEvents, getFaqs, getGalleryItems, 
  getSettings, getTeachers, getTestimonials, getToppers 
} from "@/lib/data-fetching";

export default async function Home() {
  // Fetch all data on the server in parallel
  const [
    settings,
    toppers,
    boardStudents,
    teachers,
    events,
    galleryItems,
    testimonials,
    faqs
  ] = await Promise.all([
    getSettings(),
    getToppers(),
    getBoardStudents(),
    getTeachers(),
    getEvents(),
    getGalleryItems(),
    getTestimonials(),
    getFaqs()
  ]);

  const contactContent = {
    address: settings.contactAddress || "",
    phone: settings.contactPhone || "",
    email: settings.contactEmail || "",
    officeHours: settings.officeHours || "",
  };

  const footerContent = {
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    linkedinUrl: settings.linkedinUrl,
    twitterUrl: settings.twitterUrl,
    logoUrl: settings.logoUrl,
    schoolName: settings.schoolName,
    ourStory: settings.ourStory,
  };

  const heroTaglines = Array.isArray(settings.heroTaglines) && settings.heroTaglines.length > 0 
    ? settings.heroTaglines 
    : [
        "Nurturing Academic Excellence & Quranic Ethics",
        "100% Federal Board (FBISE) Pass & Distinction Rate",
        "Empowering Scholars with Modern STEM & Robotics",
      ];

  const sectionOrder: string[] = (settings.sectionOrder || [
    "hero", "portals", "programs", "features", "adBanner", 
    "about", "toppers", "boardResults", "teachers", "events", "gallery", 
    "testimonials", "faq", "contact"
  ]).filter((id: string) => id !== 'stats');

  const sectionVisibility: Record<string, boolean> = settings.sectionVisibility || {};

  // Map section IDs to their corresponding JSX elements
  const sectionMap: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" taglines={heroTaglines} settings={settings} />,
    portals: <QuickPortalGrid key="portals" />,
    programs: <AcademicPrograms key="programs" />,
    features: <Features key="features" />,
    adBanner: <AdBanner key="adBanner" />,
    about: <AboutSection key="about" content={settings} />,
    toppers: <ToppersSection key="toppers" toppers={toppers} />,
    boardResults: <BoardResultsSection key="boardResults" boardStudents={boardStudents} />,
    teachers: <TeachersSection key="teachers" teachers={teachers.slice(0, 3)} />,
    events: <EventsSection key="events" events={events.slice(0, 3)} />,
    gallery: <GallerySection key="gallery" galleryItems={galleryItems.slice(0, 4)} />,
    testimonials: <TestimonialsSection key="testimonials" testimonials={testimonials} />,
    faq: <FaqSection key="faq" faqs={faqs} />,
    contact: <ContactSection key="contact" content={contactContent} />,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Top Admissions & Announcement Notice Bar */}
      <NoticeTicker text={settings.noticeText} link={settings.noticeLink} />

      {/* Floating Top Header Navigation */}
      <Header settings={settings} />

      <div className="flex-grow">
        <main className="flex-1 space-y-12 sm:space-y-16 pb-16">
          {sectionOrder.map((sectionId) => {
            // Check if section is visible (default true, stats false)
            const isVisible = sectionId !== 'stats' && sectionVisibility[sectionId] !== false;
            if (!isVisible) return null;
            return sectionMap[sectionId] || null;
          })}
        </main>
      </div>

      <Footer content={footerContent} />
      <BackToTopButton />
    </div>
  );
}
