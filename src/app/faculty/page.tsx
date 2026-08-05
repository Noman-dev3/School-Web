

import { BackToTopButton } from "@/components/back-to-top-button";
import Footer from "@/components/footer";
import { Header } from "@/components/header";
import { Teacher } from "@/app/admin/teachers/data/schema";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { getSettings, getTeachers } from "@/lib/data-fetching";
import { formatExperience } from "@/lib/utils";


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


export default async function AllFacultyPage() {
  const teachers = await getTeachers();
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
                <h1 className="text-4xl font-bold font-headline">Our Faculty</h1>
                <p className="text-muted-foreground mt-2">Meet our dedicated team of educators.</p>
            </div>
            {teachers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teachers.map((teacher, index) => (
                        <TeacherCard key={index} teacher={teacher} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-2xl font-bold tracking-tight">No faculty found</h3>
                    <p className="text-sm text-muted-foreground">Teacher information will be updated soon.</p>
                </div>
            )}
        </div>
      </main>
      <Footer content={footerContent} />
      <BackToTopButton />
    </div>
  );
}
