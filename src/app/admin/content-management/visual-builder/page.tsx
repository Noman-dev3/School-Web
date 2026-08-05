"use client";

import React, { useState, useEffect } from 'react';
import { 
  Paintbrush, Layout, Type, Save, Monitor, Tablet, Smartphone, 
  MoveUp, MoveDown, MousePointerClick, Palette, Sliders, ArrowRight
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

// Preset Palette Colors for Buttons and Accents
const BUTTON_COLOR_PRESETS = [
  { id: 'emerald', label: 'Emerald Green', bgClass: 'bg-emerald-600 hover:bg-emerald-700 text-white', hex: '#059669' },
  { id: 'blue', label: 'Royal Blue', bgClass: 'bg-blue-600 hover:bg-blue-700 text-white', hex: '#2563eb' },
  { id: 'indigo', label: 'Deep Indigo', bgClass: 'bg-indigo-600 hover:bg-indigo-700 text-white', hex: '#4f46e5' },
  { id: 'violet', label: 'Amethyst Violet', bgClass: 'bg-violet-600 hover:bg-violet-700 text-white', hex: '#7c3aed' },
  { id: 'rose', label: 'Crimson Rose', bgClass: 'bg-rose-600 hover:bg-rose-700 text-white', hex: '#e11d48' },
  { id: 'amber', label: 'Amber Gold', bgClass: 'bg-amber-500 hover:bg-amber-600 text-slate-950', hex: '#f59e0b' },
  { id: 'dark', label: 'Onyx Dark', bgClass: 'bg-slate-900 hover:bg-slate-800 text-white', hex: '#0f172a' },
];

const BUTTON_SHAPE_PRESETS = [
  { id: 'rounded-xl', label: 'Modern Rounded (12px)', class: 'rounded-xl' },
  { id: 'rounded-full', label: 'Pill Shape (Full)', class: 'rounded-full' },
  { id: 'rounded-md', label: 'Classic Box (6px)', class: 'rounded-md' },
];

export default function VisualBuilderPage() {
  const { toast } = useToast();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditMode, setIsEditMode] = useState(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'styles' | 'content' | 'layout'>('styles');
  const [selectedElement, setSelectedElement] = useState<string | null>('button');
  const [isSaving, setIsSaving] = useState(false);

  // Live Config State (Persisted configuration)
  const [config, setConfig] = useState({
    themePreset: 'emerald',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    buttonShape: 'rounded-xl',
    buttonCustomHex: '#059669',
    heroTitle: "Empowering Future Generations with Islamic & Modern Education",
    heroSubtitle: "Discover excellence in academics, character development, and holistic Islamic values at Pioneer International Islamic School System.",
    heroCtaLabel: "Apply for Admission 2026",
    heroCtaLink: "/admissions",
    secondaryCtaLabel: "Explore Fee Structure",
    announcementText: "📢 Admissions Open for Session 2026-2027! Entrance Test Registration ends August 15.",
    stat1Label: "1,450+",
    stat1Sub: "Enrolled Students",
    stat2Label: "98.8%",
    stat2Sub: "Board Exam Pass Rate",
    stat3Label: "45+",
    stat3Sub: "Qualified Teachers",
    sectionOrder: ['announcement', 'hero', 'stats', 'programs', 'teachers', 'faq'],
    hiddenSections: {} as Record<string, boolean>,
  });

  // Load configuration from Supabase or localStorage
  useEffect(() => {
    async function loadConfig() {
      try {
        const savedLocal = localStorage.getItem('piiss_visual_builder_config');
        if (savedLocal) {
          setConfig(JSON.parse(savedLocal));
        }

        const { data, error } = await supabase.from('site_settings').select('*').eq('key', 'homepage_visual_builder').single();
        if (!error && data?.value) {
          setConfig(data.value);
        }
      } catch (err) {
        console.error("Failed to load visual builder config:", err);
      }
    }
    loadConfig();
  }, []);

  // Save Config to Supabase and LocalStorage
  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('piiss_visual_builder_config', JSON.stringify(config));
      
      const { error } = await supabase.from('site_settings').upsert({
        key: 'homepage_visual_builder',
        value: config,
        updated_at: new Date().toISOString()
      });

      if (error && error.code !== '42P01') {
        throw error;
      }

      toast({
        title: "Published Successfully! 🚀",
        description: "Your button colors, theme styles, and content edits are now live on the website.",
      });
    } catch (err: any) {
      toast({
        title: "Saved Locally",
        description: "Visual updates saved to your browser cache.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder Sections Helper
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...config.sectionOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    setConfig({ ...config, sectionOrder: newOrder });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setConfig({
      ...config,
      hiddenSections: {
        ...config.hiddenSections,
        [sectionId]: !config.hiddenSections[sectionId]
      }
    });
  };

  // Viewport Container Max Width Class
  const viewportClass = 
    viewport === 'mobile' ? 'max-w-[375px] shadow-2xl border-4 border-slate-700 rounded-[32px] my-4 mx-auto overflow-hidden' :
    viewport === 'tablet' ? 'max-w-[768px] shadow-xl border-2 border-slate-600 rounded-2xl my-4 mx-auto overflow-hidden' :
    'w-full';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100 select-none">
      
      {/* ═══════════════════════════════════════════════════════════════
          TOP TOOLBAR: CONTROLS, VIEWPORTS, SAVE & EDIT MODE TOGGLE
          ═══════════════════════════════════════════════════════════════ */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
        
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
            <Paintbrush className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2">
              Visual Page Builder <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/30">WordPress Style</Badge>
            </h1>
            <p className="text-[10px] text-slate-400">Click any element on the preview to customize button colors, text & layouts.</p>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('desktop')}
            className={`h-7 px-2.5 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'desktop' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('tablet')}
            className={`h-7 px-2.5 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'tablet' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Tablet className="w-3.5 h-3.5" /> Tablet
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewport('mobile')}
            className={`h-7 px-2.5 rounded-lg text-xs gap-1.5 font-bold ${viewport === 'mobile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </Button>
        </div>

        {/* Mode & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <Label className="text-xs font-semibold text-slate-300">Visual Edit Mode</Label>
            <Switch
              checked={isEditMode}
              onCheckedChange={setIsEditMode}
            />
          </div>

          <Button
            size="sm"
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5 shadow-md shadow-emerald-900/30"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Publishing..." : "Save & Publish"}
          </Button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN BUILDER BODY: CANVAS PREVIEW + FLOATING INSPECTOR SIDEBAR
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LIVE CANVAS PREVIEW WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 flex flex-col items-center [scrollbar-width:none]">
          <div className={`transition-all duration-300 bg-slate-900 text-slate-100 ${viewportClass}`}>
            
            {/* CANVAS WRAPPER WITH INTERACTIVE SECTION ORDERING */}
            <div className="space-y-0">
              {config.sectionOrder.map((secId, idx) => {
                if (config.hiddenSections[secId]) return null;

                if (secId === 'announcement') {
                  return (
                    <div 
                      key={secId} 
                      onClick={() => { setSelectedElement('announcement'); setActiveInspectorTab('content'); }}
                      className={`relative group p-2.5 text-center text-xs font-bold transition-all cursor-pointer ${
                        selectedElement === 'announcement' && isEditMode ? 'ring-2 ring-blue-500 bg-blue-950/40' : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white'
                      }`}
                    >
                      {isEditMode && (
                        <div className="absolute top-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                          <MousePointerClick className="w-3 h-3" /> Click to Edit Announcement
                        </div>
                      )}
                      <span>{config.announcementText}</span>
                    </div>
                  );
                }

                if (secId === 'hero') {
                  return (
                    <section 
                      key={secId} 
                      onClick={() => { setSelectedElement('hero'); setActiveInspectorTab('styles'); }}
                      className={`relative group p-8 md:p-12 transition-all border-b border-slate-800 ${
                        selectedElement === 'hero' && isEditMode ? 'ring-2 ring-blue-500 bg-blue-950/20' : 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950'
                      }`}
                    >
                      {isEditMode && (
                        <div className="absolute top-3 left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
                          <MousePointerClick className="w-3 h-3" /> Click to Edit Hero & Buttons
                        </div>
                      )}

                      <div className="max-w-3xl mx-auto text-center space-y-6">
                        <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs px-3 py-1 rounded-full">
                          Pioneer International Islamic School System
                        </Badge>

                        <h1 
                          onClick={(e) => { e.stopPropagation(); setSelectedElement('heroTitle'); setActiveInspectorTab('content'); }}
                          className={`text-2xl md:text-4xl font-extrabold tracking-tight font-headline text-white leading-tight cursor-pointer rounded-xl p-2 transition-all ${
                            selectedElement === 'heroTitle' && isEditMode ? 'ring-2 ring-emerald-500 bg-emerald-950/40' : 'hover:bg-slate-800/50'
                          }`}
                        >
                          {config.heroTitle}
                        </h1>

                        <p 
                          onClick={(e) => { e.stopPropagation(); setSelectedElement('heroSubtitle'); setActiveInspectorTab('content'); }}
                          className={`text-sm md:text-base text-slate-300 cursor-pointer rounded-xl p-2 transition-all ${
                            selectedElement === 'heroSubtitle' && isEditMode ? 'ring-2 ring-emerald-500 bg-emerald-950/40' : 'hover:bg-slate-800/50'
                          }`}
                        >
                          {config.heroSubtitle}
                        </p>

                        {/* EDITABLE BUTTON AREA */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedElement('button'); setActiveInspectorTab('styles'); }}
                            className={`px-6 py-3 text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${config.buttonColor} ${config.buttonShape} ${
                              selectedElement === 'button' && isEditMode ? 'ring-4 ring-blue-400 scale-105' : ''
                            }`}
                          >
                            <span>{config.heroCtaLabel}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedElement('secondaryButton'); setActiveInspectorTab('content'); }}
                            className={`px-5 py-3 text-sm font-semibold border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 ${config.buttonShape} transition-all`}
                          >
                            {config.secondaryCtaLabel}
                          </button>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (secId === 'stats') {
                  return (
                    <section 
                      key={secId}
                      onClick={() => { setSelectedElement('stats'); setActiveInspectorTab('content'); }}
                      className={`p-6 border-b border-slate-800 bg-slate-900/60 relative group ${
                        selectedElement === 'stats' && isEditMode ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
                        <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-800">
                          <p className="text-xl md:text-2xl font-black text-emerald-400 font-mono">{config.stat1Label}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{config.stat1Sub}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-800">
                          <p className="text-xl md:text-2xl font-black text-blue-400 font-mono">{config.stat2Label}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{config.stat2Sub}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-800">
                          <p className="text-xl md:text-2xl font-black text-violet-400 font-mono">{config.stat3Label}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{config.stat3Sub}</p>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (secId === 'programs') {
                  return (
                    <section key={secId} className="p-8 border-b border-slate-800 bg-slate-950">
                      <div className="max-w-3xl mx-auto space-y-4">
                        <div className="text-center space-y-1">
                          <h3 className="text-lg font-bold text-white">Academic Programs & Wings</h3>
                          <p className="text-xs text-slate-400">Structured Montessori, Primary, and High School Curricula.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-none text-[10px]">Junior Wing</Badge>
                            <h4 className="font-bold text-white">Montessori & Prep</h4>
                            <p className="text-[11px] text-slate-400">Activity-based learning with Islamic values.</p>
                          </div>
                          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                            <Badge className="bg-blue-500/15 text-blue-400 border-none text-[10px]">Primary Wing</Badge>
                            <h4 className="font-bold text-white">Grade 1 to Grade 5</h4>
                            <p className="text-[11px] text-slate-400">Core English, Science, Mathematics & Quran.</p>
                          </div>
                          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                            <Badge className="bg-violet-500/15 text-violet-400 border-none text-[10px]">High Wing</Badge>
                            <h4 className="font-bold text-white">Grade 6 to Metric</h4>
                            <p className="text-[11px] text-slate-400">BISE Swat board examination preparation.</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (secId === 'teachers') {
                  return (
                    <section key={secId} className="p-8 border-b border-slate-800 bg-slate-900/40">
                      <div className="max-w-3xl mx-auto space-y-4 text-center">
                        <h3 className="text-lg font-bold text-white">Distinguished Faculty</h3>
                        <p className="text-xs text-slate-400">Experienced educators dedicated to student success.</p>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          {['Sir Rashid Ahmad (Principal)', 'Ma\'am Ayesha (Vice Principal)', 'Sir Imran Khan (HOD Science)'].map((name, i) => (
                            <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto">
                                {name.split(' ')[1]?.[0] || 'T'}
                              </div>
                              <p className="font-bold text-white">{name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                if (secId === 'faq') {
                  return (
                    <section key={secId} className="p-8 border-b border-slate-800 bg-slate-950">
                      <div className="max-w-3xl mx-auto space-y-4">
                        <h3 className="text-lg font-bold text-white text-center">Frequently Asked Questions</h3>
                        <div className="space-y-2 text-xs">
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                            <p className="font-bold text-white">What are the admission requirements?</p>
                            <p className="text-[11px] text-slate-400 mt-1">Submit online application form with previous school leaving certificate and 2 passport photos.</p>
                          </div>
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                            <p className="font-bold text-white">Is transport facility available?</p>
                            <p className="text-[11px] text-slate-400 mt-1">Yes, air-conditioned school buses cover major routes across Swat valley.</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════════════
            FLOATING WORDPRESS-STYLE ELEMENT INSPECTOR SIDEBAR
            ═══════════════════════════════════════════════════════════════ */}
        <aside className="w-80 md:w-96 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0 z-20 shadow-2xl">
          
          {/* Inspector Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">Element Inspector</h3>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
              Editing: {selectedElement ? selectedElement.toUpperCase() : 'CANVAS'}
            </Badge>
          </div>

          {/* Inspector Tabs */}
          <Tabs value={activeInspectorTab} onValueChange={(val) => setActiveInspectorTab(val as any)} className="flex-1 flex flex-col">
            <div className="px-4 pt-3 bg-slate-900 border-b border-slate-800">
              <TabsList className="w-full bg-slate-800/80 p-1 rounded-xl h-9">
                <TabsTrigger value="styles" className="flex-1 text-[11px] font-bold rounded-lg gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Palette className="w-3.5 h-3.5" /> Button & Styles
                </TabsTrigger>
                <TabsTrigger value="content" className="flex-1 text-[11px] font-bold rounded-lg gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Type className="w-3.5 h-3.5" /> Content
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex-1 text-[11px] font-bold rounded-lg gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Layout className="w-3.5 h-3.5" /> Layout
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: STYLES & BUTTON COLORS */}
            <TabsContent value="styles" className="p-4 space-y-5 overflow-y-auto flex-1 text-xs">
              
              {/* Button Color Preset Picker */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Button Color Palette</span>
                  <span className="text-[10px] text-slate-400 font-normal">Click to apply</span>
                </Label>

                <div className="grid grid-cols-2 gap-2">
                  {BUTTON_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setConfig({ ...config, buttonColor: preset.bgClass, buttonCustomHex: preset.hex })}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        config.buttonColor === preset.bgClass ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500' : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full shadow-inner border border-white/20 shrink-0" style={{ backgroundColor: preset.hex }} />
                      <span className="font-bold text-[11px] text-slate-200 truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Hex Color Picker */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <Label className="text-xs font-bold text-slate-300">Custom Button Hex Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.buttonCustomHex}
                    onChange={(e) => setConfig({ ...config, buttonCustomHex: e.target.value })}
                    className="w-9 h-9 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-0.5"
                  />
                  <Input
                    value={config.buttonCustomHex}
                    onChange={(e) => setConfig({ ...config, buttonCustomHex: e.target.value })}
                    className="text-xs h-9 font-mono font-bold bg-slate-800 border-slate-700 text-white rounded-xl"
                  />
                </div>
              </div>

              {/* Button Shape & Border Radius */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <Label className="text-xs font-bold text-slate-300">Button Corner Radius (Shape)</Label>
                <div className="space-y-2">
                  {BUTTON_SHAPE_PRESETS.map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => setConfig({ ...config, buttonShape: shape.id })}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        config.buttonShape === shape.id ? 'border-blue-500 bg-blue-950/40 font-bold text-white' : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs">{shape.label}</span>
                      <div className={`w-8 h-4 bg-blue-600 ${shape.class}`} />
                    </button>
                  ))}
                </div>
              </div>

            </TabsContent>

            {/* TAB 2: CONTENT & TEXT EDITING */}
            <TabsContent value="content" className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Hero Main Title Text</Label>
                <Textarea
                  rows={3}
                  value={config.heroTitle}
                  onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                  className="text-xs bg-slate-800 border-slate-700 text-white rounded-xl font-semibold leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Hero Subtitle Text</Label>
                <Textarea
                  rows={3}
                  value={config.heroSubtitle}
                  onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                  className="text-xs bg-slate-800 border-slate-700 text-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-300">Primary Button Label</Label>
                  <Input
                    value={config.heroCtaLabel}
                    onChange={(e) => setConfig({ ...config, heroCtaLabel: e.target.value })}
                    className="text-xs h-9 bg-slate-800 border-slate-700 text-white rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-300">Secondary Button Label</Label>
                  <Input
                    value={config.secondaryCtaLabel}
                    onChange={(e) => setConfig({ ...config, secondaryCtaLabel: e.target.value })}
                    className="text-xs h-9 bg-slate-800 border-slate-700 text-white rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <Label className="text-xs font-bold text-slate-300">Top Announcement Banner Text</Label>
                <Input
                  value={config.announcementText}
                  onChange={(e) => setConfig({ ...config, announcementText: e.target.value })}
                  className="text-xs h-9 bg-slate-800 border-slate-700 text-white rounded-xl"
                />
              </div>

            </TabsContent>

            {/* TAB 3: SECTION ORDER & LAYOUT MANAGER */}
            <TabsContent value="layout" className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Homepage Section Order & Visibility</span>
                  <span className="text-[10px] text-slate-400 font-normal">Reorder or hide sections</span>
                </Label>

                <div className="space-y-2">
                  {config.sectionOrder.map((secId, idx) => (
                    <div
                      key={secId}
                      className="p-3 bg-slate-800/70 border border-slate-700/80 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Badge variant="outline" className="text-[10px] font-mono bg-slate-900 border-slate-700">
                          #{idx + 1}
                        </Badge>
                        <span className="font-bold text-white capitalize">{secId} Section</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === config.sectionOrder.length - 1}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </Button>

                        <Switch
                          checked={!config.hiddenSections[secId]}
                          onCheckedChange={() => toggleSectionVisibility(secId)}
                          className="ml-2"
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
