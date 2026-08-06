"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { 
  ArrowRight, ChevronLeft, ChevronRight, UserCheck, 
  BookOpen, Globe, Award, Sparkles, ShieldCheck 
} from "lucide-react";

interface HeroProps {
  taglines?: string[];
  settings?: any;
}

export function Hero({ taglines, settings = {} }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Extract CMS settings with fallback defaults matching template
  const eyebrow = settings.heroEyebrow || "ABOUT US";
  const titlePart1 = settings.heroTitlePart1 || "We are the top";
  const titlePart2 = settings.heroTitlePart2 || "Learning Platform.";
  const description = settings.heroSub || "Empowering scholars with advanced learning tools, Quranic ethics, and FBISE board distinction merit to redefine education for a brighter future.";
  const ctaText = settings.heroCtaText || "Register Now";
  const ctaLink = settings.heroCtaLink || "/admissions";
  const cta2Text = settings.heroCta2Text || "Learn More";
  const cta2Link = settings.heroCta2Link || "/#about";
  const imageUrl = settings.heroImageUrl || "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80";

  const card1Title = settings.heroCard1Title || "Quality Teachers";
  const card1Desc = settings.heroCard1Desc || "Certified & experienced educators dedicated to individual student growth.";
  const card2Title = settings.heroCard2Title || "Best Curriculum";
  const card2Desc = settings.heroCard2Desc || "Balanced FBISE academic rigor integrated with modern STEM robotics.";
  const card3Title = settings.heroCard3Title || "Global Recognition";
  const card3Desc = settings.heroCard3Desc || "100% board pass percentage with top positions across Federal Board.";

  const heroImages = [
    imageUrl,
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80"
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <section id="home" className="relative pt-6 lg:pt-10 overflow-hidden bg-background">
      {/* Container */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Main Hero Row */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-12 lg:pb-16">
          
          {/* LEFT HERO CONTENT */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Eyebrow + Geometric Accents matching template */}
            <div className="flex items-center gap-3">
              <span className="text-amber-500 font-extrabold text-xs tracking-[0.2em] uppercase">
                {eyebrow}
              </span>

              {/* Decorative Geometric Triangles from Template */}
              <div className="flex items-center gap-1">
                <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[11px] border-l-teal-400 rotate-[180deg]" />
                <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[11px] border-l-amber-400 rotate-[180deg]" />
                <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[11px] border-l-rose-500 rotate-[180deg]" />
              </div>
            </div>

            {/* Dual-Color Punchy Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white font-headline leading-[1.12] tracking-tight">
              {titlePart1}{" "}
              <span className="text-amber-500 underline decoration-amber-400/40 decoration-4 underline-offset-8">
                {titlePart2}
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-xl">
              {description}
            </p>

            {/* CTA Pill Buttons matching template */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href={ctaLink}>
                <Button 
                  size="lg" 
                  className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-full px-7 py-6 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-105 gap-2 text-sm"
                >
                  <span>{ctaText}</span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </Button>
              </Link>

              <Link href={cta2Link}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-amber-500/80 text-foreground hover:bg-amber-500/10 font-extrabold rounded-full px-7 py-6 transition-all text-sm"
                >
                  <span>{cta2Text}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT HERO IMAGE SHOWCASE WITH CAROUSEL CONTROLS */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Carousel Left Arrow */}
              <button
                onClick={handlePrevSlide}
                className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white flex items-center justify-center shadow-lg transition-all border border-white/20 hover:scale-110"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Main Image Container */}
              <div className="relative rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-900 group h-80 sm:h-96">
                <Image
                  src={heroImages[currentSlide]}
                  alt="School Campus & Classroom"
                  fill
                  priority
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === idx ? "w-6 bg-amber-400" : "w-2 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Carousel Right Arrow */}
              <button
                onClick={handleNextSlide}
                className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white flex items-center justify-center shadow-lg transition-all border border-white/20 hover:scale-110"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM 3-CARD BANNER FEATURE GRID matching reference template */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3">
        {/* Card 1: Pink / Coral Red */}
        <div className="bg-rose-500 text-white p-6 sm:p-8 flex items-start gap-4 transition-colors hover:bg-rose-600">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl font-headline mb-1">
              {card1Title}
            </h3>
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
              {card1Desc}
            </p>
          </div>
        </div>

        {/* Card 2: Warm Amber Yellow */}
        <div className="bg-amber-500 text-white p-6 sm:p-8 flex items-start gap-4 transition-colors hover:bg-amber-600">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl font-headline mb-1">
              {card2Title}
            </h3>
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
              {card2Desc}
            </p>
          </div>
        </div>

        {/* Card 3: Teal / Emerald Green */}
        <div className="bg-teal-600 text-white p-6 sm:p-8 flex items-start gap-4 transition-colors hover:bg-teal-700">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl font-headline mb-1">
              {card3Title}
            </h3>
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
              {card3Desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
