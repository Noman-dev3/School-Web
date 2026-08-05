
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string;
}

const LazyLoad: React.FC<LazyLoadProps> = ({ children, height = "80vh" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const placeholderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = placeholderRef.current; 

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (node) {
              obs.unobserve(node);
            }
          }
        });
      },
      { rootMargin: "0px 0px -100px 0px" } 
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, []); 

  if (isVisible) {
    return <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">{children}</div>;
  }
  
  return <div ref={placeholderRef} style={{ height }} className="w-full" />;
};

export default LazyLoad;
