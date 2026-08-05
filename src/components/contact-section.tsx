
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Clock, Mail, MapPin, Phone, Loader2 } from "lucide-react";
import { contactForm } from "@/lib/data";
import { sendEmail } from '@/actions/send-email';

interface ContactSectionProps {
    content: {
        address: string;
        phone: string;
        email: string;
        officeHours: string;
    };
}

export default function ContactSection({ content }: ContactSectionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const currentContactInfo = [
      { icon: <MapPin className="w-6 h-6 text-primary" />, title: "Address", value: content.address },
      { icon: <Phone className="w-6 h-6 text-primary" />, title: "Phone", value: content.phone },
      { icon: <Mail className="w-6 h-6 text-primary" />, title: "Email", value: content.email },
      { icon: <Clock className="w-6 h-6 text-primary" />, title: "Office Hours", value: content.officeHours },
  ];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
        firstName: formData.get('first-name') as string,
        lastName: formData.get('last-name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        subject: formData.get('subject') as string,
        message: formData.get('message') as string,
    };

    const emailHtml = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr>
        <h3>Message:</h3>
        <p>${data.message}</p>
    `;

    try {
        const result = await sendEmail({
            fromName: `${data.firstName} ${data.lastName}`,
            fromEmail: data.email,
            to: content.email,
            subject: data.subject,
            html: emailHtml,
        });

        if (result.success) {
            toast({
                title: "Message Sent!",
                description: "Thanks for reaching out. We'll get back to you soon.",
            });
            (event.target as HTMLFormElement).reset();
        } else {
            throw new Error(result.error || "An unknown error occurred.");
        }
    } catch (error) {
        toast({
            title: "Submission Failed",
            description: (error as Error).message,
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  }
  
  return (
    <section id="contact" className="py-20 lg:py-32 px-6 lg:px-12 bg-secondary/50">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col">
            <h2 className="text-4xl font-bold mb-6 font-headline">{contactForm.title}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first-name">{contactForm.fields.firstName.label} *</Label>
                  <Input id="first-name" name="first-name" placeholder={contactForm.fields.firstName.placeholder} required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">{contactForm.fields.lastName.label} *</Label>
                  <Input id="last-name" name="last-name" placeholder={contactForm.fields.lastName.placeholder} required className="bg-background" />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="email">{contactForm.fields.email.label} *</Label>
                <Input id="email" name="email" type="email" placeholder={contactForm.fields.email.placeholder} required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{contactForm.fields.phone.label}</Label>
                <Input id="phone" name="phone" placeholder={contactForm.fields.phone.placeholder} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">{contactForm.fields.subject.label} *</Label>
                <Select name="subject" required>
                  <SelectTrigger id="subject" className="bg-background">
                    <SelectValue placeholder={contactForm.fields.subject.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {contactForm.fields.subject.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{contactForm.fields.message.label} *</Label>
                <Textarea id="message" name="message" placeholder={contactForm.fields.message.placeholder} rows={5} required className="bg-background" />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                 {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                {loading ? "Sending..." : contactForm.submitButton}
              </Button>
            </form>
          </div>
          <div className="flex flex-col">
             <h2 className="text-4xl font-bold mb-6 font-headline">Contact Information</h2>
              <div className="space-y-6">
                {currentContactInfo.map((item, index) => (
                  item.value ? (
                    <div key={index} className="flex items-start gap-4">
                      <div className="p-3 bg-background rounded-full">{item.icon}</div>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-muted-foreground whitespace-pre-line">{item.value}</p>
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
             <Card className="overflow-hidden rounded-xl shadow-lg mt-8 aspect-video">
                <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=72.45%2C34.56%2C72.47%2C34.58&layer=mapnik&marker=34.57,72.46"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="School Location Map"
                ></iframe>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
