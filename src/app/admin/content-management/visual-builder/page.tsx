"use client";

import React, { useState, useEffect } from 'react';
import { 
  Paintbrush, Save, ArrowUp, ArrowDown, Eye, EyeOff, LayoutList, 
  Sparkles, CheckCircle2, Image as ImageIcon, Link as LinkIcon, 
  MessageSquare, Phone, MapPin, Globe, Loader2, Plus, Trash2, Sliders,
  HelpCircle, Megaphone, Check, ShieldCheck, Layers, BookOpen, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { getSettings, DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY, defaultSettings } from '@/lib/data-fetching';

const SECTION_LABELS: Record<string, { title: string; desc: string; icon: string }> = {
  hero: { title: "Hero Main Banner", desc: "Top hero headline, taglines, and call-to-action", icon: "🚀" },
  stats: { title: "Metrics & Statistics Bar", desc: "Key metrics counters (Students, Pass Rate, Educators)", icon: "📊" },
  portals: { title: "Quick Portals Grid", desc: "Admissions, Results, Fee Vouchers, Events shortcuts", icon: "⚡" },
  programs: { title: "Academic Programs", desc: "Montessori, Primary, Middle, and High School levels", icon: "🎓" },
  features: { title: "Core Pillars / Why Choose PIISS", desc: "STEM, Quranic Ethics, Distinction Merit features", icon: "⭐" },
  adBanner: { title: "Announcement / Ad Banner", desc: "Promotional banner for events or admissions", icon: "📢" },
  about: { title: "About School & Mission", desc: "Institutional history, story, and vision statement", icon: "🏫" },
  toppers: { title: "FBISE Board Toppers", desc: "Star students and board position holders", icon: "🏆" },
  boardResults: { title: "FBISE Board Results Table", desc: "Detailed board pass percentages and breakdown", icon: "📋" },
  teachers: { title: "Faculty & Educators", desc: "Educators spotlight and master's teachers", icon: "👨‍🏫" },
  events: { title: "Upcoming Events & Academic Calendar", desc: "School activities, sports galas, and exams", icon: "📅" },
  gallery: { title: "School Life Gallery", desc: "Campus photos and activity highlights", icon: "🖼️" },
  testimonials: { title: "Parent Testimonials", desc: "Reviews and feedback from parents & community", icon: "💬" },
  faq: { title: "Frequently Asked Questions", desc: "Answers to admissions, fees, and campus queries", icon: "❓" },
  contact: { title: "Campus Contact & Map", desc: "Address, phone numbers, email, and inquiry form", icon: "📍" },
};

export default function LandingPageCMSStudio() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");

  // FULL CMS FORM STATE
  const [config, setConfig] = useState<any>({
    ...defaultSettings
  });

  useEffect(() => {
    async function loadCMSData() {
      try {
        const fetched = await getSettings();
        setConfig(fetched);
      } catch (err) {
        console.error("Failed to load CMS settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCMSData();
  }, []);

  const handleSaveCMS = async () => {
    setIsSaving(true);
    try {
      // Store all extended CMS configuration inside heroTaglines JSONB payload for 100% database compatibility
      const cmsPayload = {
        taglines: config.heroTaglines,
        sectionOrder: config.sectionOrder,
        sectionVisibility: config.sectionVisibility,
        noticeText: config.noticeText,
        noticeLink: config.noticeLink,
        heroEyebrow: config.heroEyebrow,
        heroTitlePart1: config.heroTitlePart1,
        heroTitlePart2: config.heroTitlePart2,
        heroSub: config.heroSub,
        heroCtaText: config.heroCtaText,
        heroCtaLink: config.heroCtaLink,
        heroCta2Text: config.heroCta2Text,
        heroCta2Link: config.heroCta2Link,
        heroImageUrl: config.heroImageUrl,
        heroCard1Title: config.heroCard1Title,
        heroCard1Desc: config.heroCard1Desc,
        heroCard2Title: config.heroCard2Title,
        heroCard2Desc: config.heroCard2Desc,
        heroCard3Title: config.heroCard3Title,
        heroCard3Desc: config.heroCard3Desc,
        adBannerTitle: config.adBannerTitle,
        adBannerSubtitle: config.adBannerSubtitle,
        adBannerCtaText: config.adBannerCtaText,
        adBannerImageUrl: config.adBannerImageUrl,
        sectionTitles: config.sectionTitles,
        schoolName: config.schoolName,
        tagline: config.tagline,
      };

      const payload: any = {
        id: 1,
        ourStory: config.ourStory,
        logoUrl: config.logoUrl,
        contactPhone: config.contactPhone,
        contactEmail: config.contactEmail,
        contactAddress: config.contactAddress,
        officeHours: config.officeHours,
        aboutImageUrl: config.aboutImageUrl,
        contactImageUrl: config.contactImageUrl,
        heroTaglines: cmsPayload,
        facebookUrl: config.facebookUrl,
        instagramUrl: config.instagramUrl,
        linkedinUrl: config.linkedinUrl,
        twitterUrl: config.twitterUrl,
      };

      const { error } = await supabase.from('settings').upsert([payload]);
      if (error) throw error;

      toast({
        title: "Landing Page Updated! 🎉",
        description: "All section orderings, hero template text, media pictures, and features are live on the website."
      });
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Section Reorder Handlers
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...(config.sectionOrder || DEFAULT_SECTION_ORDER)];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setConfig({ ...config, sectionOrder: newOrder });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const currentVis = { ...(config.sectionVisibility || DEFAULT_SECTION_VISIBILITY) };
    currentVis[sectionId] = currentVis[sectionId] === false ? true : false;
    setConfig({ ...config, sectionVisibility: currentVis });
  };

  // Hero Tagline Handlers
  const addTagline = () => {
    setConfig({
      ...config,
      heroTaglines: [...(config.heroTaglines || []), "New Inspiring Tagline"]
    });
  };

  const updateTagline = (index: number, val: string) => {
    const updated = [...(config.heroTaglines || [])];
    updated[index] = val;
    setConfig({ ...config, heroTaglines: updated });
  };

  const removeTagline = (index: number) => {
    const updated = (config.heroTaglines || []).filter((_: any, i: number) => i !== index);
    setConfig({ ...config, heroTaglines: updated });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-muted-foreground">Loading Landing Page CMS Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
            <Sliders className="w-4 h-4" /> Landing Page CMS Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-foreground">
            Landing Page Manager & Customizer
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Reorder sections, update hero headlines, pictures, notice bars, and website branding in real-time.
          </p>
        </div>

        <Button
          onClick={handleSaveCMS}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10 px-5 gap-2 font-bold shadow-md shrink-0"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? "Saving Live Changes..." : "Publish Live Changes"}</span>
        </Button>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/40 p-1.5 rounded-2xl border border-border/60 backdrop-blur-md flex flex-wrap gap-1">
          <TabsTrigger value="sections" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <LayoutList className="w-3.5 h-3.5 text-emerald-600" /> Section Order & Visibility
          </TabsTrigger>
          <TabsTrigger value="hero" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Hero & Template Layout
          </TabsTrigger>
          <TabsTrigger value="notice" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Megaphone className="w-3.5 h-3.5 text-blue-600" /> Notice Bar & Header
          </TabsTrigger>
          <TabsTrigger value="media" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Pictures & Media Studio
          </TabsTrigger>
          <TabsTrigger value="headings" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" /> Section Headings
          </TabsTrigger>
          <TabsTrigger value="footer" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Globe className="w-3.5 h-3.5 text-violet-600" /> Footer & Contacts
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SECTION REORDER & VISIBILITY */}
        <TabsContent value="sections" className="space-y-4">
          <Card className="rounded-2xl border-border/60 p-6 bg-card">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg font-bold font-headline flex items-center gap-2">
                <LayoutList className="w-5 h-5 text-emerald-600" /> Dynamic Section Re-ordering
              </CardTitle>
              <CardDescription className="text-xs">
                Move sections up or down to change their exact position on the home landing page. Use the toggle switch to enable or hide any section.
              </CardDescription>
            </CardHeader>
            
            <div className="space-y-3">
              {(config.sectionOrder || DEFAULT_SECTION_ORDER).map((secId: string, idx: number) => {
                const info = SECTION_LABELS[secId] || { title: secId, desc: "Landing Section", icon: "📌" };
                const isVisible = config.sectionVisibility?.[secId] !== false;

                return (
                  <div key={secId} className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isVisible ? 'bg-muted/30 border-border/60' : 'bg-muted/10 border-border/30 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-lg shrink-0">{info.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-foreground flex items-center gap-2">
                          {info.title}
                          {!isVisible && <Badge variant="secondary" className="text-[10px] bg-rose-500/10 text-rose-600">Hidden</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{info.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          disabled={idx === 0} 
                          onClick={() => moveSection(idx, 'up')}
                          className="h-8 w-8 rounded-lg"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          disabled={idx === (config.sectionOrder?.length || 0) - 1} 
                          onClick={() => moveSection(idx, 'down')}
                          className="h-8 w-8 rounded-lg"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 pl-2 border-l border-border/40">
                        <Label htmlFor={`switch-${secId}`} className="text-xs font-semibold text-muted-foreground cursor-pointer">
                          {isVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-rose-500" />}
                        </Label>
                        <Switch
                          id={`switch-${secId}`}
                          checked={isVisible}
                          onCheckedChange={() => toggleSectionVisibility(secId)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: HERO & TEMPLATE CUSTOMIZATION */}
        <TabsContent value="hero" className="space-y-4">
          <Card className="rounded-2xl border-border/60 p-6 bg-card space-y-6">
            <div>
              <CardTitle className="text-lg font-bold font-headline flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Hero Layout Template Customizer
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Customize the eyebrow badge, dual-color headline, subtitle description, CTA buttons, and bottom 3 feature cards matching the template design.
              </CardDescription>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold">Eyebrow Badge (e.g. ABOUT US / ACADEMIC EXCELLENCE)</Label>
                <Input
                  value={config.heroEyebrow}
                  onChange={(e) => setConfig({ ...config, heroEyebrow: e.target.value })}
                  placeholder="ABOUT US"
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-bold">Main Title Part 1 (Navy/Dark Text)</Label>
                  <Input
                    value={config.heroTitlePart1}
                    onChange={(e) => setConfig({ ...config, heroTitlePart1: e.target.value })}
                    placeholder="We are the top"
                    className="h-9 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold">Main Title Part 2 (Golden Yellow Highlight)</Label>
                  <Input
                    value={config.heroTitlePart2}
                    onChange={(e) => setConfig({ ...config, heroTitlePart2: e.target.value })}
                    placeholder="Learning Platform."
                    className="h-9 rounded-xl text-xs font-bold text-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">Hero Subtitle / Description Paragraph</Label>
                <Textarea
                  value={config.heroSub}
                  onChange={(e) => setConfig({ ...config, heroSub: e.target.value })}
                  rows={3}
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                <div className="space-y-1.5">
                  <Label className="font-bold">Primary Button Label (Solid Pill)</Label>
                  <Input
                    value={config.heroCtaText}
                    onChange={(e) => setConfig({ ...config, heroCtaText: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold">Primary Button Link</Label>
                  <Input
                    value={config.heroCtaLink}
                    onChange={(e) => setConfig({ ...config, heroCtaLink: e.target.value })}
                    className="h-9 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold">Secondary Button Label (Outline Pill)</Label>
                  <Input
                    value={config.heroCta2Text}
                    onChange={(e) => setConfig({ ...config, heroCta2Text: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold">Secondary Button Link</Label>
                  <Input
                    value={config.heroCta2Link}
                    onChange={(e) => setConfig({ ...config, heroCta2Link: e.target.value })}
                    className="h-9 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Bottom 3 Feature Cards */}
              <div className="pt-4 border-t border-border/40 space-y-4">
                <h4 className="text-sm font-bold font-headline flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" /> Bottom 3 Feature Cards (Template Grid)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/30 space-y-2">
                    <p className="font-extrabold text-xs text-rose-600 uppercase">Card 1 (Pink Block)</p>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Title</Label>
                      <Input
                        value={config.heroCard1Title}
                        onChange={(e) => setConfig({ ...config, heroCard1Title: e.target.value })}
                        className="h-8 text-xs rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Description</Label>
                      <Textarea
                        value={config.heroCard1Desc}
                        onChange={(e) => setConfig({ ...config, heroCard1Desc: e.target.value })}
                        rows={2}
                        className="text-xs rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-2">
                    <p className="font-extrabold text-xs text-amber-600 uppercase">Card 2 (Amber Block)</p>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Title</Label>
                      <Input
                        value={config.heroCard2Title}
                        onChange={(e) => setConfig({ ...config, heroCard2Title: e.target.value })}
                        className="h-8 text-xs rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Description</Label>
                      <Textarea
                        value={config.heroCard2Desc}
                        onChange={(e) => setConfig({ ...config, heroCard2Desc: e.target.value })}
                        rows={2}
                        className="text-xs rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="p-4 bg-teal-500/10 rounded-xl border border-teal-500/30 space-y-2">
                    <p className="font-extrabold text-xs text-teal-600 uppercase">Card 3 (Teal Block)</p>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Title</Label>
                      <Input
                        value={config.heroCard3Title}
                        onChange={(e) => setConfig({ ...config, heroCard3Title: e.target.value })}
                        className="h-8 text-xs rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">Description</Label>
                      <Textarea
                        value={config.heroCard3Desc}
                        onChange={(e) => setConfig({ ...config, heroCard3Desc: e.target.value })}
                        rows={2}
                        className="text-xs rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: NOTICE BAR & HEADER */}
        <TabsContent value="notice" className="space-y-4">
          <Card className="rounded-2xl border-border/60 p-6 bg-card space-y-6">
            <div>
              <CardTitle className="text-lg font-bold font-headline flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" /> Top Announcement Notice Bar
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Customize the marquee announcement bar running across the top of the website.
              </CardDescription>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold">Announcement Ticker Text</Label>
                <Input
                  value={config.noticeText}
                  onChange={(e) => setConfig({ ...config, noticeText: e.target.value })}
                  placeholder="e.g. Admissions Open for Session 2026-2027!"
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">Notice Link URL</Label>
                <Input
                  value={config.noticeLink}
                  onChange={(e) => setConfig({ ...config, noticeLink: e.target.value })}
                  placeholder="/admissions"
                  className="h-9 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-4">
              <h4 className="text-sm font-bold font-headline flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Header Branding & Logo
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="font-bold">School Name (Header Text)</Label>
                  <Input
                    value={config.schoolName}
                    onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold">Tagline / Motto</Label>
                  <Input
                    value={config.tagline}
                    onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 4: PICTURES & MEDIA STUDIO */}
        <TabsContent value="media" className="space-y-4">
          <Card className="rounded-2xl border-border/60 p-6 bg-card space-y-6">
            <div>
              <CardTitle className="text-lg font-bold font-headline flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" /> Website Pictures & Visual Media Studio
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Manage and replace image URLs used across the website with instant thumbnail previews.
              </CardDescription>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hero Image Card */}
              <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-3">
                <p className="font-bold text-xs text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Hero Banner Showcase Image
                </p>
                {config.heroImageUrl && (
                  <div className="h-36 rounded-lg overflow-hidden border border-border/60 bg-black/10">
                    <img src={config.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Image URL</Label>
                  <Input
                    value={config.heroImageUrl}
                    onChange={(e) => setConfig({ ...config, heroImageUrl: e.target.value })}
                    className="h-8 text-xs rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* About Us Image Card */}
              <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-3">
                <p className="font-bold text-xs text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> About School Image
                </p>
                {config.aboutImageUrl && (
                  <div className="h-36 rounded-lg overflow-hidden border border-border/60 bg-black/10">
                    <img src={config.aboutImageUrl} alt="About Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Image URL</Label>
                  <Input
                    value={config.aboutImageUrl}
                    onChange={(e) => setConfig({ ...config, aboutImageUrl: e.target.value })}
                    className="h-8 text-xs rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Ad Banner Image Card */}
              <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-3">
                <p className="font-bold text-xs text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" /> Ad Promotional Banner Image
                </p>
                {config.adBannerImageUrl && (
                  <div className="h-36 rounded-lg overflow-hidden border border-border/60 bg-black/10">
                    <img src={config.adBannerImageUrl} alt="Ad Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Image URL</Label>
                  <Input
                    value={config.adBannerImageUrl}
                    onChange={(e) => setConfig({ ...config, adBannerImageUrl: e.target.value })}
                    className="h-8 text-xs rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* School Logo Image Card */}
              <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-3">
                <p className="font-bold text-xs text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-violet-600" /> Official School Logo URL
                </p>
                {config.logoUrl && (
                  <div className="h-36 rounded-lg overflow-hidden border border-border/60 bg-black/10 flex items-center justify-center p-4">
                    <img src={config.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Logo URL</Label>
                  <Input
                    value={config.logoUrl}
                    onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                    className="h-8 text-xs rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 5: SECTION HEADINGS */}
        <TabsContent value="headings" className="space-y-4">
          <Card className="rounded-2xl border-border/60 p-6 bg-card space-y-6">
            <div>
              <CardTitle className="text-lg font-bold font-headline flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" /> Custom Section Titles & Descriptions
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Customize titles and subtitles for every major section on the home landing page.
              </CardDescription>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {[
                { titleKey: "portalsTitle", descKey: "portalsDesc", label: "Quick Portals Section" },
                { titleKey: "programsTitle", descKey: "programsDesc", label: "Academic Programs Section" },
                { titleKey: "featuresTitle", descKey: "featuresDesc", label: "Core Features Section" },
                { titleKey: "aboutTitle", descKey: "aboutDesc", label: "About Us Section" },
                { titleKey: "toppersTitle", descKey: "toppersDesc", label: "Board Toppers Section" },
                { titleKey: "teachersTitle", descKey: "teachersDesc", label: "Faculty Section" },
                { titleKey: "eventsTitle", descKey: "eventsDesc", label: "Upcoming Events Section" },
                { titleKey: "faqTitle", descKey: "faqDesc", label: "FAQ Section" },
                { titleKey: "contactTitle", descKey: "contactDesc", label: "Contact Section" },
              ].map((sec, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-2">
                  <p className="font-bold text-xs text-emerald-600 uppercase tracking-wider">{sec.label}</p>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold">Section Heading</Label>
                    <Input
                      value={config.sectionTitles?.[sec.titleKey] || ""}
                      onChange={(e) => setConfig({
                        ...config,
                        sectionTitles: { ...config.sectionTitles, [sec.titleKey]: e.target.value }
                      })}
                      className="h-8 text-xs rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold">Section Subtitle / Description</Label>
                    <Input
                      value={config.sectionTitles?.[sec.descKey] || ""}
                      onChange={(e) => setConfig({
                        ...config,
                        sectionTitles: { ...config.sectionTitles, [sec.descKey]: e.target.value }
                      })}
                      className="h-8 text-xs rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 6: FOOTER & CONTACT INFO */}
        <TabsContent value="footer" className="space-y-4">
          <Card className="rounded-2xl border-border/60 p-6 bg-card space-y-6">
            <div>
              <CardTitle className="text-lg font-bold font-headline flex items-center gap-2">
                <Globe className="w-5 h-5 text-violet-600" /> Footer Links & Contact Details
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Manage contact numbers, email, campus address, office hours, and social media handles.
              </CardDescription>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-600" /> Contact Phone</Label>
                <Input
                  value={config.contactPhone}
                  onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-600" /> Contact Email</Label>
                <Input
                  value={config.contactEmail}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" /> Campus Address</Label>
                <Input
                  value={config.contactAddress}
                  onChange={(e) => setConfig({ ...config, contactAddress: e.target.value })}
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="font-bold">Office Hours</Label>
                <Input
                  value={config.officeHours}
                  onChange={(e) => setConfig({ ...config, officeHours: e.target.value })}
                  className="h-9 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-4 text-xs">
              <h4 className="text-sm font-bold font-headline">Social Media Handles</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-bold">Facebook URL</Label>
                  <Input value={config.facebookUrl} onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })} className="h-9 rounded-xl text-xs font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold">Instagram URL</Label>
                  <Input value={config.instagramUrl} onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })} className="h-9 rounded-xl text-xs font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold">LinkedIn URL</Label>
                  <Input value={config.linkedinUrl} onChange={(e) => setConfig({ ...config, linkedinUrl: e.target.value })} className="h-9 rounded-xl text-xs font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold">Twitter / X URL</Label>
                  <Input value={config.twitterUrl} onChange={(e) => setConfig({ ...config, twitterUrl: e.target.value })} className="h-9 rounded-xl text-xs font-mono" />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
