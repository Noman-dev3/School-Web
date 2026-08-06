"use client";

import * as React from "react";
import Image from "next/image";
import { Star, Award, Trophy, Medal, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { toppersSection } from "@/lib/data";
import { Topper } from "@/app/admin/data-schemas";

interface ToppersSectionProps {
  toppers: Topper[];
}

export default function ToppersSection({ toppers }: ToppersSectionProps) {
  return (
    <section id="results" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-card/60 border-y border-border/50 relative overflow-hidden">
      {/* Background Accent Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="text-amber-500 font-extrabold text-xs tracking-[0.2em] uppercase">
              EXCELLENCE HALL OF FAME
            </span>
            <div className="flex items-center gap-1">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-teal-400 rotate-[180deg]" />
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-amber-400 rotate-[180deg]" />
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-rose-500 rotate-[180deg]" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline text-foreground tracking-tight">
            FBISE Board <span className="text-amber-500">Distinction Achievers</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Celebrating our star scholars who secured top positions across Federal Board (FBISE) matric and intermediate examinations.
          </p>
        </div>

        {toppers && toppers.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: toppers.length > 1,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {toppers.map((topper, index) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-2">
                    <Card className="bg-background rounded-3xl border border-border/80 shadow-md hover:shadow-2xl hover:border-amber-500/50 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden group">
                      <div className="p-6 text-center space-y-4">
                        
                        {/* Rank Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-amber-500" /> Rank #{index + 1} Position
                          </span>
                          <Sparkles className="w-4 h-4 text-amber-500 opacity-60" />
                        </div>

                        {/* Student Avatar with Golden Ring */}
                        <div className="relative w-28 h-28 mx-auto my-2">
                          <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full blur-xs opacity-75 group-hover:opacity-100 transition-opacity" />
                          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-background bg-muted">
                            <Image
                              src={topper.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                              alt={topper.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>

                        {/* Student Details */}
                        <div>
                          <h3 className="text-lg font-extrabold font-headline text-foreground group-hover:text-amber-500 transition-colors">
                            {topper.name}
                          </h3>
                          <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                            Class {topper.class} • FBISE Board Merit
                          </p>
                        </div>

                        {/* Score Highlight Pill */}
                        <div className="pt-2">
                          <div className="inline-flex items-center gap-2 bg-amber-500 text-white font-extrabold text-sm px-5 py-2 rounded-full shadow-md">
                            <Medal className="w-4 h-4" />
                            <span>{topper.score}</span>
                          </div>
                        </div>

                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-5 bg-background border-border hover:bg-amber-500 hover:text-white" />
            <CarouselNext className="hidden sm:flex -right-5 bg-background border-border hover:bg-amber-500 hover:text-white" />
          </Carousel>
        ) : (
          <div className="p-12 text-center bg-background rounded-3xl border border-border/60 max-w-xl mx-auto space-y-3">
            <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold font-headline">Annual FBISE Merit Results Pending</h3>
            <p className="text-xs text-muted-foreground">Board position achievers for the 2026 academic session will be published shortly.</p>
          </div>
        )}
      </div>
    </section>
  );
}
