"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { hero } from "@/lib/data";
import TypingAnimation from "./typing-animation";
import { ArrowRight, ShieldCheck, Award, Sparkles, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";

interface HeroProps {
  taglines: string[];
}

export function Hero({ taglines }: HeroProps) {
  return (
    <section id="home" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden bg-background">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-radial-[at_top_center] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Accreditation Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Federal Board FBISE Affiliated</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-foreground text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Est. 2015 • Cambridge & Quranic Standard</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight font-headline leading-[1.15]">
              Pakistan Islamic International <span className="text-primary underline decoration-primary/30 underline-offset-8">School System</span>
            </h1>

            {/* Subtitle with Typing Animation */}
            <div className="text-base sm:text-lg lg:text-xl text-muted-foreground font-medium max-w-2xl min-h-[56px] flex items-center">
              <TypingAnimation titles={taglines} />
            </div>

            {/* Key Value Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/90">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>100% Board Pass & Distinction Merit</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/90">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Balanced Modern STEM & Hifz Program</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/90">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Certified Master&apos;s Qualified Educators</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/90">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>State-of-the-Art Science & Tech Labs</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button size="lg" className="rounded-full shadow-md text-sm font-semibold px-7 py-6" asChild>
                <Link href="/admissions">
                  <span>Apply for Admission 2026</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="rounded-full text-sm font-semibold px-7 py-6 border-border/80 hover:bg-muted/60" asChild>
                <Link href="/results">
                  <Award className="w-4 h-4 mr-2 text-primary" />
                  <span>View Board Results</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main School Showcase Card */}
              <div className="relative bg-card rounded-3xl p-3 border border-border/80 shadow-2xl overflow-hidden group">
                <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
                    alt="PIISS Campus & Students"
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Overlay Motto */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Our Institutional Motto</p>
                    <p className="text-sm font-semibold leading-snug font-headline">
                      &quot;Knowledge for divine recognition &amp; empowering young minds with modern intellect.&quot;
                    </p>
                  </div>
                </div>

                {/* Floating Badge 1: Board Rank Holder */}
                <div className="absolute top-6 right-6 bg-card/95 backdrop-blur-md p-3 rounded-2xl border border-border/80 shadow-lg flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-foreground font-headline">1st Position FBISE</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Federal Board Distinction</p>
                  </div>
                </div>

                {/* Floating Badge 2: Islamic & STEM */}
                <div className="absolute bottom-16 -left-4 hidden sm:flex bg-card/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-border/80 shadow-xl items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-accent/30 text-foreground">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Integrated Quran & STEM</p>
                    <p className="text-[10px] text-muted-foreground">Holistic Character Building</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
