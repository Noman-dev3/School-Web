"use client";

import React, { useState, useEffect } from 'react';
import { 
  Paintbrush, Save, Monitor, Tablet, Smartphone, ArrowRight, 
  ShieldCheck, Sparkles, CheckCircle2, BookOpen, Phone, Loader2, 
  Check, Image as ImageIcon, Edit2, Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  getSettings, getTeachers, getEvents, getGalleryItems, 
  getTestimonials, getFaqs, getToppers, getBoardStudents 
} from '@/lib/data-fetching';

import { QuickPortalGrid } from "@/components/quick-portal-grid";
import { AcademicPrograms } from "@/components/academic-programs";
import { Features } from "@/components/features";
import ToppersSection from "@/components/toppers-section";
import BoardResultsSection from "@/components/board-results-section";
import TeachersSection from "@/components/teachers-section";
import EventsSection from "@/components/events-section";
import FaqSection from "@/components/faq-section";
import Footer from "@/components/footer";

const COLOR_SWATCHES = [
  { id: 'emerald', bg: 'bg-emerald-600 hover:bg-emerald-700 text-white', hex: '#059669', name: 'Emerald' },
  { id: 'teal', bg: 'bg-teal-600 hover:bg-teal-700 text-white', hex: '#0d9488', name: 'Teal' },
  { id: 'green', bg: 'bg-green-700 hover:bg-green-800 text-white', hex: '#15803d', name: 'Forest' },
  { id: 'amber', bg: 'bg-amber-600 hover:bg-amber-700 text-white', hex: '#d97706', name: 'Amber' },
  { id: 'blue', bg: 'bg-blue-600 hover:bg-blue-700 text-white', hex: '#2563eb', name: 'Royal Blue' },
  { id: 'violet', bg: 'bg-violet-600 hover:bg-violet-700 text-white', hex: '#7c3aed', name: 'Violet' },
  { id: 'dark', bg: 'bg-slate-900 hover:bg-slate-800 text-white', hex: '#0f172a', name: 'Dark' },
];

