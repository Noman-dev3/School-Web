"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { navLinks, header } from "@/lib/data";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { AISearchDialog } from "./ai-search-dialog";
import { FAQ, Teacher, Event, Topper, BoardStudent } from "@/app/admin/data-schemas";
import { cn } from "@/lib/utils";

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();

  const [siteData, setSiteData] = useState({
    settings: {},
    faqs: [] as FAQ[],
    teachers: [] as Teacher[],
    events: [] as Event[],
    toppers: [] as Topper[],
    boardStudents: [] as BoardStudent[],
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (pathname === "/") {
        const scrollPos = window.scrollY + 140;
        const sections = ["about", "gallery", "faq", "contact"];
        let current = "";

        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              current = `#${sectionId}`;
              break;
            }
          }
        }
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: settingsData },
          { data: faqsData },
          { data: teachersData },
          { data: eventsData },
          { data: toppersData },
          { data: boardStudentsData }
        ] = await Promise.all([
          supabase.from('settings').select('*').limit(1).single(),
          supabase.from('faqs').select('*'),
          supabase.from('teachers').select('*'),
          supabase.from('events').select('*'),
          supabase.from('toppers').select('*'),
          supabase.from('board_students').select('*')
        ]);

        if (settingsData) {
          setLogoUrl(settingsData.logoUrl || "");
        }

        setSiteData({
          settings: settingsData || {},
          faqs: (faqsData || []) as FAQ[],
          teachers: (teachersData || []) as Teacher[],
          events: (eventsData || []) as Event[],
          toppers: (toppersData || []) as Topper[],
          boardStudents: (boardStudentsData || []) as BoardStudent[],
        });
      } catch (err) {
        console.error("Error loading header site data from Supabase:", err);
      }
    }

    loadData();
  }, []);

  return (
    <>
      {/* Sticky Header Navigation Bar */}
      <header
        className={cn(
          "sticky z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu",
          isScrolled
            ? "top-3 mx-auto w-[92%] max-w-5xl rounded-full border border-emerald-500/25 dark:border-white/20 bg-background/80 backdrop-blur-xl shadow-2xl shadow-emerald-950/10 py-2.5 px-4 sm:px-6"
            : "top-0 w-full rounded-none border-b border-border/50 bg-background/90 backdrop-blur-md py-3.5 px-4 sm:px-8 lg:px-12"
        )}
      >
        {/* Liquid Glass Background Sheen Layer */}
        <div 
          className={cn(
            "absolute inset-0 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden",
            isScrolled ? "rounded-full" : "rounded-none"
          )}
        >
          {/* Subtle liquid glass tint */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-primary/5 to-teal-500/10 dark:from-emerald-900/20 dark:via-primary/10 dark:to-teal-900/20" />
          
          {/* Top Edge Specular Reflection Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-primary text-primary-foreground p-2 rounded-full transition-transform duration-300 group-hover:scale-105 shadow-md shadow-primary/20">
              {logoUrl ? (
                <Image src={logoUrl} alt="PIISS Logo" width={20} height={20} className="object-contain" />
              ) : (
                <GraduationCap className="h-5 w-5" />
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-base font-bold text-foreground font-headline tracking-tight leading-none">
                {header.logo.title}
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium hidden md:block mt-0.5">
                {header.logo.description}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isSectionActive = link.href.startsWith("/#") && activeSection === link.href.replace("/", "");
              const isActive = link.href === "/" 
                ? (pathname === "/" && !activeSection)
                : (pathname === link.href || (pathname === "/" && isSectionActive));

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-300",
                    isActive
                      ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/20 scale-105 font-bold"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: AI Search, Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="rounded-full h-8 w-8 hover:bg-muted/80 hover:text-primary transition-all"
              title="Search AI Assistant"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            <ThemeToggle />

            {/* Mobile Sheet Trigger */}
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full h-8 w-8 border-border/60">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[85vh] bg-background/95 backdrop-blur-2xl border-t border-border/60 flex flex-col">
                  <SheetHeader className="p-6 border-b border-border/40 text-left">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/60">
                        <AvatarImage src={header.mobileMenu.user.avatar.src} alt={header.mobileMenu.user.avatar.alt} />
                        <AvatarFallback>
                          <User />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-lg font-bold text-foreground font-headline">{header.mobileMenu.user.name}</h2>
                        <p className="text-xs text-muted-foreground">{header.mobileMenu.user.welcomeMessage}</p>
                      </div>
                    </div>
                  </SheetHeader>
                  <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setSheetOpen(false)}
                        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-4 py-3 px-4 rounded-2xl hover:bg-muted"
                      >
                        <span className="p-2 rounded-xl bg-muted/60 text-primary">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* AI Search Dialog */}
      <AISearchDialog
        isOpen={isSearchOpen}
        onOpenChange={setSearchOpen}
        siteData={siteData}
      />
    </>
  );
}
