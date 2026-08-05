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
  HeartHandshake,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpenCheck,
} from "lucide-react";
import { about } from "@/lib/data";

interface AboutSectionProps {
  content: {
    description: string;
    imageUrl: string;
  };
}

export default function AboutSection({ content }: AboutSectionProps) {
  const [activeTab, setActiveTab] = useState<"vision" | "mission" | "heritage">("vision");

  const pillars = [
    {
      icon: ShieldCheck,
      title: "Federal Board Distinction",
      description: "Consistent 100% pass rates and board positions in FBISE Matric and FSc exams.",
    },
    {
      icon: Compass,
      title: "Holistic Character Building",
      description: "Infusing academic learning with Quranic values, leadership skills, and civic responsibility.",
    },
    {
      icon: BookOpenCheck,
      title: "STEM & Digital Curriculum",
      description: "Equipping scholars with coding, robotics, and advanced scientific experimentation.",
    },
  ];

  const tabContents = {
    vision: {
      heading: "Envisioning Future Islamic & STEM Leaders",
      body: "To be Pakistan's premier educational institution where spiritual purity and scientific excellence converge, nurturing scholars who lead with intellect and moral uprightness on global stages.",
      points: [
        "Gold Standard Science & Computer Labs",
        "Dual Cambridge & FBISE Curriculum Tracks",
        "Personalized Student Mentorship",
      ],
    },
    mission: {
      heading: "Academic Rigor & Ethical Foundations",
      body: "Our mission is to cultivate an inspiring learning environment that challenges students academically while embedding Islamic ethics, critical thinking, and character resilience.",
      points: [
        "100% Certified Master's Faculty",
        "Daily Hifz & Nazra Quran Integration",
        "Extensive Co-Curricular & Sports Galas",
      ],
    },
    heritage: {
      heading: "A Legacy of Merit & Excellence Since 2015",
      body: "Founded with a vision to revolutionize Islamic education in Pakistan, PIISS has grown into a beacon of academic distinction, serving over 2,500 students across 12 grades.",
      points: [
        "10+ Years of Educational Leadership",
        "Top Positions in FBISE Examinations",
        "Modern Multi-Acres Secure Campus",
      ],
    },
  };

  const currentTab = tabContents[activeTab];

  return (
    <section id="about" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-card border-y border-border/60 relative overflow-hidden">
      {/* Background Accent Mesh */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Our Heritage & Purpose</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-headline text-foreground tracking-tight mb-4">
            Building Leaders of Tomorrow with Faith & Science
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {content.description || about.description}
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Campus Image & Stat Overlay */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Main Image Frame */}
              <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-muted group">
                <Image
                  src={content.imageUrl || about.image.src || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1000&q=80"}
                  alt={about.image.alt || "PIISS Campus"}
                  width={800}
                  height={600}
                  className="w-full h-[420px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-accent/90 text-accent-foreground text-[10px] font-extrabold uppercase tracking-wider">
                      Established 2015
                    </span>
                    <span className="text-xs text-white/80 font-medium">• FBISE Affiliated</span>
                  </div>
                  <h3 className="text-xl font-bold font-headline leading-tight">
                    State-of-the-Art Learning & Character Development Campus
                  </h3>
                </div>
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -right-2 sm:-right-6 bg-card border border-border/80 p-4 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-4 max-w-xs">
                <div className="p-3 rounded-xl bg-primary text-primary-foreground shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black font-headline text-foreground">10+ Years</p>
                  <p className="text-xs text-muted-foreground font-medium">Of Academic Distinction & Character Building</p>
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
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "vision"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Our Vision
              </button>
              <button
                onClick={() => setActiveTab("mission")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "mission"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Our Mission
              </button>
              <button
                onClick={() => setActiveTab("heritage")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "heritage"
                    ? "bg-primary text-primary-foreground shadow-sm"
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
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
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
                  <div key={idx} className="p-3.5 rounded-xl bg-background border border-border/60 hover:border-primary/50 transition-colors">
                    <Icon className="w-5 h-5 text-primary mb-2" />
                    <h4 className="text-xs font-bold text-foreground font-headline mb-1">{pillar.title}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{pillar.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Inquire Action */}
            <div className="pt-2 flex items-center gap-4">
              <Button size="lg" className="rounded-full shadow-md text-xs font-bold px-6 py-5" asChild>
                <Link href="/admissions">
                  <span>Explore Admissions</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="rounded-full text-xs font-bold px-5 py-5 hover:bg-muted" asChild>
                <Link href="/faculty">
                  <span>Meet Our Faculty</span>
                </Link>
              </Button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
