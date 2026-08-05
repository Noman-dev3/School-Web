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
      color: "border-primary/30 hover:border-primary/70",
    },
    {
      title: "Board Examination Results",
      subtitle: "Check FBISE Metric & FSC merit lists, position holders & grades.",
      href: "/results",
      badge: "Updated",
      icon: Trophy,
      color: "border-accent/30 hover:border-accent/70",
    },
    {
      title: "Academic Streams & Divisions",
      subtitle: "Explore Early Childhood, Primary, Secondary & Higher Secondary.",
      href: "/#programs",
      badge: "Curriculum",
      icon: Compass,
      color: "border-primary/30 hover:border-primary/70",
    },
    {
      title: "School Events & Calendar",
      subtitle: "Upcoming exams, sports galas, debates, and Quran exhibitions.",
      href: "/events",
      badge: "Schedule",
      icon: CalendarDays,
      color: "border-primary/30 hover:border-primary/70",
    },
  ];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portals & Services</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline text-foreground tracking-tight">
            Key Academic Services & Portals
          </h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-md">
          Quickly access essential school resources, admission forms, board examination results, and upcoming academic events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portals.map((portal, idx) => {
          const Icon = portal.icon;
          return (
            <Link
              key={idx}
              href={portal.href}
              className={`group relative bg-card rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${portal.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    {portal.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground font-headline mb-1.5 group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{portal.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {portal.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
                <span>Access Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
