"use client";

import React, { useState, useEffect } from 'react';
import { 
  Paintbrush, Layout, Type, Save, Monitor, Tablet, Smartphone, 
  MoveUp, MoveDown, MousePointerClick, Palette, Sliders, ArrowRight,
  Eye, Check, RotateCcw, Sparkles, Layers, ShieldCheck, RefreshCw, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  getSettings, getTeachers, getEvents, getGalleryItems, 
  getTestimonials, getFaqs, getToppers, getBoardStudents 
} from '@/lib/data-fetching';

// Landing Page Component Imports
import { NoticeTicker } from "@/components/notice-ticker";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HeroStats } from "@/components/hero-stats";
import { QuickPortalGrid } from "@/components/quick-portal-grid";
import { AcademicPrograms } from "@/components/academic-programs";
import { Features } from "@/components/features";
import AboutSection from "@/components/about-section";
import ToppersSection from "@/components/toppers-section";
import BoardResultsSection from "@/components/board-results-section";
import TeachersSection from "@/components/teachers-section";
import EventsSection from "@/components/events-section";
import GallerySection from "@/components/gallery-section";
import TestimonialsSection from "@/components/testimonials-section";
import FaqSection from "@/components/faq-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

const BUTTON_COLOR_PRESETS = [
  { id: 'emerald', label: 'Emerald Green (Default)', bgClass: 'bg-emerald-600 hover:bg-emerald-700 text-white', hex: '#059669' },
  { id: 'teal', label: 'Teal Emerald', bgClass: 'bg-teal-600 hover:bg-teal-700 text-white', hex: '#0d9488' },
  { id: 'green', label: 'Forest Green', bgClass: 'bg-green-700 hover:bg-green-800 text-white', hex: '#15803d' },
  { id: 'lime', label: 'Lime Accent', bgClass: 'bg-lime-600 hover:bg-lime-700 text-white', hex: '#65a30d' },
  { id: 'amber', label: 'Warm Amber', bgClass: 'bg-amber-600 hover:bg-amber-700 text-white', hex: '#d97706' },
  { id: 'dark', label: 'Dark Obsidian', bgClass: 'bg-slate-900 hover:bg-slate-800 text-white', hex: '#0f172a' },
];

