
"use client"

import * as React from "react"
import { Moon, Sun, Palette, Pipette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Label } from "./ui/label"

const defaultColors = {
  primary: "#4f46e5",    // Indigo 600
  accent: "#f3f4f6",     // Gray 100
  background: "#ffffff", // White
  secondary: "#f9fafb"   // Gray 50
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [colors, setColors] = React.useState(defaultColors)

  React.useEffect(() => {
    setMounted(true)
    try {
      const savedColors = localStorage.getItem('custom-theme-colors')
      if (savedColors) {
        setColors(JSON.parse(savedColors))
      }
    } catch (error) {
      console.error("Failed to parse custom theme colors from localStorage", error)
    }
  }, [])
  
  const handleColorChange = (colorName: string, value: string) => {
    const newColors = { ...colors, [colorName]: value };
    setColors(newColors);
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom-theme-colors', JSON.stringify(newColors));
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 border-none shadow-none bg-transparent hover:bg-muted/50">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("gradient")}>
          <Palette className="mr-2 h-4 w-4"/>
          Gradient
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme("custom")}>
           <Pipette className="mr-2 h-4 w-4"/>
           Custom
        </DropdownMenuItem>
        
        {mounted && theme === 'custom' && (
            <div className="p-2 space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="primary-color" className="text-xs">Primary</Label>
                    <input id="primary-color" type="color" value={colors.primary} onChange={(e) => handleColorChange('primary', e.target.value)} className="w-6 h-6 p-0 border-none rounded cursor-pointer bg-transparent"/>
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="secondary-color" className="text-xs">Secondary</Label>
                    <input id="secondary-color" type="color" value={colors.secondary} onChange={(e) => handleColorChange('secondary', e.target.value)} className="w-6 h-6 p-0 border-none rounded cursor-pointer bg-transparent"/>
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="accent-color" className="text-xs">Accent</Label>
                    <input id="accent-color" type="color" value={colors.accent} onChange={(e) => handleColorChange('accent', e.target.value)} className="w-6 h-6 p-0 border-none rounded cursor-pointer bg-transparent"/>
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="background-color" className="text-xs">Background</Label>
                    <input id="background-color" type="color" value={colors.background} onChange={(e) => handleColorChange('background', e.target.value)} className="w-6 h-6 p-0 border-none rounded cursor-pointer bg-transparent"/>
                </div>
            </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