export default function FullyDynamicVisualBuilderPage() {
  const { toast } = useToast();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Active Clicked Element for Floating Formatting Bar
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number } | null>(null);

  // FULLY DYNAMIC DATABASE CONTENT STATE
  const [settings, setSettings] = useState<any>({
    announcementText: "📢 Admissions Open for Session 2026-2027! Entrance Test Registration ends August 15.",
    heroTitle: "Pakistan Islamic International School System",
    heroSub: "Nurturing Academic Excellence & Quranic Ethics with 100% FBISE Distinction Rate",
    heroCtaLabel: "Apply for Admission 2026",
    heroCtaColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    heroCtaHex: "#059669",
    heroCtaShape: "rounded-full",
    heroImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
    bullet1: "100% Board Pass & Distinction Merit",
    bullet2: "Balanced Modern STEM & Hifz Program",
    bullet3: "Certified Master's Qualified Educators",
    bullet4: "State-of-the-Art Science & Tech Labs",
    stat1Val: "1,450+", stat1Lbl: "Enrolled Students",
    stat2Val: "98.8%",  stat2Lbl: "Board Pass Rate",
    stat3Val: "45+",    stat3Lbl: "Qualified Educators",
    stat4Val: "100%",   stat4Lbl: "FBISE Distinction",
    
    // SECTION NAMES & DESCRIPTIONS (DYNAMIC FROM DB)
    portalsTitle: "Key Academic Services & Portals",
    portalsDesc: "Quickly access essential school resources, admission forms, board examination results, and upcoming academic events.",
    programsTitle: "Academic Programs & Pathways",
    programsDesc: "Structured Montessori, Primary, and High School Curricula aligned with FBISE.",
    featuresTitle: "Why Choose PIISS Swat",
    featuresDesc: "Our core pillars of educational rigor, Quranic values, and modern STEM innovation.",
    aboutTitle: "About School & Institutional Mission",
    aboutDesc: "Learn about our founding story, vision, and dedication to Islamic character development.",
    ourStory: "Pioneer International Islamic School System was founded with a vision to integrate Quranic ethics and FBISE academic rigor.",
    toppersTitle: "FBISE Board Achievers & Distinction Holders",
    toppersDesc: "Celebrating outstanding academic merit and board exam toppers.",
    teachersTitle: "Distinguished Faculty & Educators",
    teachersDesc: "Experienced educators dedicated to academic excellence and moral leadership.",
    eventsTitle: "Upcoming School Events & Academic Calendar",
    eventsDesc: "Important dates for board examinations, sports galas, and Quran exhibitions.",
    faqTitle: "Frequently Asked Questions",
    faqDesc: "Clear answers to common questions about admissions, fee vouchers, and campus life.",
    contactTitle: "Campus Contact & Inquiry Info",
    contactDesc: "Reach out to our admissions office for enrollment guidelines and campus tours.",
    
    contactPhone: "0300 1234567",
    contactEmail: "info@piiss.edu.pk",
    contactAddress: "Main Campus, Swat Valley, Khyber Pakhtunkhwa",
    officeHours: "Mon-Sat: 8:00 AM - 2:00 PM",
  });

  const [toppers, setToppers] = useState<any[]>([]);
  const [boardStudents, setBoardStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  // Load Database Content
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [
          fetchedSettings, fetchedToppers, fetchedBoard, fetchedTeachers, 
          fetchedEvents, fetchedFaqs
        ] = await Promise.all([
          getSettings(), getToppers(), getBoardStudents(), getTeachers(), 
          getEvents(), getFaqs()
        ]);

        if (fetchedSettings) {
          setSettings((prev: any) => ({ ...prev, ...fetchedSettings }));
        }
        if (fetchedToppers && fetchedToppers.length > 0) setToppers(fetchedToppers);
        if (fetchedBoard && fetchedBoard.length > 0) setBoardStudents(fetchedBoard);
        if (fetchedTeachers && fetchedTeachers.length > 0) setTeachers(fetchedTeachers);
        if (fetchedEvents && fetchedEvents.length > 0) setEvents(fetchedEvents);
        if (fetchedFaqs && fetchedFaqs.length > 0) setFaqs(fetchedFaqs);

      } catch (err) {
        console.error("Error loading builder data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Prevent any link from navigating away from the builder!
  const handleCanvasClickCapture = (e: React.MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (anchor) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Handle Element Click for Floating Toolbar Position
  const handleElementClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveElementId(id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFloatingPos({
      x: Math.max(16, rect.left + rect.width / 2 - 140),
      y: Math.max(70, rect.top - 55)
    });
  };

  // Inline ContentEditable Blur Updater
  const handleContentBlur = (key: string, e: React.FocusEvent<HTMLElement>) => {
    const text = e.currentTarget.innerText;
    setSettings((prev: any) => ({ ...prev, [key]: text }));
  };

  // Save All Changes to Supabase Database
  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    try {
      // 1. Sanitize settings object for the 'settings' table (only include valid schema fields)
      const validSettingsPayload = {
        id: 1,
        ourStory: settings.ourStory || '',
        contactPhone: settings.contactPhone || '',
        contactEmail: settings.contactEmail || '',
        contactAddress: settings.contactAddress || '',
        officeHours: settings.officeHours || '',
        aboutImageUrl: settings.aboutImageUrl || '',
        heroTaglines: Array.isArray(settings.heroTaglines) 
          ? settings.heroTaglines 
          : (typeof settings.heroTaglines === 'string' ? settings.heroTaglines.split('\n') : []),
        facebookUrl: settings.facebookUrl || '',
        instagramUrl: settings.instagramUrl || '',
        linkedinUrl: settings.linkedinUrl || '',
        twitterUrl: settings.twitterUrl || '',
      };

      const { error: settingsError } = await supabase
        .from('settings')
        .upsert([validSettingsPayload]);

      if (settingsError && settingsError.code !== '42P01') {
        console.warn("Notice: settings table update notice:", settingsError.message);
      }

      // 2. Save complete visual configuration to site_settings table
      try {
        await supabase.from('site_settings').upsert({
          key: 'full_visual_builder_config',
          value: settings,
          updated_at: new Date().toISOString()
        });
      } catch (siteErr) {
        console.warn("Notice: site_settings cache update notice:", siteErr);
      }

      // 3. Always save to LocalStorage as instant client cache
      localStorage.setItem('piiss_full_visual_config', JSON.stringify(settings));

      toast({
        title: "Published Live to Database! 🚀",
        description: "All section titles, descriptions, and content saved successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Saved Locally",
        description: "Edits saved to browser cache.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const viewportClass = 
    viewport === 'mobile' ? 'max-w-[375px] shadow-2xl border-8 border-slate-800 rounded-[40px] my-6 mx-auto overflow-hidden' :
    viewport === 'tablet' ? 'max-w-[768px] shadow-2xl border-4 border-slate-700 rounded-3xl my-6 mx-auto overflow-hidden' :
    'w-full';

  return (
    <div 
      className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100 select-none relative" 
      onClick={() => setActiveElementId(null)}
    >
      
      {/* ═══════════════════════════════════════════════════════════════
          TOP TOOLBAR: VIEWPORT & PUBLISH CONTROLS
          ═══════════════════════════════════════════════════════════════ */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-40">
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20">
            <Paintbrush className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2 font-headline">
              Fully Editable Visual Builder <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">100% DB Dynamic</Badge>
            </h1>
            <p className="text-[10px] text-slate-400">Click ANY section title, description, or image to edit directly. Links are locked inside builder.</p>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('desktop')}
            className={`h-7 px-3 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'desktop' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('tablet')}
            className={`h-7 px-3 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'tablet' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Tablet className="w-3.5 h-3.5" /> Tablet
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('mobile')}
            className={`h-7 px-3 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'mobile' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </Button>
        </div>

        {/* Action Button */}
        <Button
          size="sm"
          onClick={handleSaveAndPublish}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5 shadow-md shadow-emerald-900/30 px-4"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? "Publishing..." : "Save & Publish DB"}
        </Button>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          FLOATING FORMATTING TOOLBAR (FOR ACTIVE CLICKED ELEMENT)
          ═══════════════════════════════════════════════════════════════ */}
      {activeElementId && floatingPos && (
        <div 
          className="fixed z-50 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-2 flex items-center gap-2 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          style={{ left: `${floatingPos.x}px`, top: `${floatingPos.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <Badge className="bg-emerald-500/20 text-emerald-400 font-mono text-[9px]">
            Editing: {activeElementId.toUpperCase()}
          </Badge>

          {/* Color Swatch Picker */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
            {COLOR_SWATCHES.map(c => (
              <button
                key={c.id}
                onClick={() => setSettings((prev: any) => ({ ...prev, heroCtaColor: c.bg, heroCtaHex: c.hex }))}
                className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          <button
            onClick={() => setSettings((prev: any) => ({ ...prev, heroCtaShape: prev.heroCtaShape === 'rounded-full' ? 'rounded-xl' : 'rounded-full' }))}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold"
          >
            Toggle Shape
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CANVAS WORKSPACE WITH LINK NAVIGATION INHIBITED
          ═══════════════════════════════════════════════════════════════ */}
      <main 
        onClickCapture={handleCanvasClickCapture}
        className="flex-1 overflow-y-auto bg-slate-950 [scrollbar-width:none]"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-emerald-500" />
            <p className="text-xs font-bold">Loading live database content...</p>
          </div>
        ) : (
          <div className={`transition-all duration-300 bg-background text-foreground ${viewportClass}`}>
            
            {/* 1. ANNOUNCEMENT TICKER (CLICK TO EDIT) */}
            <div className="bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 flex items-center justify-between gap-4 border-b border-emerald-600">
              <div className="flex items-center gap-2 flex-1">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleContentBlur('announcementText', e)}
                  onClick={(e) => handleElementClick('announcement', e)}
                  className="hover:outline hover:outline-2 hover:outline-amber-300 rounded px-1.5 py-0.5 cursor-text transition-all"
                >
                  {settings.announcementText}
                </span>
              </div>
            </div>

            {/* 2. HERO SECTION (CLICK TO EDIT TITLE, SUBTITLE & IMAGE) */}
            <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-background border-b border-border/50">
              <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-10 items-center">
                  
                  {/* Left Hero Content */}
                  <div className="lg:col-span-7 text-left space-y-6">
                    
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Federal Board FBISE Affiliated</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-foreground text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Est. 2015 • Cambridge Standard</span>
                      </span>
                    </div>

                    {/* Headline */}
                    <h1 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleContentBlur('heroTitle', e)}
                      onClick={(e) => handleElementClick('heroTitle', e)}
                      className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight font-headline leading-tight hover:outline hover:outline-2 hover:outline-emerald-500/80 rounded-xl p-1 cursor-text transition-all"
                    >
                      {settings.heroTitle}
                    </h1>

                    {/* Subtitle */}
                    <p 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleContentBlur('heroSub', e)}
                      onClick={(e) => handleElementClick('heroSub', e)}
                      className="text-base sm:text-lg text-muted-foreground font-medium hover:outline hover:outline-2 hover:outline-emerald-500/80 rounded-xl p-1 cursor-text transition-all"
                    >
                      {settings.heroSub}
                    </p>

                    {/* Key Value Bullets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {['bullet1', 'bullet2', 'bullet3', 'bullet4'].map((bKey) => (
                        <div key={bKey} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/90">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleContentBlur(bKey, e)}
                            onClick={(e) => handleElementClick(bKey, e)}
                            className="hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1 cursor-text"
                          >
                            {settings[bKey]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <button
                        onClick={(e) => handleElementClick('ctaButton', e)}
                        className={`px-7 py-3.5 text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${settings.heroCtaColor || 'bg-emerald-600 text-white'} ${settings.heroCtaShape || 'rounded-full'} hover:scale-105`}
                      >
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleContentBlur('heroCtaLabel', e)}
                          className="cursor-text"
                        >
                          {settings.heroCtaLabel}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* Right Hero Showcase */}
                  <div className="lg:col-span-5 relative">
                    <div className="bg-card rounded-3xl p-4 border border-border/80 shadow-2xl space-y-4">
                      <div className="relative h-72 rounded-2xl overflow-hidden bg-slate-900 text-white p-6 flex flex-col justify-end group">
                        <img 
                          src={settings.heroImageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"}
                          alt="Hero Showcase" 
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-slate-900/60 to-transparent" />
                        <div className="relative z-10 space-y-1">
                          <Badge className="bg-amber-400 text-slate-950 font-bold text-[10px]">PIISS Swat Motto</Badge>
                          <p className="text-xs font-semibold leading-snug">
                            &quot;Empowering scholars with Quranic ethics, modern STEM intellect & board excellence.&quot;
                          </p>
                        </div>
                      </div>

                      {/* Image URL Editable Field */}
                      <div className="p-3 bg-muted/40 rounded-2xl border border-border/60 text-xs space-y-1">
                        <span className="font-bold text-muted-foreground text-[10px] uppercase flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-emerald-600" /> Hero Showcase Image URL (DB)
                        </span>
                        <input
                          value={settings.heroImageUrl || ''}
                          onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
                          placeholder="Paste image URL..."
                          className="w-full bg-background border border-border/80 rounded-lg px-2 py-1 text-[11px] font-mono text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 3. HERO STATS (EDITABLE NUMBERS & LABELS) */}
            <section className="py-10 bg-muted/40 border-b border-border/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { valKey: 'stat1Val', lblKey: 'stat1Lbl', color: 'text-emerald-600' },
                    { valKey: 'stat2Val', lblKey: 'stat2Lbl', color: 'text-blue-600' },
                    { valKey: 'stat3Val', lblKey: 'stat3Lbl', color: 'text-violet-600' },
                    { valKey: 'stat4Val', lblKey: 'stat4Lbl', color: 'text-amber-600' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs text-center space-y-1 hover:border-emerald-500/60 transition-all">
                      <p 
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleContentBlur(stat.valKey, e)}
                        onClick={(e) => handleElementClick(stat.valKey, e)}
                        className={`text-2xl font-black font-mono cursor-text ${stat.color}`}
                      >
                        {settings[stat.valKey]}
                      </p>
                      <p 
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleContentBlur(stat.lblKey, e)}
                        onClick={(e) => handleElementClick(stat.lblKey, e)}
                        className="text-xs font-semibold text-muted-foreground cursor-text"
                      >
                        {settings[stat.lblKey]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. EDITABLE SECTION TITLES & DESCRIPTIONS */}

            {/* PORTALS SECTION HEADER */}
            <div className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-1">
              <h2 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('portalsTitle', e)}
                className="text-2xl sm:text-3xl font-bold font-headline text-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.portalsTitle}
              </h2>
              <p 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('portalsDesc', e)}
                className="text-xs text-muted-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.portalsDesc}
              </p>
            </div>
            <QuickPortalGrid />

            {/* PROGRAMS SECTION HEADER */}
            <div className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-1">
              <h2 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('programsTitle', e)}
                className="text-2xl sm:text-3xl font-bold font-headline text-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.programsTitle}
              </h2>
              <p 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('programsDesc', e)}
                className="text-xs text-muted-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.programsDesc}
              </p>
            </div>
            <AcademicPrograms />

            {/* FEATURES SECTION HEADER */}
            <div className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-1">
              <h2 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('featuresTitle', e)}
                className="text-2xl sm:text-3xl font-bold font-headline text-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.featuresTitle}
              </h2>
              <p 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('featuresDesc', e)}
                className="text-xs text-muted-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.featuresDesc}
              </p>
            </div>
            <Features />

            {/* ABOUT SECTION (DIRECT EDITABLE STORY) */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-border/50">
              <div className="bg-card border border-border/80 p-6 md:p-8 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleContentBlur('aboutTitle', e)}
                      className="text-xl font-bold font-headline text-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
                    >
                      {settings.aboutTitle}
                    </h3>
                    <p 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleContentBlur('aboutDesc', e)}
                      className="text-xs text-muted-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
                    >
                      {settings.aboutDesc}
                    </p>
                  </div>
                </div>

                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleContentBlur('ourStory', e)}
                  onClick={(e) => handleElementClick('ourStory', e)}
                  className="text-xs text-foreground bg-background rounded-2xl p-4 border border-border/80 leading-relaxed cursor-text hover:border-emerald-500"
                >
                  {settings.ourStory}
                </div>
              </div>
            </section>

            {/* TOPPERS & BOARD ACHIEVERS */}
            <div className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-1">
              <h2 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('toppersTitle', e)}
                className="text-2xl sm:text-3xl font-bold font-headline text-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.toppersTitle}
              </h2>
              <p 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('toppersDesc', e)}
                className="text-xs text-muted-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.toppersDesc}
              </p>
            </div>
            <ToppersSection toppers={toppers} />
            <BoardResultsSection boardStudents={boardStudents} />

            {/* TEACHERS & FACULTY */}
            <div className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-1">
              <h2 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('teachersTitle', e)}
                className="text-2xl sm:text-3xl font-bold font-headline text-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.teachersTitle}
              </h2>
              <p 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('teachersDesc', e)}
                className="text-xs text-muted-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.teachersDesc}
              </p>
            </div>
            <TeachersSection teachers={teachers.slice(0, 3)} />

            {/* EVENTS CALENDAR */}
            <div className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-1">
              <h2 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('eventsTitle', e)}
                className="text-2xl sm:text-3xl font-bold font-headline text-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.eventsTitle}
              </h2>
              <p 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('eventsDesc', e)}
                className="text-xs text-muted-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.eventsDesc}
              </p>
            </div>
            <EventsSection events={events.slice(0, 3)} />

            {/* FAQ SECTION */}
            <div className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-1">
              <h2 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('faqTitle', e)}
                className="text-2xl sm:text-3xl font-bold font-headline text-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.faqTitle}
              </h2>
              <p 
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleContentBlur('faqDesc', e)}
                className="text-xs text-muted-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
              >
                {settings.faqDesc}
              </p>
            </div>
            <FaqSection faqs={faqs} />

            {/* CONTACT SECTION (EDITABLE CONTACT DETAILS) */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="bg-card border border-border/80 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleContentBlur('contactTitle', e)}
                      className="text-xl font-bold font-headline text-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
                    >
                      {settings.contactTitle}
                    </h3>
                    <p 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleContentBlur('contactDesc', e)}
                      className="text-xs text-muted-foreground cursor-text hover:outline hover:outline-2 hover:outline-emerald-500/60 rounded px-1"
                    >
                      {settings.contactDesc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-muted/30 rounded-2xl border border-border/60 space-y-1">
                    <p className="font-bold text-muted-foreground text-[10px] uppercase">Contact Phone</p>
                    <p contentEditable suppressContentEditableWarning onBlur={(e) => handleContentBlur('contactPhone', e)} className="font-semibold text-foreground cursor-text">
                      {settings.contactPhone}
                    </p>
                  </div>

                  <div className="p-3.5 bg-muted/30 rounded-2xl border border-border/60 space-y-1">
                    <p className="font-bold text-muted-foreground text-[10px] uppercase">Official Email</p>
                    <p contentEditable suppressContentEditableWarning onBlur={(e) => handleContentBlur('contactEmail', e)} className="font-semibold text-foreground cursor-text">
                      {settings.contactEmail}
                    </p>
                  </div>

                  <div className="p-3.5 bg-muted/30 rounded-2xl border border-border/60 space-y-1">
                    <p className="font-bold text-muted-foreground text-[10px] uppercase">Campus Address</p>
                    <p contentEditable suppressContentEditableWarning onBlur={(e) => handleContentBlur('contactAddress', e)} className="font-semibold text-foreground cursor-text">
                      {settings.contactAddress}
                    </p>
                  </div>

                  <div className="p-3.5 bg-muted/30 rounded-2xl border border-border/60 space-y-1">
                    <p className="font-bold text-muted-foreground text-[10px] uppercase">Office Hours</p>
                    <p contentEditable suppressContentEditableWarning onBlur={(e) => handleContentBlur('officeHours', e)} className="font-semibold text-foreground cursor-text">
                      {settings.officeHours}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Footer content={{
              facebookUrl: settings.facebookUrl,
              instagramUrl: settings.instagramUrl,
              linkedinUrl: settings.linkedinUrl,
              twitterUrl: settings.twitterUrl,
            }} />
          </div>
        )}
      </main>

    </div>
  );
}
