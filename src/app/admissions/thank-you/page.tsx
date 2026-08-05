

import { BackToTopButton } from "@/components/back-to-top-button";
import Footer from "@/components/footer";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettings } from "@/lib/data-fetching";
import { CheckCircle, Home } from "lucide-react";
import Link from "next/link";

export default async function ThankYouPage() {
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
      <main className="flex-1 flex items-center justify-center py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center bg-secondary/30 border-border/20">
                <CardHeader>
                    <div className="mx-auto bg-green-500/20 text-green-500 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline">Application Submitted!</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg">
                        Thank you for your interest in our school.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p>
                        We have successfully received your application. Our admissions team will review it carefully and get back to you within 5-7 business days with the next steps.
                    </p>
                    <Button asChild>
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Return to Homepage
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer content={footerContent} />
      <BackToTopButton />
    </div>
  );
}
