"use client";

import React from "react";
import Link from "next/link";
import { FileText, Trophy, CalendarDays, Compass, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

export function QuickPortalGrid() {
  const portals = [
    {
      title: "Online Admission 2026-27",
      subtitle: "Apply online in 5 minutes for Nursery to HSSC streams.",
      href: "/admissions",
      badge: "Open Now",
      icon: FileText,
      color: "border-amber-500/40 hover:border-amber-500",
    },
    {
      title: "Board Examination Results",
      subtitle: "Check FBISE Metric & FSC merit lists, position holders & grades.",
      href: "/results",
      badge: "Updated",
      icon: Trophy,
      color: "border-amber-500/40 hover:border-amber-500",
    },
    {
      title: "Academic Streams & Divisions",
      subtitle: "Explore Early Childhood, Primary, Secondary & Higher Secondary.",
      href: "/#programs",
      badge: "Curriculum",
      icon: Compass,
      color: "border-amber-500/40 hover:border-amber-500",
    },
    {
      title: "School Events & Calendar",
      subtitle: "Upcoming exams, sports galas, debates, and Quran exhibitions.",
      href: "/events",
      badge: "Schedule",
      icon: CalendarDays,
      color: "border-amber-500/40 hover:border-amber-500",
    },
  ];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-amber-500 font-extrabold text-xs tracking-[0.2em] uppercase">
              PORTALS & SERVICES
            </span>
            <div className="flex items-center gap-1">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-teal-400 rotate-[180deg]" />
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-amber-400 rotate-[180deg]" />
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-rose-500 rotate-[180deg]" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-headline text-foreground tracking-tight">
            Key Academic <span className="text-amber-500">Services & Portals</span>
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
          Quickly access essential school resources, admission forms, board examination results, and upcoming academic events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portals.map((portal, idx) => {
          const IconComponent = portal.icon;
          return (
            <Link
              key={idx}
              href={portal.href}
              className={`bg-card rounded-2xl p-5 border shadow-xs hover:shadow-lg transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1 ${portal.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {portal.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold font-headline text-foreground mb-1.5 group-hover:text-amber-500 transition-colors flex items-center gap-1">
                  <span>{portal.title}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {portal.subtitle}
                </p>
              </div>

              <div className="flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 mt-4 pt-3 border-t border-border/40 group-hover:underline">
                <span>Access Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
