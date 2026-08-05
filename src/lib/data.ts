
import { Users, GraduationCap, BookOpen, Trophy, Home, Info, FileText, BarChart2, GalleryVertical, HelpCircle, Phone, MapPin, Clock, Mail } from "lucide-react";
import React from "react";

export const navLinks = [
    { label: "Home", href: "/", icon: React.createElement(Home, { className: "w-5 h-5" }) },
    { label: "About", href: "/#about", icon: React.createElement(Info, { className: "w-5 h-5" }) },
    { label: "Admissions", href: "/admissions", icon: React.createElement(FileText, { className: "w-5 h-5" }) },
    { label: "Results", href: "/results", icon: React.createElement(BarChart2, { className: "w-5 h-5" }) },
    { label: "Gallery", href: "/#gallery", icon: React.createElement(GalleryVertical, { className: "w-5 h-5" }) },
    { label: "FAQ", href: "/#faq", icon: React.createElement(HelpCircle, { className: "w-5 h-5" }) },
    { label: "Contact", href: "/#contact", icon: React.createElement(Phone, { className: "w-5 h-5" }) },
];

export const header = {
    logo: {
        title: "PIISS",
        description: "Excellence in Education",
    },
    searchPlaceholder: "Ask me anything...",
    mobileMenu: {
        user: {
            name: "Guest User",
            welcomeMessage: "Welcome to PIISS",
            avatar: {
                src: "https://placehold.co/80x80.png",
                alt: "Guest User",
                hint: "guest user",
            },
        },
    },
};

export const hero = {
    badge: {
        icon: "✨",
        text: "Welcome to the Future of Education",
    },
    title: "PIISS",
    subtitle: "Excellence in Education",
    primaryAction: {
        label: "Explore Programs",
        href: "/#about",
    },
    secondaryAction: {
        label: "Contact Us",
        href: "/#contact",
    },
};

export const featuresSection = {
    title: "Why Choose Us?",
    features: [
        {
            icon: React.createElement(Users, { className: "h-8 w-8 text-primary" }),
            title: "Expert Faculty",
        },
        {
            icon: React.createElement(GraduationCap, { className: "h-8 w-8 text-primary" }),
            title: "Holistic Learning",
        },
        {
            icon: React.createElement(BookOpen, { className: "h-8 w-8 text-primary" }),
            title: "Modern Curriculum",
        },
        {
            icon: React.createElement(Trophy, { className: "h-8 w-8 text-primary" }),
            title: "Top Achievements",
        },
    ]
};

export const about = {
    badge: "About Our School",
    title: "Our Story",
    description: "Founded in 2015 with a pioneering spirit, the Pakistan Islamic International School System (PIISS) embarked on a mission to redefine education. We began with a simple yet powerful vision: to create a nurturing environment that blends academic rigor with timeless Islamic values. Our journey started in a modest campus with a handful of students and a team of dedicated educators who believed in fostering not just scholars, but compassionate and well-rounded individuals. Over the years, as our community grew, so did our commitment to excellence. We have since expanded our facilities, embraced innovative teaching methodologies, and consistently produced students who excel both in their studies and in their character. Today, PIISS stands as a beacon of quality education, proud of its rich history and excited for a future of continued growth and success.",
    image: {
        src: "https://placehold.co/600x450.png",
        alt: "Students in a classroom at PIISS",
        hint: "students classroom",
    },
};

export const toppersSection = {
    badge: "Our Achievers",
    title: "Our Star Performers",
    description: "Celebrating the outstanding achievements of our students who have excelled through hard work and dedication.",
};

export const teachersSection = {
    badge: "Meet Our Faculty",
    title: "World-Class Educators",
    description: "Our passionate team of expert teachers brings decades of experience and innovative teaching methods to inspire and nurture every student.",
    viewAllButton: "View All Faculty",
};

export const eventsSection = {
    badge: "Our Events",
    title: "Upcoming Events",
    description: "Stay updated with our latest school activities and programs.",
    viewAllButton: "View All Events",
};

export const gallerySection = {
    badge: "Our Gallery",
    title: "School Life Gallery",
    description: "Glimpses of our vibrant school community and memorable moments.",
    viewAllButton: "View Full Gallery",
};

export const testimonialsSection = {
    badge: "Testimonials",
    title: "What Our Community Says",
    description: "Hear from parents, students, and alumni about their experiences at our school.",
};

export const faqSection = {
    badge: "FAQ",
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about our school, admissions, and programs.",
};

export const contactInfo = {
    title: "Contact Information",
    image: {
        src: "https://placehold.co/600x400.png",
        alt: "PIISS Campus",
        hint: "school building"
    }
};

export const contactForm = {
    title: "Send us a Message",
    fields: {
        firstName: { label: "First Name", placeholder: "Enter your first name" },
        lastName: { label: "Last Name", placeholder: "Enter your last name" },
        email: { label: "Email Address", placeholder: "Enter your email" },
        phone: { label: "Phone Number", placeholder: "Enter your phone number" },
        subject: { 
            label: "Subject", 
            placeholder: "Select a subject",
            options: [
                { value: "admissions", label: "Admissions" },
                { value: "general", label: "General Inquiry" },
                { value: "feedback", label: "Feedback" },
                { value: "careers", label: "Careers" },
            ]
        },
        message: { label: "Message", placeholder: "Enter your message" },
    },
    submitButton: "Send Message",
};
