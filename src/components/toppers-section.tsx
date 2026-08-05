
"use client";

import * as React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
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
    <section id="results" className="py-20 lg:py-32 px-6 lg:px-12">
      <div className="container mx-auto text-center">
        <Badge
          variant="outline"
          className="mb-4 bg-background/50"
        >
          <Star className="w-4 h-4 mr-2" />
          {toppersSection.badge}
        </Badge>
        <h2 className="text-4xl font-bold mb-4 font-headline">
          {toppersSection.title}
        </h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          {toppersSection.description}
        </p>
        {toppers && toppers.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: toppers.length > 1,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {toppers.map((topper, index) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-1">
                    <Card className="bg-secondary/50 border-border/50 hover:bg-secondary/80 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl">
                      <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                        <Image
                          src={topper.imageUrl || "https://placehold.co/128x128.png"}
                          alt={topper.name}
                          width={128}
                          height={128}
                          data-ai-hint="student portrait"
                          className="rounded-full border-4 border-primary/50 object-cover w-32 h-32"
                        />
                        <div className="text-center">
                          <h3 className="text-xl font-bold font-headline">
                            {topper.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Class {topper.class}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-bold text-lg bg-primary/10 px-4 py-2 rounded-full">
                          <Star className="w-5 h-5" />
                          <span>{topper.score}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4" />
            <CarouselNext className="hidden sm:flex -right-4" />
          </Carousel>
        ) : (
            <p className="text-center text-muted-foreground">Our top performers will be announced soon!</p>
        )}
      </div>
    </section>
  );
}
