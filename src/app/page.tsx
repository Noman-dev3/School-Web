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
import { HeroStats } from "@/components/hero-stats";
import { NoticeTicker } from "@/components/notice-ticker";
import { QuickPortalGrid } from "@/components/quick-portal-grid";
import TeachersSection from "@/components/teachers-section";
import TestimonialsSection from "@/components/testimonials-section";
import ToppersSection from "@/components/toppers-section";
import { getBoardStudents, getEvents, getFaqs, getGalleryItems, getSettings, getTeachers, getTestimonials, getToppers } from "@/lib/data-fetching";
import { hero } from "@/lib/data";

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

  const aboutContent = {
    description: settings.ourStory,
    imageUrl: settings.aboutImageUrl,
  };

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
  };

  const heroTaglines = Array.isArray(settings.heroTaglines) && settings.heroTaglines.length > 0 
    ? settings.heroTaglines 
    : [
        "Nurturing Academic Excellence & Quranic Ethics",
        "100% Federal Board (FBISE) Pass & Distinction Rate",
        "Empowering Scholars with Modern STEM & Robotics",
      ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Top Admissions & Announcement Notice Bar */}
      <NoticeTicker />

      {/* Floating Top Header Navigation */}
      <Header />

      <div className="flex-grow">
        <main className="flex-1 space-y-12 sm:space-y-16 pb-16">
          {/* Hero Section */}
          <Hero taglines={heroTaglines} />

          {/* Sleek Metrics & Statistics Overlay */}
          <HeroStats />

          {/* Quick Services & Portals Grid */}
          <QuickPortalGrid />

          {/* Educational Levels & Pathways */}
          <AcademicPrograms />

          {/* Why Choose PIISS - Core Pillars */}
          <Features />

          {/* Ad Banner for Events/Notices */}
          <AdBanner />

          {/* School Story & Mission */}
          <AboutSection content={aboutContent} />

          {/* Board Achievers & Star Toppers */}
          <ToppersSection toppers={toppers} />

          {/* FBISE Board Results Table */}
          <BoardResultsSection boardStudents={boardStudents} />

          {/* Faculty & Educators Spotlight */}
          <TeachersSection teachers={teachers.slice(0, 3)} />

          {/* Upcoming School Events & Activities */}
          <EventsSection events={events.slice(0, 3)} />

          {/* School Life Gallery */}
          <GallerySection galleryItems={galleryItems.slice(0, 4)} />

          {/* Parents & Community Testimonials */}
          <TestimonialsSection testimonials={testimonials} />

          {/* Frequently Asked Questions */}
          <FaqSection faqs={faqs} />

          {/* Contact & Inquiry Form */}
          <ContactSection content={contactContent} />
        </main>
      </div>

      <Footer content={footerContent} />
      <BackToTopButton />
    </div>
  );
}
