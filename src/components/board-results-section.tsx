
"use client";

import * as React from "react";
import Image from "next/image";
import { Award, CheckCircle, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { BoardStudent } from "@/app/admin/data-schemas";

interface BoardResultsSectionProps {
  boardStudents: BoardStudent[];
}

export default function BoardResultsSection({ boardStudents }: BoardResultsSectionProps) {
  if (!boardStudents || boardStudents.length === 0) {
    return null;
  }

  return (
    <section id="board-results" className="py-20 lg:py-32 px-6 lg:px-12 bg-secondary/50">
      <div className="container mx-auto text-center">
        <Badge
          variant="outline"
          className="mb-4 bg-background/50"
        >
          <Award className="w-4 h-4 mr-2" />
          Board Exam High Achievers
        </Badge>
        <h2 className="text-4xl font-bold mb-4 font-headline">
          Excellence in Board Examinations
        </h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          We commend our students for their exceptional performance in the official board examinations, a testament to their diligence and our faculty&apos;s guidance.
        </p>
          <Carousel
            opts={{
              align: "start",
              loop: boardStudents.length > 1,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {boardStudents.map((student, index) => {
                const percentage = student.totalMarks > 0 ? ((student.obtainedMarks / student.totalMarks) * 100).toFixed(2) : 0;
                return (
                    <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3"
                    >
                    <div className="p-1">
                        <Card className="bg-background/80 border-border/50 hover:bg-secondary/80 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl">
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                            <Image
                            src={student.imageUrl || "https://placehold.co/128x128.png"}
                            alt={student.name}
                            width={128}
                            height={128}
                            data-ai-hint="student portrait"
                            className="rounded-full border-4 border-primary/50 object-cover w-32 h-32"
                            />
                            <div className="text-center">
                            <h3 className="text-xl font-bold font-headline">
                                {student.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Class {student.class}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Roll No: {student.boardRollNo}
                            </p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Badge variant="secondary" className="text-base">
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    {student.obtainedMarks} / {student.totalMarks}
                                </Badge>
                                <Badge className="bg-blue-400/20 text-blue-600 border-blue-400/30">
                                <Percent className="h-4 w-4 mr-2" />
                                <span>{percentage}%</span>
                                </Badge>
                            </div>
                        </CardContent>
                        </Card>
                    </div>
                    </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4" />
            <CarouselNext className="hidden sm:flex -right-4" />
          </Carousel>
      </div>
    </section>
  );
}
