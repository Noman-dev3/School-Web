import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatExperience(experience: string): string {
  if (!experience) {
    return "N/A";
  }
  // If it's just a number, assume years
  if (/^\d+$/.test(experience)) {
    return `${experience}y`;
  }
  // Otherwise, return the string as is (e.g., "5 years", "6 months")
  return experience;
}