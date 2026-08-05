"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  Search, Bell, ShieldCheck, Plus, LogOut, Settings, User, 
  UserPlus, Calendar, Megaphone, CheckCircle2, ChevronDown, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ThemeToggle } from '@/components/theme-toggle';
import { supabase } from "@/lib/supabase";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

export function AdminHeader() {
  const { user, userRole, logout } = useAuth();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [openCommand, setOpenCommand] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const { data, error } = await supabase.from('admissions').select('status').eq('status', 'pending');
        if (!error && data) {
          setPendingCount(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch pending notifications:", err);
      }
    }
    fetchNotifications();
  }, []);

  // Keyboard shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (action: () => void) => {
    setOpenCommand(false);
    action();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 backdrop-blur-md px-4 sm:px-8 transition-all">
        {/* Left Search / Command Launcher */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setOpenCommand(true)}
            className="relative h-9 w-48 sm:w-64 justify-start text-xs text-muted-foreground rounded-full border-border/80 bg-muted/30 px-3 hover:bg-muted/60 hover:text-foreground"
          >
            <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">Search admin portal...</span>
            <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Security Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>256-Bit Encrypted Session</span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 h-8 shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                <span>Quick Add</span>
                <ChevronDown className="h-3 w-3 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Shortcuts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/admissions')} className="text-xs gap-2 cursor-pointer">
                <UserPlus className="h-3.5 w-3.5 text-emerald-500" />
                <span>Review Admissions</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/content-management/events')} className="text-xs gap-2 cursor-pointer">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                <span>Post New Event</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/content-management/announcements')} className="text-xs gap-2 cursor-pointer">
                <Megaphone className="h-3.5 w-3.5 text-amber-500" />
                <span>Publish Notice</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Bell */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-muted">
                <Bell className="h-4 w-4 text-muted-foreground" />
                {pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold font-headline">Portal Notifications</h4>
                  {pendingCount > 0 && (
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {pendingCount} Pending
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 space-y-2">
                {pendingCount > 0 ? (
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs">
                    <p className="font-semibold text-amber-700 dark:text-amber-400">Admissions Require Review</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      There are {pendingCount} new student applications awaiting verification.
                    </p>
                    <Button 
                      size="sm" 
                      variant="link" 
                      onClick={() => router.push('/admin/admissions')} 
                      className="p-0 h-auto text-xs text-amber-600 dark:text-amber-400 mt-2 font-semibold"
                    >
                      View Applications &rarr;
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs font-medium">All tasks up to date</p>
                    <p className="text-[11px] text-muted-foreground/80">No pending actions required</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Public Site Link Button */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-full"
          >
            <Link href="/" target="_blank">
              <span>View Site</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>

          <div className="h-5 w-px bg-border/80 mx-1" />

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-muted/60">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Admin" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col text-left text-xs leading-tight pr-1">
                  <span className="font-semibold text-foreground truncate max-w-[120px]">{user?.email?.split('@')[0] || 'Admin'}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{userRole}</span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl">
              <DropdownMenuLabel className="p-2">
                <p className="text-xs font-bold text-foreground">{user?.email}</p>
                <p className="text-[11px] text-muted-foreground font-normal">{userRole} &bull; Security Level 5</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="text-xs gap-2 rounded-lg cursor-pointer">
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Portal Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/school-data')} className="text-xs gap-2 rounded-lg cursor-pointer">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Institution Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout} 
                className="text-xs gap-2 rounded-lg text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out of Portal</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Palette Dialog */}
      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput placeholder="Search admin sections, tools, actions..." />
        <CommandList className="max-h-[350px]">
          <CommandEmpty>No matching admin tool found.</CommandEmpty>
          <CommandGroup heading="Quick Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push('/admin'))}>
              Dashboard Overview
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/admissions'))}>
              Admissions Applications
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/students'))}>
              Student Directory
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/teachers'))}>
              Faculty & Teachers
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/content-management/results'))}>
              Exam Results Management
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/content-management/events'))}>
              School Events & Calendar
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/content-management/announcements'))}>
              Announcements & Ticker
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/settings'))}>
              System Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
