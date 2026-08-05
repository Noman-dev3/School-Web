
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ArrowRight, PartyPopper } from "lucide-react";
import { eventsSection } from "@/lib/data";
import { Event } from "@/app/admin/data-schemas";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";

interface EventsSectionProps {
  events: Event[];
}

export default function EventsSection({ events }: EventsSectionProps) {

  return (
    <section id="events" className="py-20 lg:py-32 px-6 lg:px-12 bg-secondary/50">
      <div className="container mx-auto text-center">
        <Badge
          variant="outline"
          className="mb-4 bg-background/50"
        >
          <PartyPopper className="w-4 h-4 mr-2" />
          {eventsSection.badge}
        </Badge>
        <h2 className="text-4xl font-bold mb-4 font-headline">{eventsSection.title}</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          {eventsSection.description}
        </p>

        {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {events.map((event, index) => (
                <div key={index} className="group perspective-1000">
                    <Card className="h-full bg-background/60 rounded-xl shadow-lg transition-all duration-500 transform-style-3d group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/20">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{event.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-muted-foreground mb-4">
                                <CalendarDays className="w-5 h-5 mr-3 text-primary" />
                                <span className="text-sm font-medium">{format(new Date(event.date), "PPP")}</span>
                            </div>
                            <p className="text-muted-foreground/80">{event.description}</p>
                        </CardContent>
                    </Card>
                </div>
            ))}
            </div>
        ) : (
          <p className="text-muted-foreground">No upcoming events. Please check back soon!</p>
        )}

        <div className="mt-16 text-center">
            <Button size="lg" variant="outline" asChild>
                <Link href="/events">{eventsSection.viewAllButton} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
