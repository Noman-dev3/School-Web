"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Megaphone, Calendar, ArrowRight, Sparkles, Award } from "lucide-react";

interface AdBannerProps {
  content?: {
    adBannerTitle?: string;
    adBannerSubtitle?: string;
    adBannerCtaText?: string;
    adBannerImageUrl?: string;
  };
}

export function AdBanner({ content }: AdBannerProps) {
  const title = content?.adBannerTitle || "Grand Annual Quran Recitation & STEM Exhibition 2026";
  const subtitle = content?.adBannerSubtitle || "Join us at the Main Campus Auditorium as our scholars present cutting-edge robotics projects & Hifz distinctions.";
  const ctaText = content?.adBannerCtaText || "Explore Event Highlights";
  const imageUrl = content?.adBannerImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 p-8 sm:p-12 shadow-2xl text-white">
        
        {/* Background Image Mesh */}
        <div className="absolute inset-0 z-0 opacity-25">
          <Image
            src={imageUrl}
            alt="Event Background"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SPECIAL INSTITUTIONAL EVENT</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline leading-tight text-white">
              {title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {subtitle}
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold text-amber-400 pt-1">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Academic Session 2026</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Open to Parents &amp; Visitors</span>
            </div>
          </div>

          <div className="lg:col-span-4 flex lg:justify-end">
            <Button size="lg" className="w-full sm:w-auto rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-8 py-6 gap-2 shadow-xl shadow-amber-500/20" asChild>
              <Link href="/events">
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
