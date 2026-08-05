import { BackToTopButton } from "@/components/back-to-top-button";
import Footer from "@/components/footer";
import { Header } from "@/components/header";
import { supabase } from "@/lib/supabase";
import { Event } from "@/app/admin/content-management/events/data/schema";
import { z } from "zod";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { getEvents, getSettings } from "@/lib/data-fetching";


export default async function AllEventsPage() {
  const events = await getEvents();
  const settings = await getSettings();
  const footerContent = {
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      linkedinUrl: settings.linkedinUrl,
      twitterUrl: settings.twitterUrl,
  }
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4">
             <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline">School Events</h1>
                <p className="text-muted-foreground mt-2">Stay up-to-date with all our school&apos;s activities.</p>
            </div>
            {events.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                    <div key={event.id} className="group perspective-1000">
                        <Card className="h-full flex flex-col transform-style-3d transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/20 bg-secondary/30 border-border/20">
                            <CardHeader className="p-0">
                                <Image
                                    src={event.imageUrl || "https://placehold.co/600x400.png"}
                                    alt={event.title}
                                    width={600}
                                    height={400}
                                    className="w-full h-48 object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-105"
                                    data-ai-hint="school event"
                                />
                            </CardHeader>
                            <CardContent className="p-6 flex-grow">
                                <CardTitle className="text-xl font-bold font-headline mb-2">{event.title}</CardTitle>
                                <div className="flex items-center text-sm text-muted-foreground mb-4">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>{format(new Date(event.date), "PPP")}</span>
                                </div>
                                <CardDescription className="line-clamp-3 text-sm">
                                    {event.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-2xl font-bold tracking-tight">No events scheduled</h3>
                    <p className="text-sm text-muted-foreground">Please check back later for new events.</p>
                </div>
            )}
        </div>
      </main>
      <Footer content={footerContent} />
      <BackToTopButton />
    </div>
  );
}
