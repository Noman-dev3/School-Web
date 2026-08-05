
"use client"
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import Image from 'next/image';
import { about } from "@/lib/data";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutSection() {
  const [content, setContent] = useState({ description: "", imageUrl: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAboutContent() {
      const { data } = await supabase.from('settings').select('ourStory, aboutImageUrl').limit(1).single();
      if (data) {
        setContent({
          description: data.ourStory || about.description,
          imageUrl: data.aboutImageUrl || about.image.src,
        });
      } else {
        setContent({
          description: about.description,
          imageUrl: about.image.src,
        });
      }
      setLoading(false);
    }
    loadAboutContent();
  }, []);


  if(loading) {
    return (
        <section id="about" className="py-20 lg:py-32 px-6 lg:px-12 bg-secondary">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-12 w-3/4 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div>
                <Skeleton className="w-full h-[450px] rounded-xl" />
              </div>
            </div>
          </div>
        </section>
    )
  }

  return (
    <section id="about" className="py-20 lg:py-32 px-6 lg:px-12 bg-secondary">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge
              variant="outline"
              className="mb-4 bg-background/50 border-white/20"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              {about.badge}
            </Badge>
            <h2 className="text-4xl font-bold mb-6 font-headline">{about.title}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {content.description}
            </p>
          </div>
          <div>
            <Card className="overflow-hidden rounded-xl shadow-lg">
              <Image
                src={content.imageUrl}
                alt={about.image.alt}
                width={600}
                height={450}
                className="w-full h-auto object-cover"
                data-ai-hint={about.image.hint}
              />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
