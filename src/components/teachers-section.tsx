
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, ArrowRight } from "lucide-react";
import Image from "next/image";
import { teachersSection } from "@/lib/data";
import { Teacher } from "@/app/admin/data-schemas";
import Link from "next/link";
import React from "react";
import { formatExperience } from "@/lib/utils";

interface TeachersSectionProps {
  teachers: Teacher[];
}

const TeacherCard = ({ teacher }: { teacher: Teacher }) => {
  return (
    <div className="group perspective-1000">
      <Card className="h-full bg-secondary/50 rounded-xl shadow-lg transition-all duration-500 transform-style-3d group-hover:rotate-y-10 group-hover:shadow-2xl group-hover:shadow-primary/20">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Image
              src={teacher.imageUrl || "https://placehold.co/128x128.png"}
              alt={teacher.name}
              width={128}
              height={128}
              data-ai-hint="teacher portrait"
              className="rounded-full border-4 border-primary/50 object-cover w-28 h-28 transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <h3 className="text-xl font-bold font-headline">{teacher.name}</h3>
          <p className="text-muted-foreground text-sm mb-3">{formatExperience(teacher.experience)}</p>
          <Badge
            variant="outline"
            className="mb-6 bg-background/50"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {teacher.department}
          </Badge>

          <div className="w-full text-left space-y-2">
             <p className="text-sm truncate">
              <span className="font-semibold text-muted-foreground">Bio:</span>
              <span className="font-medium ml-1">{teacher.bio || "N/A"}</span>
            </p>
             <p className="text-sm truncate">
              <span className="font-semibold text-muted-foreground">Joined:</span>
              <span className="font-medium ml-1">{teacher.dateJoined}</span>
            </p>
             <p className="text-sm truncate">
              <span className="font-semibold text-muted-foreground">Contact:</span>
              <span className="font-medium ml-1">{teacher.contact}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export default function TeachersSection({ teachers }: TeachersSectionProps) {
  if (!teachers || teachers.length === 0) {
    return (
        <section id="teachers" className="py-20 lg:py-32 px-6 lg:px-12 bg-background">
            <div className="container mx-auto text-center">
                <Badge variant="outline" className="mb-4 bg-secondary/80">
                    <Users className="w-4 h-4 mr-2" />
                    {teachersSection.badge}
                </Badge>
                <h2 className="text-4xl font-bold mb-4 font-headline">
                    {teachersSection.title}
                </h2>
                <p className="text-muted-foreground mb-12 max-w-3xl mx-auto">
                    {teachersSection.description}
                </p>
                <p className="text-center text-muted-foreground">Faculty details will be available soon.</p>
                 <div className="mt-16 text-center">
                    <Button size="lg" asChild>
                        <Link href="/faculty">
                            {teachersSection.viewAllButton} <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
  }

  return (
    <section id="teachers" className="py-20 lg:py-32 px-6 lg:px-12 bg-background">
      <div className="container mx-auto text-center">
        <Badge
          variant="outline"
          className="mb-4 bg-secondary/80"
        >
          <Users className="w-4 h-4 mr-2" />
          {teachersSection.badge}
        </Badge>
        <h2 className="text-4xl font-bold mb-4 font-headline">
          {teachersSection.title}
        </h2>
        <p className="text-muted-foreground mb-12 max-w-3xl mx-auto">
          {teachersSection.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachers.map((teacher, index) => (
            <TeacherCard key={index} teacher={teacher} />
        ))}
        </div>
        <div className="mt-16 text-center">
            <Button size="lg" asChild>
                <Link href="/faculty">
                    {teachersSection.viewAllButton} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
