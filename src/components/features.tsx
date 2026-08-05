"use client";

import React from "react";
import { Users, GraduationCap, BookOpen, Trophy, ShieldCheck, Sparkles, Cpu, HeartHandshake } from "lucide-react";

export function Features() {
  const pillars = [
    {
      icon: GraduationCap,
      title: "Dual Academic Model",
      badge: "Cambridge & FBISE",
      description: "Combines national FBISE exam excellence with international Cambridge standard critical thinking and inquiry-based learning.",
    },
    {
      icon: HeartHandshake,
      title: "Moral & Quranic Values",
      badge: "Character Building",
      description: "Daily Quranic tajweed, Nazra, Hifz integration, and character-first mentorship fostering compassionate Islamic leadership.",
    },
    {
      icon: Cpu,
      title: "Modern STEM & Robotics",
      badge: "Tech & Science",
      description: "Fully equipped computer science suites, physics/chemistry/biology laboratories, and hands-on coding and robotics projects.",
    },
    {
      icon: Users,
      title: "World-Class Educators",
      badge: "1:15 Ratio",
      description: "Master's & PhD certified faculty dedicated to personalized student attention, academic remediation, and career guidance.",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Institutional Distinctives</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-headline text-foreground tracking-tight mb-4">
          Why Parents Choose PIISS
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          We blend academic rigor with timeless moral values to build well-rounded scholars who excel in world board exams and lead with integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-headline text-foreground mb-2 group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Excellence</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
