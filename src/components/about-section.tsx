"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  ShieldCheck,
  Compass,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpenCheck,
  Quote,
  BookOpen
} from "lucide-react";
import { about } from "@/lib/data";

interface AboutSectionProps {
  content: {
    description?: string;
    imageUrl?: string;
    aboutTitle?: string;
    aboutEyebrow?: string;
    principalName?: string;
    principalRole?: string;
    principalMessage?: string;
  };
}

export default function AboutSection({ content }: AboutSectionProps) {
  const [activeTab, setActiveTab] = useState<"vision" | "mission" | "heritage">("vision");

  const title = content.aboutTitle || "About Pakistan Islamic International School System";
  const eyebrow = content.aboutEyebrow || "OUR HERITAGE & PURPOSE";
  const description = content.description || "Founded with a pioneering spirit in 2015, the Pakistan Islamic International School System (PIISS) embarked on a mission to redefine education by seamlessly blending FBISE board academic distinction with timeless Quranic ethics.";
  const imageUrl = content.imageUrl || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1000&q=80";

  const principalName = content.principalName || "Prof. Dr. Muhammad Ishaq";
  const principalRole = content.principalRole || "Principal & Academic Director, PIISS";
  const principalMessage = content.principalMessage || "At PIISS, we nurture not just academic scholars, but young believers equipped with moral integrity, scientific intellect, and Quranic ethics to lead humanity with wisdom.";

  const pillars = [
    {
      icon: ShieldCheck,
      title: "FBISE Board Distinction",
      description: "Consistent 100% pass rates and top positions in Federal Board Matric & FSc examinations.",
    },
    {
      icon: Compass,
      title: "Holistic Character Building",
      description: "Infusing academic learning with Quranic values, leadership skills, and civic responsibility.",
    },
    {
      icon: BookOpenCheck,
      title: "STEM & Digital Curriculum",
      description: "Equipping scholars with computer coding, robotics, and advanced scientific experimentation.",
    },
  ];

  const tabContents = {
    vision: {
      heading: "Envisioning Future Islamic & STEM Leaders",
      body: "To be Pakistan's premier educational institution where spiritual purity and scientific excellence converge, nurturing scholars who lead with intellect and moral uprightness on global stages.",
      points: [
        "Gold Standard Science & Computer Labs",
        "Dual Cambridge & FBISE Curriculum Pathways",
        "Personalized Mentorship for Every Scholar",
      ],
    },
    mission: {
      heading: "Academic Rigor & Ethical Foundations",
      body: "Our mission is to cultivate an inspiring learning environment that challenges students academically while embedding Islamic ethics, critical thinking, and character resilience.",
      points: [
        "100% Certified Master's & PhD Faculty",
        "Daily Hifz & Nazra Quran Integration",
        "Extensive Co-Curricular & Sports Galas",
      ],
    },
    heritage: {
      heading: "A Legacy of Merit & Distinction Since 2015",
      body: "Founded with a vision to revolutionize Islamic education in Pakistan, PIISS has grown into a beacon of academic distinction, serving over 2,500 students across 12 grades.",
      points: [
        "10+ Years of Institutional Leadership",
        "Top Positions in FBISE Examinations",
        "Modern Multi-Acre Secure Campus",
      ],
    },
  };

  const currentTab = tabContents[activeTab];

  return (
    <section id="about" className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-card border-y border-border/60 relative overflow-hidden">
      {/* Background Accent Mesh */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10 space-y-16">
        
        {/* Top Quranic Motto Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center shrink-0 shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Institutional Motto</p>
              <h3 className="text-lg sm:text-xl font-bold font-headline font-serif text-amber-100 italic mt-0.5">
                &quot; اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ — Read in the name of your Lord who created. &quot;
              </h3>
            </div>
          </div>
          <span className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold shrink-0">
            Surah Al-Alaq (96:1)
          </span>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="text-amber-500 font-extrabold text-xs tracking-[0.2em] uppercase">
              {eyebrow}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-teal-400 rotate-[180deg]" />
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-amber-400 rotate-[180deg]" />
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-rose-500 rotate-[180deg]" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline text-foreground tracking-tight">
            Building Leaders with <span className="text-amber-500">Faith &amp; Science</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Campus Image & Stat Overlay */}
          <div className="lg:col-span-6 relative space-y-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Main Image Frame */}
              <div className="relative rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-muted group">
                <Image
                  src={imageUrl}
                  alt="PIISS Campus"
                  width={800}
                  height={600}
                  className="w-full h-[380px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Established 2015
                    </span>
                    <span className="text-xs text-white/90 font-bold">• FBISE Federal Board Affiliated</span>
                  </div>
                  <h3 className="text-xl font-bold font-headline leading-tight text-white">
                    State-of-the-Art Learning &amp; Character Building Campus
                  </h3>
                </div>
              </div>

              {/* Principal Message Quote Card */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 mt-6">
                <div className="flex items-start gap-3">
                  <Quote className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-foreground font-medium italic leading-relaxed">
                      &quot;{principalMessage}&quot;
                    </p>
                    <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-foreground font-headline">{principalName}</p>
                        <p className="text-[10px] text-muted-foreground">{principalRole}</p>
                      </div>
                      <Badge className="bg-amber-500 text-white text-[10px] font-bold">Principal Message</Badge>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Interactive Vision Tabs & Key Pillars */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Tab Nav Buttons */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/50 max-w-md">
              <button
                onClick={() => setActiveTab("vision")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "vision"
                    ? "bg-amber-500 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Our Vision
              </button>
              <button
                onClick={() => setActiveTab("mission")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "mission"
                    ? "bg-amber-500 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Our Mission
              </button>
              <button
                onClick={() => setActiveTab("heritage")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "heritage"
                    ? "bg-amber-500 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Our Heritage
              </button>
            </div>

            {/* Active Tab Panel */}
            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/60 space-y-4">
              <h3 className="text-xl font-bold font-headline text-foreground">
                {currentTab.heading}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {currentTab.body}
              </p>
              
              <div className="space-y-2 pt-2 border-t border-border/40">
                {currentTab.points.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-background border border-border/60 hover:border-amber-500/50 transition-colors">
                    <Icon className="w-5 h-5 text-amber-500 mb-2" />
                    <h4 className="text-xs font-bold text-foreground font-headline mb-1">{pillar.title}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{pillar.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Inquire Action */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Button size="lg" className="rounded-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-md text-xs px-7 py-5 gap-2" asChild>
                <Link href="/admissions">
                  <span>Explore Admissions 2026</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-amber-500/40 text-foreground font-bold text-xs px-6 py-5 hover:bg-amber-500/10" asChild>
                <Link href="/faculty">
                  <span>Meet Our Educators</span>
                </Link>
              </Button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
