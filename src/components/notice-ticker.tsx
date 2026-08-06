"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Megaphone, ArrowRight, X, PhoneCall, Sparkles } from "lucide-react";

interface NoticeTickerProps {
  text?: string;
  link?: string;
}

export function NoticeTicker({ text, link }: NoticeTickerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const displayText = text || "Applications open for Kindergarten to Grade 12 & HSSC (Pre-Medical / Engineering / ICS).";
  const targetLink = link || "/admissions";

  return (
    <div className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground py-2 px-4 text-xs sm:text-sm font-medium shadow-sm transition-all relative z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 shadow-xs">
            <Sparkles className="w-3 h-3" />
            Admissions 2026-27
          </span>
          <p className="truncate text-primary-foreground/95">
            {displayText}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            href={targetLink}
            className="inline-flex items-center gap-1 font-semibold text-accent hover:underline text-xs sm:text-sm"
          >
            Apply Online <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="hidden lg:flex items-center gap-1 text-xs text-primary-foreground/80 border-l border-primary-foreground/20 pl-4">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>+92 51 123 4567</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-md hover:bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
