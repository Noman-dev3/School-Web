
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

function ThemeBodyClassUpdater() {
  const { theme } = useTheme();

  React.useEffect(() => {
    // Add the current theme class to the body
    document.body.classList.remove('light', 'dark', 'gradient', 'custom');
    if (theme) {
      document.body.classList.add(theme);
    }
  }, [theme]);
  
  return null;
}

// Helper to convert hex to HSL string components (e.g., "224 71.4% 4.1%")
function hexToHsl(hex: string): string {
    if (!hex || typeof hex !== 'string') return "0 0% 0%";
    let r = 0, g = 0, b = 0;
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        r = parseInt(result[1], 16);
        g = parseInt(result[2], 16);
        b = parseInt(result[3], 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}


function CustomThemeStyleUpdater() {
    const { theme } = useTheme();
    const [customColors, setCustomColors] = React.useState({
        primary: "#87ceeb",
        accent: "#ffdab9",
        background: "#e6e9ed",
        secondary: "#fafafa"
    });

    React.useEffect(() => {
        const handleStorageChange = () => {
             const storedColors = localStorage.getItem('custom-theme-colors');
             if (storedColors) {
                try {
                    const parsedColors = JSON.parse(storedColors);
                    setCustomColors(prev => ({...prev, ...parsedColors}));
                } catch (e) {
                    console.error("Failed to parse custom colors from localStorage", e);
                }
             }
        }
        window.addEventListener('storage', handleStorageChange);
        handleStorageChange(); // Initial load
        
        return () => window.removeEventListener('storage', handleStorageChange)
    }, []);

    React.useEffect(() => {
        if (theme === 'custom') {
            document.documentElement.style.setProperty('--custom-primary', hexToHsl(customColors.primary));
            document.documentElement.style.setProperty('--custom-accent', hexToHsl(customColors.accent));
            document.documentElement.style.setProperty('--custom-background', hexToHsl(customColors.background));
            document.documentElement.style.setProperty('--custom-secondary', hexToHsl(customColors.secondary));
        }
    }, [theme, customColors]);

    return null;
}


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeBodyClassUpdater />
      <CustomThemeStyleUpdater />
      {children}
    </NextThemesProvider>
  )
}
