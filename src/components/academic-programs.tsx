"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Award } from "lucide-react";
import { Button } from "./ui/button";

export function AcademicPrograms() {
  const programs = [
    {
      title: "Early Childhood Division",
      subtitle: "Nursery to Kindergarten (Ages 3-5)",
      description: "Montessori-inspired foundational learning focusing on language phonics, motor skills, social empathy, and basic Islamic manners.",
      highlights: [
        "Phonics & Language Enrichment",
        "Activity & Play-Based Learning",
        "Daily Hifz & Nazra Quran",
        "Safe & Nurturing Environment",
      ],
      tag: "Foundation Level",
    },
    {
      title: "Primary Academic Stream",
      subtitle: "Grade 1 to Grade 5 (Ages 6-10)",
      description: "Comprehensive curriculum establishing core literacy, mathematical reasoning, computer awareness, science, and Quranic recitation.",
      highlights: [
        "Cambridge Standard Science & Math",
        "Computer Literacy & Logic Labs",
        "Arabic & Urdu Expression",
        "Co-curricular Sports & Arts",
      ],
      tag: "Primary Level",
    },
    {
      title: "Secondary School (FBISE)",
      subtitle: "Grade 6 to Grade 10 / Metric (Ages 11-15)",
      description: "Rigorous Federal Board (FBISE) preparation integrated with STEM robotics, analytical problem solving, and Islamic ethical studies.",
      highlights: [
        "FBISE Metric Exam Excellence",
        "State-of-the-art Physics & Chemistry Labs",
        "Robotics & Coding Workshops",
        "Debate & Quran Recitation Competitions",
      ],
      tag: "Secondary Level",
    },
    {
      title: "Higher Secondary (HSSC)",
      subtitle: "Grade 11 to 12 / FSC & ICS (Ages 16-18)",
      description: "Specialized college-level education for Pre-Medical, Pre-Engineering, and Computer Science (ICS) with university entrance prep.",
      highlights: [
        "FSc Pre-Medical & Pre-Engineering",
        "ICS (Computer Science Stream)",
        "Entry Test Prep (MDCAT/ECAT)",
        "Career Counseling & Mentorship",
      ],
      tag: "College Level",
    },
  ];

  return (
    <section id="programs" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-secondary/40 border-y border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Pathways</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline text-foreground tracking-tight mb-4">
            Structured Educational Divisions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            From early childhood character building to pre-university HSSC science streams, our curriculum provides seamless progression and academic distinction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((prog, idx) => (
            <div
              key={idx}
              className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {prog.tag}
                  </span>
                  <Award className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-bold font-headline text-foreground mb-1 group-hover:text-primary transition-colors">
                  {prog.title}
                </h3>
                <p className="text-xs font-medium text-primary/80 mb-3">
                  {prog.subtitle}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  {prog.description}
                </p>

                <div className="space-y-2 border-t border-border/50 pt-4 mb-6">
                  {prog.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                asChild
              >
                <Link href="/admissions">
                  <span>Inquire Admission</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
