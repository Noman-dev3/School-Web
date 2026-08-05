

import { AdmissionForm } from "@/components/admission-form";
import { BackToTopButton } from "@/components/back-to-top-button";
import Footer from "@/components/footer";
import { Header } from "@/components/header";
import { getSettings } from "@/lib/data-fetching";

export default async function AdmissionsPage() {
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
          <AdmissionForm />
        </div>
      </main>
      <Footer content={footerContent} />
      <BackToTopButton />
    </div>
  );
}
