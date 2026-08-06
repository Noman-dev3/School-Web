"use client";

import React from "react";
import Image from "next/image";

interface AboutSectionProps {
  content: {
    description?: string;
    imageUrl?: string;
    aboutTitle?: string;
    aboutEyebrow?: string;
    aboutStat1Value?: string;
    aboutStat1Label?: string;
    aboutStat2Value?: string;
    aboutStat2Label?: string;
    aboutStat3Value?: string;
    aboutStat3Label?: string;
    aboutStat4Value?: string;
    aboutStat4Label?: string;
  };
}

export default function AboutSection({ content }: AboutSectionProps) {
  const eyebrow = content.aboutEyebrow || "How it Started";
  const title = content.aboutTitle || "Our Dream is Global Learning Transformation";
  const storyText = content.description || "Kawruh was founded by Robert Anderson, a passionate lifelong learner and Maria Sanchez, a visionary educator. Their shared dream was to create a digital haven of knowledge accessible to all. United by their belief in the transformational power of education, they embarked on a journey to build a premier institution.";
  const imageUrl = content.imageUrl || "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80";

  const stat1Val = content.aboutStat1Value || "10+";
  const stat1Lbl = content.aboutStat1Label || "Years Experience";

  const stat2Val = content.aboutStat2Value || "100%";
  const stat2Lbl = content.aboutStat2Label || "FBISE Pass Rate";

  const stat3Val = content.aboutStat3Value || "2,500+";
  const stat3Lbl = content.aboutStat3Label || "Enrolled Scholars";

  const stat4Val = content.aboutStat4Value || "100+";
  const stat4Lbl = content.aboutStat4Label || "Certified Faculty";

  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background border-y border-border/50">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Clean Typography & Story */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-amber-500 font-extrabold text-sm sm:text-base tracking-normal">
              {eyebrow}
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline text-slate-900 dark:text-white leading-[1.18] tracking-tight">
              {title}
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground/90 font-normal leading-relaxed pt-2">
              {storyText}
            </p>
          </div>

          {/* RIGHT COLUMN: Image Frame & Minimal 2x2 Stats Grid */}
          <div className="lg:col-span-6 space-y-6">
            {/* Top Showcase Image */}
            <div className="relative rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-muted h-64 sm:h-80 w-full group">
              <Image
                src={imageUrl}
                alt="About Showcase"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bottom 2x2 Stats Grid from Reference Template */}
            <div className="grid grid-cols-2 gap-4">
              {/* Stat 1 */}
              <div className="bg-muted/40 p-5 sm:p-6 rounded-2xl border border-border/50 transition-all hover:bg-muted/70">
                <p className="text-2xl sm:text-3xl font-black font-headline text-slate-900 dark:text-white mb-1">
                  {stat1Val}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  {stat1Lbl}
                </p>
              </div>

              {/* Stat 2 */}
              <div className="bg-muted/40 p-5 sm:p-6 rounded-2xl border border-border/50 transition-all hover:bg-muted/70">
                <p className="text-2xl sm:text-3xl font-black font-headline text-slate-900 dark:text-white mb-1">
                  {stat2Val}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  {stat2Lbl}
                </p>
              </div>

              {/* Stat 3 */}
              <div className="bg-muted/40 p-5 sm:p-6 rounded-2xl border border-border/50 transition-all hover:bg-muted/70">
                <p className="text-2xl sm:text-3xl font-black font-headline text-slate-900 dark:text-white mb-1">
                  {stat3Val}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  {stat3Lbl}
                </p>
              </div>

              {/* Stat 4 */}
              <div className="bg-muted/40 p-5 sm:p-6 rounded-2xl border border-border/50 transition-all hover:bg-muted/70">
                <p className="text-2xl sm:text-3xl font-black font-headline text-slate-900 dark:text-white mb-1">
                  {stat4Val}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  {stat4Lbl}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
