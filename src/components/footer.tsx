
"use client";

import Link from "next/link";
import { GraduationCap, Facebook, Instagram, Linkedin, Twitter, ArrowUp } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { header } from "@/lib/data";
import { Button } from "./ui/button";

interface FooterProps {
  content: {
    facebookUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
  };
}

const Footer = ({ content }: FooterProps) => {
    const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { href: content.twitterUrl, icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
    { href: content.linkedinUrl, icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" },
    { href: content.instagramUrl, icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
    { href: content.facebookUrl, icon: <Facebook className="h-5 w-5" />, label: "Facebook" },
  ];

  const siteMapLinks = [
    { label: "Homepage", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Admissions", href: "/admissions" },
    { label: "Results", href: "/results" },
    { label: "Faculty", href: "/faculty" },
    { label: "Contact Us", href: "/#contact" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    !user ? { label: "Admin Portal", href: "/admin" } : { label: "Dashboard", href: "/admin" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground relative rounded-t-2xl">
      <div className="absolute inset-0 z-0 overflow-hidden rounded-t-2xl">
          <div className="absolute -bottom-1/2 -right-1/4 w-full h-full border-t border-r border-border/10 transform -rotate-45 rounded-full"></div>
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 border-b border-l border-border/10 transform rotate-12 rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-md">
                    <GraduationCap className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground font-headline">{header.logo.title}</h1>
                </div>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Empowering students with advanced learning tools to improve their educational outcomes and future prospects.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) =>
                link.href ? (
                  <Link
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={link.label}
                  >
                    {link.icon}
                  </Link>
                ) : null
              )}
            </div>
          </div>

          <div className="md:col-span-3 lg:col-span-2 lg:col-start-8">
            <h4 className="font-semibold text-foreground mb-4">Site Map</h4>
            <ul className="space-y-3">
              {siteMapLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary hover:underline underline-offset-4 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary hover:underline underline-offset-4 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-background/10 py-4">
        <div className="container mx-auto px-6 lg:px-8 text-center text-xs text-muted-foreground">
          <p>Copyright &copy; {currentYear}, PIISS. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
