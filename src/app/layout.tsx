import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ['500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PIISS - Pakistan Islamic International School System | Buner, Swari",
  description: "Pakistan Islamic International School System (PIISS) in Swari, Buner, offers excellence in education with a blend of academic rigor and Islamic values. Enquire about admissions today.",
  keywords: ["PIISS", "Pakistan Islamic International School System", "school in Buner", "school in Swari", "education in Buner", "PIISS admissions", "Islamic school", "quality education", "private school Buner", "Buner Swari school", "admission open", "school data", "student results", "faculty information", "school events", "gallery"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          plusJakartaSans.variable,
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-LCC5KL7P3Q"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LCC5KL7P3Q');
          `}
        </Script>
      </body>
    </html>
  );
}
