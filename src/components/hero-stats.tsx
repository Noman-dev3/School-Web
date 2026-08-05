"use client";

import React from "react";
import { Award, Users, BookOpen, GraduationCap } from "lucide-react";

export function HeroStats() {
  const stats = [
    {
      icon: Award,
      value: "99.4%",
      label: "Board Pass & Distinction Rate",
      description: "Federal Board (FBISE) Outstanding Merit",
    },
    {
      icon: Users,
      value: "2,500+",
      label: "Enrolled Scholars",
      description: "From Kindergarten to HSSC Levels",
    },
    {
      icon: GraduationCap,
      value: "100+",
      label: "Master's & PhD Faculty",
      description: "Experienced, Certified Educators",
    },
    {
      icon: BookOpen,
      value: "1:15",
      label: "Teacher-Student Ratio",
      description: "Ensuring Personal Mentorship",
    },
  ];

  return (
    <section className="relative z-20 max-w-6xl mx-auto px-4 -mt-10 sm:-mt-14 mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xl backdrop-blur-md">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/40 transition-colors"
            >
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-headline tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-foreground/90 mt-0.5">
                  {stat.label}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {stat.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
