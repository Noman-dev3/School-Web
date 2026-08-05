
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const colors = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#fde047", // yellow-300
  "#f87171", // red-400
  "#60a5fa", // blue-400
  "#4ade80", // green-400
];

const Cube = () => {
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const [currentRotation, setCurrentRotation] = useState({ x: -25, y: 45 });

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setCurrentRotation(prev => ({
        x: prev.x + 90 * (Math.random() > 0.5 ? 1 : -1),
        y: prev.y + 90 * (Math.random() > 0.5 ? 1 : -1),
      }));
      setCurrentColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 2000);

    return () => clearInterval(rotateInterval);
  }, []);

  const faces = ["front", "back", "right", "left", "top", "bottom"];

  return (
    <div
      className="cube"
      style={{
        transform: `rotateX(${currentRotation.x}deg) rotateY(${currentRotation.y}deg)`,
      }}
    >
      {faces.map((face) => (
        <div key={face} className={`cube__face cube__face--${face}`}>
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="cube__piece"
              style={{ backgroundColor: currentColor }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const Loader = ({ className, text="Loading..." }: { className?: string; text?: string }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
        <div className="loader-container">
            <Cube />
        </div>
        <p className="text-lg font-medium text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
};
