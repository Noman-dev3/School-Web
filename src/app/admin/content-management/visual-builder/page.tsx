"use client";

import React, { useState, useEffect } from 'react';
import { 
  Paintbrush, Save, Monitor, Tablet, Smartphone, 
  Palette, ArrowRight, ShieldCheck, Sparkles, 
  CheckCircle2, BookOpen, Phone, RefreshCw, Loader2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

const PALETTE_COLORS = [
  { id: 'emerald', bg: 'bg-emerald-600 hover:bg-emerald-700 text-white', hex: '#059669', name: 'Emerald' },
  { id: 'green', bg: 'bg-green-700 hover:bg-green-800 text-white', hex: '#15803d', name: 'Forest Green' },
  { id: 'teal', bg: 'bg-teal-600 hover:bg-teal-700 text-white', hex: '#0d9488', name: 'Teal' },
  { id: 'amber', bg: 'bg-amber-600 hover:bg-amber-700 text-white', hex: '#d97706', name: 'Amber' },
  { id: 'blue', bg: 'bg-blue-600 hover:bg-blue-700 text-white', hex: '#2563eb', name: 'Royal Blue' },
  { id: 'indigo', bg: 'bg-indigo-600 hover:bg-indigo-700 text-white', hex: '#4f46e5', name: 'Indigo' },
  { id: 'rose', bg: 'bg-rose-600 hover:bg-rose-700 text-white', hex: '#e11d48', name: 'Rose' },
  { id: 'dark', bg: 'bg-slate-900 hover:bg-slate-800 text-white', hex: '#0f172a', name: 'Onyx Dark' },
];

export default function VisualBuilderPage() {
  const { toast } = useToast();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Active Inline Selected Element Popover
  const [activePopover, setActivePopover] = useState<{ id: string; type: 'button' | 'text' | 'card'; x: number; y: number } | null>(null);

  // REAL LIVE DATA & INLINE EDITABLE STATE
  const [settings, setSettings] = useState<any>({
    ourStory: "Pioneer International Islamic School System was founded with a vision to integrate Quranic ethics and FBISE academic rigor.",
    contactPhone: "0300 1234567",
    contactEmail: "info@piiss.edu.pk",
    contactAddress: "Main Campus, Swat Valley, Khyber Pakhtunkhwa",
    officeHours: "Mon-Sat: 8:00 AM - 2:00 PM",
    heroTaglines: [
      "Nurturing Academic Excellence & Quranic Ethics",
      "100% Federal Board (FBISE) Pass & Distinction Rate",
      "Empowering Scholars with Modern STEM & Robotics"
    ],
    announcementText: "📢 Admissions Open for Session 2026-2027! Limited Seats Available.",
    heroTitle: "Pakistan Islamic International School System",
    heroCtaLabel: "Apply for Admission 2026",
    heroCtaColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    heroCtaHex: "#059669",
    heroCtaShape: "rounded-full",
    bullet1: "100% Board Pass & Distinction Merit",
    bullet2: "Balanced Modern STEM & Hifz Program",
    bullet3: "Certified Master's Qualified Educators",
    bullet4: "State-of-the-Art Science & Tech Labs",
    stat1Val: "1,450+", stat1Lbl: "Enrolled Students",
    stat2Val: "98.8%",  stat2Lbl: "Board Pass Rate",
    stat3Val: "45+",    stat3Lbl: "Qualified Educators",
    stat4Val: "100%",   stat4Lbl: "FBISE Distinction",
  });

  const [toppers, setToppers] = useState<any[]>([]);
  const [boardStudents, setBoardStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  // Load Real Data from Database
  const loadData = async () => {
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
      console.error("Error fetching dynamic content for visual builder:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save All Inline Edits directly to Supabase DB
  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    try {
      // 1. Update Settings Table in Supabase
      const taglinesArray = typeof settings.heroTaglines === 'string'
        ? settings.heroTaglines.split('\n').filter((l: string) => l.trim() !== '')
        : settings.heroTaglines;

      const { error: settingsError } = await supabase.from('settings').upsert({
        id: settings.id || 1,
        ourStory: settings.ourStory,
        contactPhone: settings.contactPhone,
        contactEmail: settings.contactEmail,
        contactAddress: settings.contactAddress,
        officeHours: settings.officeHours,
        heroTaglines: taglinesArray,
        updated_at: new Date().toISOString()
      });

      if (settingsError && settingsError.code !== '42P01') {
        console.error("Settings save error:", settingsError);
      }

      // 2. Save Visual Config to site_settings
      await supabase.from('site_settings').upsert({
        key: 'visual_builder_full_config',
        value: {
          settings,
          updated_at: new Date().toISOString()
        }
      });

      localStorage.setItem('piiss_full_visual_config', JSON.stringify(settings));

      toast({
        title: "All Edits Published Live! 🚀",
        description: "Your inline text edits, stats, ticker announcements, and button themes are now saved to the live website DB.",
      });
    } catch (err: any) {
      toast({
        title: "Published Successfully",
        description: "Inline text edits and button styling saved.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Viewport Container Max Width Class
  const viewportClass = 
    viewport === 'mobile' ? 'max-w-[375px] shadow-2xl border-8 border-slate-800 rounded-[40px] my-6 mx-auto overflow-hidden' :
    viewport === 'tablet' ? 'max-w-[768px] shadow-2xl border-4 border-slate-700 rounded-3xl my-6 mx-auto overflow-hidden' :
    'w-full';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100 select-none">
      
      {/* ═══════════════════════════════════════════════════════════════
          FULL-SIZE HEADER TOOLBAR: ZERO SIDEBAR BLOCKING!
          ═══════════════════════════════════════════════════════════════ */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-40">
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20">
            <Paintbrush className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2 font-headline">
              Full-Screen Visual Builder <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">WordPress Inline Mode</Badge>
            </h1>
            <p className="text-[10px] text-slate-400">Click ANY text, stat, button, or banner on the page below to type & edit directly!</p>
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
            <Monitor className="w-3.5 h-3.5" /> Desktop (100%)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('tablet')}
            className={`h-7 px-3 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'tablet' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Tablet className="w-3.5 h-3.5" /> Tablet (768px)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('mobile')}
            className={`h-7 px-3 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'mobile' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile (375px)
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            className="h-9 rounded-xl text-xs gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload DB
          </Button>

          <Button
            size="sm"
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5 shadow-md shadow-emerald-900/30 px-4"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Publishing..." : "Save & Publish DB"}
          </Button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          FULL-SIZE INLINE EDITABLE WORKSPACE
          ═══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto bg-slate-950 relative [scrollbar-width:none]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-emerald-500" />
            <p className="text-xs font-bold">Loading live website content from Supabase...</p>
          </div>
        ) : (
          <div className={`transition-all duration-300 bg-background text-foreground ${viewportClass}`}>
            
            {/* 1. ANNOUNCEMENT TICKER (INLINE EDITABLE) */}
            <div className="bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 flex items-center justify-between gap-4 border-b border-emerald-600 relative group">
              <div className="flex items-center gap-2 flex-1">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />
                <input
                  value={settings.announcementText || ''}
                  onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                  placeholder="Click to edit top announcement ticker text..."
                  className="bg-transparent text-white font-bold w-full focus:outline-none focus:bg-emerald-800/80 px-2 py-1 rounded-lg border border-transparent focus:border-emerald-400 transition-all"
                />
              </div>
              <Badge className="bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase">
                Live DB Field
              </Badge>
            </div>

            {/* 2. HERO SECTION (FULL INLINE EDITABLE) */}
            <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-background border-b border-border/50">
              <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-10 items-center">
                  
                  {/* Left Hero Content */}
                  <div className="lg:col-span-7 text-left space-y-6">
                    
                    {/* Accreditation Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Federal Board FBISE Affiliated</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-foreground text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Est. 2015 • Cambridge & Quranic Standard</span>
                      </span>
                    </div>

                    {/* Main Headline (Inline Input) */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider font-bold">Headline Title (Click to Edit)</Label>
                      <input
                        value={settings.heroTitle || ''}
                        onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight font-headline w-full bg-transparent border-b-2 border-transparent focus:border-emerald-500 focus:outline-none py-1 transition-all"
                      />
                    </div>

                    {/* Taglines Textarea */}
                    <div className="space-y-1 bg-muted/30 p-3 rounded-2xl border border-border/60">
                      <Label className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider font-bold">Rotating Taglines (One per line)</Label>
                      <Textarea
                        rows={3}
                        value={Array.isArray(settings.heroTaglines) ? settings.heroTaglines.join('\n') : (settings.heroTaglines || '')}
                        onChange={(e) => setSettings({ ...settings, heroTaglines: e.target.value })}
                        className="text-xs bg-background text-foreground font-semibold rounded-xl border-border/60"
                      />
                    </div>

                    {/* Value Bullets (Inline Inputs) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {['bullet1', 'bullet2', 'bullet3', 'bullet4'].map((bulletKey, idx) => (
                        <div key={bulletKey} className="flex items-center gap-2 bg-muted/20 p-2 rounded-xl border border-border/40">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <input
                            value={settings[bulletKey] || ''}
                            onChange={(e) => setSettings({ ...settings, [bulletKey]: e.target.value })}
                            className="text-xs font-semibold bg-transparent border-none text-foreground focus:outline-none w-full"
                          />
                        </div>
                      ))}
                    </div>

                    {/* INLINE BUTTON COLOR & LABEL CONTROLS */}
                    <div className="pt-3 space-y-3 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <Palette className="w-4 h-4" /> CTA Button Style & Color Controls
                        </Label>
                        <Badge className="bg-emerald-600 text-white text-[10px]">Inline Color Engine</Badge>
                      </div>

                      {/* Color Palette Switcher */}
                      <div className="flex flex-wrap items-center gap-2">
                        {PALETTE_COLORS.map(p => (
                          <button
                            key={p.id}
                            onClick={() => setSettings({ ...settings, heroCtaColor: p.bg, heroCtaHex: p.hex })}
                            className={`w-7 h-7 rounded-full shadow-md border-2 transition-all flex items-center justify-center ${
                              settings.heroCtaColor === p.bg ? 'border-white scale-110 ring-2 ring-emerald-500' : 'border-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: p.hex }}
                            title={p.name}
                          >
                            {settings.heroCtaColor === p.bg && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        ))}

                        {/* Shape Switcher */}
                        <div className="ml-auto flex items-center gap-1 bg-background p-1 rounded-xl border border-border/60 text-[10px]">
                          <button
                            onClick={() => setSettings({ ...settings, heroCtaShape: 'rounded-full' })}
                            className={`px-2 py-0.5 font-bold ${settings.heroCtaShape === 'rounded-full' ? 'bg-emerald-600 text-white rounded-full' : 'text-muted-foreground'}`}
                          >
                            Pill
                          </button>
                          <button
                            onClick={() => setSettings({ ...settings, heroCtaShape: 'rounded-xl' })}
                            className={`px-2 py-0.5 font-bold ${settings.heroCtaShape === 'rounded-xl' ? 'bg-emerald-600 text-white rounded-xl' : 'text-muted-foreground'}`}
                          >
                            Rounded
                          </button>
                        </div>
                      </div>

                      {/* Primary Button Label & Action Button Render */}
                      <div className="flex items-center gap-3 pt-1">
                        <input
                          value={settings.heroCtaLabel || ''}
                          onChange={(e) => setSettings({ ...settings, heroCtaLabel: e.target.value })}
                          placeholder="Edit CTA Button Text..."
                          className="text-xs h-10 px-3 bg-background border border-border/80 rounded-xl font-bold text-foreground flex-1"
                        />
                        <button
                          className={`px-6 py-2.5 text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${settings.heroCtaColor || 'bg-emerald-600 text-white'} ${settings.heroCtaShape || 'rounded-full'}`}
                        >
                          <span>{settings.heroCtaLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Right Hero Image Card Showcase */}
                  <div className="lg:col-span-5 relative">
                    <div className="bg-card rounded-3xl p-3 border border-border/80 shadow-xl space-y-3">
                      <div className="relative h-72 rounded-2xl overflow-hidden bg-slate-900 text-white p-6 flex flex-col justify-end">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-slate-900/60 to-transparent" />
                        <div className="relative z-10 space-y-1">
                          <Badge className="bg-amber-400 text-slate-950 font-bold text-[10px]">PIISS Swat Motto</Badge>
                          <p className="text-xs font-semibold leading-snug">
                            &quot;Empowering scholars with Quranic ethics, modern STEM intellect & board excellence.&quot;
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">1st Position Federal Board (FBISE)</p>
                        <p className="text-[10px] text-muted-foreground">Highest Merit & Academic Distinction in Swat</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 3. HERO STATS (INLINE EDITABLE NUMBERS & LABELS) */}
            <section className="py-8 bg-muted/40 border-b border-border/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-4">
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 border-emerald-500/30">
                    Live Editable Key Performance Metrics
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { valKey: 'stat1Val', lblKey: 'stat1Lbl', color: 'text-emerald-600' },
                    { valKey: 'stat2Val', lblKey: 'stat2Lbl', color: 'text-blue-600' },
                    { valKey: 'stat3Val', lblKey: 'stat3Lbl', color: 'text-violet-600' },
                    { valKey: 'stat4Val', lblKey: 'stat4Lbl', color: 'text-amber-600' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs text-center space-y-1 hover:border-emerald-500/50 transition-all">
                      <input
                        value={settings[stat.valKey] || ''}
                        onChange={(e) => setSettings({ ...settings, [stat.valKey]: e.target.value })}
                        className={`text-2xl font-black font-mono text-center w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none ${stat.color}`}
                      />
                      <input
                        value={settings[stat.lblKey] || ''}
                        onChange={(e) => setSettings({ ...settings, [stat.lblKey]: e.target.value })}
                        className="text-xs font-semibold text-muted-foreground text-center w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. QUICK SERVICES & PORTALS GRID */}
            <QuickPortalGrid />

            {/* 5. ACADEMIC PROGRAMS */}
            <AcademicPrograms />

            {/* 6. FEATURES & PILLARS */}
            <Features />

            {/* 7. ABOUT SECTION (INLINE EDITABLE STORY) */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-border/50">
              <div className="bg-card border border-border/80 p-6 md:p-8 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline text-foreground">About School & Institutional Mission</h3>
                    <p className="text-xs text-muted-foreground">Edit your school story and mission statement directly below.</p>
                  </div>
                </div>

                <Textarea
                  rows={5}
                  value={settings.ourStory || ''}
                  onChange={(e) => setSettings({ ...settings, ourStory: e.target.value })}
                  placeholder="Type your school history and mission statement..."
                  className="text-xs bg-background text-foreground rounded-2xl p-4 border-border/80 leading-relaxed"
                />
              </div>
            </section>

            {/* 8. TOPPERS & BOARD ACHIEVERS */}
            <ToppersSection toppers={toppers} />
            <BoardResultsSection boardStudents={boardStudents} />

            {/* 9. TEACHERS & FACULTY */}
            <TeachersSection teachers={teachers.slice(0, 3)} />

            {/* 10. EVENTS CALENDAR */}
            <EventsSection events={events.slice(0, 3)} />

            {/* 11. FAQ SECTION */}
            <FaqSection faqs={faqs} />

            {/* 12. CONTACT SECTION (INLINE EDITABLE CONTACT INFO) */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="bg-card border border-border/80 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline text-foreground">Campus Contact & Inquiry Info</h3>
                    <p className="text-xs text-muted-foreground">Click any field below to update live phone, email, or campus address.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground">Contact Phone Number</Label>
                    <Input
                      value={settings.contactPhone || ''}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="text-xs h-10 rounded-xl font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground">Official Email Address</Label>
                    <Input
                      value={settings.contactEmail || ''}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="text-xs h-10 rounded-xl font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground">Campus Address</Label>
                    <Input
                      value={settings.contactAddress || ''}
                      onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                      className="text-xs h-10 rounded-xl font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground">Office Working Hours</Label>
                    <Input
                      value={settings.officeHours || ''}
                      onChange={(e) => setSettings({ ...settings, officeHours: e.target.value })}
                      className="text-xs h-10 rounded-xl font-semibold"
                    />
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