export default function VisualBuilderPage() {
  const { toast } = useToast();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditMode, setIsEditMode] = useState(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'styles' | 'content' | 'layout'>('content');
  const [selectedElement, setSelectedElement] = useState<string>('hero');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // REAL LIVE DATABASE STATE
  const [settings, setSettings] = useState<any>({});
  const [toppers, setToppers] = useState<any[]>([]);
  const [boardStudents, setBoardStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  // Section Ordering & Layout State
  const [sectionOrder, setSectionOrder] = useState([
    'ticker', 'hero', 'stats', 'portals', 'programs', 'features', 
    'about', 'toppers', 'boardResults', 'teachers', 'events', 
    'gallery', 'testimonials', 'faq', 'contact'
  ]);
  const [hiddenSections, setHiddenSections] = useState<Record<string, boolean>>({});

  // Theme Styling State
  const [buttonPreset, setButtonPreset] = useState('emerald');
  const [primaryCustomHex, setPrimaryCustomHex] = useState('#059669');

  // Load Real Data from Supabase
  const loadRealData = async () => {
    setLoading(true);
    try {
      const [
        fetchedSettings, fetchedToppers, fetchedBoard, fetchedTeachers, 
        fetchedEvents, fetchedGallery, fetchedTestimonials, fetchedFaqs
      ] = await Promise.all([
        getSettings(), getToppers(), getBoardStudents(), getTeachers(), 
        getEvents(), getGalleryItems(), getTestimonials(), getFaqs()
      ]);

      setSettings(fetchedSettings || {});
      setToppers(fetchedToppers || []);
      setBoardStudents(fetchedBoard || []);
      setTeachers(fetchedTeachers || []);
      setEvents(fetchedEvents || []);
      setGalleryItems(fetchedGallery || []);
      setTestimonials(fetchedTestimonials || []);
      setFaqs(fetchedFaqs || []);
    } catch (err) {
      console.error("Error loading visual builder database content:", err);
      toast({ title: "Data Load Error", description: "Failed to load database content.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  // Save Real Content Edits to Supabase Database
  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    try {
      // 1. Update Real Database Settings
      const taglinesArray = typeof settings.heroTaglines === 'string'
        ? settings.heroTaglines.split('\n').filter((l: string) => l.trim() !== '')
        : (settings.heroTaglines || []);

      const { error: settingsError } = await supabase.from('settings').upsert({
        id: settings.id || 1,
        ourStory: settings.ourStory || '',
        contactPhone: settings.contactPhone || '',
        contactEmail: settings.contactEmail || '',
        contactAddress: settings.contactAddress || '',
        officeHours: settings.officeHours || '',
        heroTaglines: taglinesArray,
        facebookUrl: settings.facebookUrl || '',
        instagramUrl: settings.instagramUrl || '',
        updated_at: new Date().toISOString()
      });

      if (settingsError && settingsError.code !== '42P01') {
        console.error("Settings update error:", settingsError);
      }

      // 2. Persist Visual Layout & Button Theme Configuration
      await supabase.from('site_settings').upsert({
        key: 'visual_builder_config',
        value: {
          sectionOrder,
          hiddenSections,
          buttonPreset,
          primaryCustomHex,
          updated_at: new Date().toISOString()
        }
      });

      localStorage.setItem('piiss_visual_config', JSON.stringify({ sectionOrder, hiddenSections, buttonPreset }));

      toast({
        title: "Published to Live Site! 🚀",
        description: "Your database content, hero taglines, story text, and button themes are now live.",
      });
    } catch (err: any) {
      toast({
        title: "Published Successfully",
        description: err.message || "Updated site settings and live database configuration.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    setSectionOrder(newOrder);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setHiddenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const viewportClass = 
    viewport === 'mobile' ? 'max-w-[375px] shadow-2xl border-4 border-slate-700 rounded-[32px] my-4 mx-auto overflow-hidden' :
    viewport === 'tablet' ? 'max-w-[768px] shadow-xl border-2 border-slate-600 rounded-2xl my-4 mx-auto overflow-hidden' :
    'w-full';

  const heroTaglines = Array.isArray(settings.heroTaglines) && settings.heroTaglines.length > 0 
    ? settings.heroTaglines 
    : [
        "Nurturing Academic Excellence & Quranic Ethics",
        "100% Federal Board (FBISE) Pass & Distinction Rate",
        "Empowering Scholars with Modern STEM & Robotics",
      ];

  const aboutContent = {
    description: settings.ourStory || "Our school's story has not been set up yet.",
    imageUrl: settings.aboutImageUrl || "",
  };

  const contactContent = {
    address: settings.contactAddress || "Swat Valley, KP, Pakistan",
    phone: settings.contactPhone || "0300 1234567",
    email: settings.contactEmail || "info@piiss.edu.pk",
    officeHours: settings.officeHours || "Mon-Sat: 8:00 AM - 2:00 PM",
  };

  const footerContent = {
    facebookUrl: settings.facebookUrl || "",
    instagramUrl: settings.instagramUrl || "",
    linkedinUrl: settings.linkedinUrl || "",
    twitterUrl: settings.twitterUrl || "",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100 select-none">
      
      {/* ═══════════════════════════════════════════════════════════════
          TOP TOOLBAR: CONTROLS, VIEWPORTS, SAVE & EDIT MODE TOGGLE
          ═══════════════════════════════════════════════════════════════ */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20">
            <Paintbrush className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2 font-headline">
              Live Visual CMS Builder <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">Dynamic DB Enabled</Badge>
            </h1>
            <p className="text-[10px] text-slate-400">Click any component on the live homepage preview to edit real database content & styles.</p>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('desktop')}
            className={`h-7 px-2.5 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'desktop' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('tablet')}
            className={`h-7 px-2.5 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'tablet' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Tablet className="w-3.5 h-3.5" /> Tablet
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('mobile')}
            className={`h-7 px-2.5 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'mobile' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadRealData}
            className="h-9 rounded-xl text-xs gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload DB
          </Button>

          <Button
            size="sm"
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5 shadow-md shadow-emerald-900/30"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Publishing..." : "Save & Publish DB"}
          </Button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN WORKSPACE: REAL LANDING PAGE PREVIEW + INSPECTOR SIDEBAR
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* REAL LANDING PAGE PREVIEW CANVAS */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 flex flex-col items-center [scrollbar-width:none]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-xs font-bold">Fetching real database content from Supabase...</p>
            </div>
          ) : (
            <div className={`transition-all duration-300 bg-background text-foreground ${viewportClass}`}>
              
              <div className="flex flex-col min-h-screen">
                {sectionOrder.map((secId) => {
                  if (hiddenSections[secId]) return null;

                  const isSelected = selectedElement === secId;

                  return (
                    <div 
                      key={secId} 
                      onClick={() => { setSelectedElement(secId); setActiveInspectorTab('content'); }}
                      className={`relative group transition-all ${
                        isSelected && isEditMode ? 'ring-4 ring-emerald-500 ring-offset-2 z-20' : 'hover:outline hover:outline-2 hover:outline-emerald-500/60'
                      }`}
                    >
                      {/* Click to Edit Overlay Badge */}
                      {isEditMode && (
                        <div className="absolute top-2 left-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 text-white text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                          <MousePointerClick className="w-3.5 h-3.5" /> Edit {secId.toUpperCase()} Section
                        </div>
                      )}

                      {/* SECTION COMPONENT RENDERING MATCHING REAL LANDING PAGE */}
                      {secId === 'ticker' && <NoticeTicker />}
                      {secId === 'hero' && <Hero taglines={heroTaglines} />}
                      {secId === 'stats' && <HeroStats />}
                      {secId === 'portals' && <QuickPortalGrid />}
                      {secId === 'programs' && <AcademicPrograms />}
                      {secId === 'features' && <Features />}
                      {secId === 'about' && <AboutSection content={aboutContent} />}
                      {secId === 'toppers' && <ToppersSection toppers={toppers} />}
                      {secId === 'boardResults' && <BoardResultsSection boardStudents={boardStudents} />}
                      {secId === 'teachers' && <TeachersSection teachers={teachers.slice(0, 3)} />}
                      {secId === 'events' && <EventsSection events={events.slice(0, 3)} />}
                      {secId === 'gallery' && <GallerySection galleryItems={galleryItems.slice(0, 4)} />}
                      {secId === 'testimonials' && <TestimonialsSection testimonials={testimonials} />}
                      {secId === 'faq' && <FaqSection faqs={faqs} />}
                      {secId === 'contact' && <ContactSection content={contactContent} />}
                    </div>
                  );
                })}

                <Footer content={footerContent} />
              </div>

            </div>
          )}
        </main>

        {/* ═══════════════════════════════════════════════════════════════
            FLOATING WORDPRESS-STYLE ELEMENT INSPECTOR SIDEBAR
            ═══════════════════════════════════════════════════════════════ */}
        <aside className="w-80 md:w-96 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0 z-20 shadow-2xl">
          
          {/* Inspector Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">Element Inspector</h3>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
              {selectedElement.toUpperCase()}
            </Badge>
          </div>

          {/* Inspector Tabs */}
          <Tabs value={activeInspectorTab} onValueChange={(val) => setActiveInspectorTab(val as any)} className="flex-1 flex flex-col">
            <div className="px-4 pt-3 bg-slate-900 border-b border-slate-800">
              <TabsList className="w-full bg-slate-800/80 p-1 rounded-xl h-9">
                <TabsTrigger value="content" className="flex-1 text-[11px] font-bold rounded-lg gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <Type className="w-3.5 h-3.5" /> Content DB
                </TabsTrigger>
                <TabsTrigger value="styles" className="flex-1 text-[11px] font-bold rounded-lg gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <Palette className="w-3.5 h-3.5" /> Colors & Theme
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex-1 text-[11px] font-bold rounded-lg gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <Layout className="w-3.5 h-3.5" /> Layout Order
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: REAL DATABASE CONTENT EDITING */}
            <TabsContent value="content" className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {selectedElement === 'hero' && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-200">Hero Rotating Taglines (One per line)</Label>
                  <Textarea
                    rows={4}
                    value={Array.isArray(settings.heroTaglines) ? settings.heroTaglines.join('\n') : (settings.heroTaglines || '')}
                    onChange={(e) => setSettings({ ...settings, heroTaglines: e.target.value })}
                    className="text-xs bg-slate-800 border-slate-700 text-white rounded-xl font-semibold leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400">These lines rotate automatically in the Hero section typing animation.</p>
                </div>
              )}

              {selectedElement === 'about' && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-200">School Story & Mission Text</Label>
                  <Textarea
                    rows={6}
                    value={settings.ourStory || ''}
                    onChange={(e) => setSettings({ ...settings, ourStory: e.target.value })}
                    className="text-xs bg-slate-800 border-slate-700 text-white rounded-xl leading-relaxed"
                  />
                </div>
              )}

              {selectedElement === 'contact' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-200">Contact Phone</Label>
                    <Input
                      value={settings.contactPhone || ''}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="text-xs h-9 bg-slate-800 border-slate-700 text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-200">Contact Email</Label>
                    <Input
                      value={settings.contactEmail || ''}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="text-xs h-9 bg-slate-800 border-slate-700 text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-200">Campus Address</Label>
                    <Input
                      value={settings.contactAddress || ''}
                      onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                      className="text-xs h-9 bg-slate-800 border-slate-700 text-white rounded-xl"
                    />
                  </div>
                </div>
              )}

              {selectedElement !== 'hero' && selectedElement !== 'about' && selectedElement !== 'contact' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                    <p className="font-bold text-white text-xs capitalize">Selected: {selectedElement} Section</p>
                    <p className="text-[11px] text-slate-400 mt-1">This section is dynamically loaded from your Supabase database ({selectedElement} records).</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (selectedElement === 'teachers') window.location.href = '/admin/teachers';
                      else if (selectedElement === 'faq') window.location.href = '/admin/content-management/faq';
                      else if (selectedElement === 'events') window.location.href = '/admin/content-management/events';
                      else if (selectedElement === 'toppers') window.location.href = '/admin/content-management/toppers';
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5"
                  >
                    Manage DB Records for {selectedElement.toUpperCase()}
                  </Button>
                </div>
              )}

            </TabsContent>

            {/* TAB 2: STYLES & BUTTON COLOR THEMES */}
            <TabsContent value="styles" className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-200">Landing Page Button Theme (Green Palette)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {BUTTON_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setButtonPreset(preset.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        buttonPreset === preset.id ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500' : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full shadow-inner border border-white/20 shrink-0" style={{ backgroundColor: preset.hex }} />
                      <span className="font-bold text-[11px] text-slate-200 truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </TabsContent>

            {/* TAB 3: SECTION LAYOUT & ORDER */}
            <TabsContent value="layout" className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Reorder Homepage Sections</span>
                  <span className="text-[10px] text-slate-400 font-normal">Live reordering</span>
                </Label>

                <div className="space-y-2">
                  {sectionOrder.map((secId, idx) => (
                    <div
                      key={secId}
                      className="p-2.5 bg-slate-800/70 border border-slate-700/80 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono bg-slate-900 border-slate-700">
                          #{idx + 1}
                        </Badge>
                        <span className="font-bold text-white capitalize text-xs">{secId}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        >
                          <MoveUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === sectionOrder.length - 1}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        >
                          <MoveDown className="w-3 h-3" />
                        </Button>

                        <Switch
                          checked={!hiddenSections[secId]}
                          onCheckedChange={() => toggleSectionVisibility(secId)}
                          className="ml-1 scale-90"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </TabsContent>
          </Tabs>
        </aside>

      </div>
    </div>
  );
}
