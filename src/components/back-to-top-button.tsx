
"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <Button
                variant="outline"
                size="icon"
                onClick={scrollToTop}
                className={cn(
                    "h-12 w-12 rounded-full bg-secondary shadow-lg transition-all duration-300 ease-in-out hover:scale-110 hover:bg-muted/50 animate-float",
                    "transform",
                    isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}
                aria-label="Back to Top"
            >
                <ArrowUp className="h-6 w-6" />
            </Button>
        </div>
    );
};
