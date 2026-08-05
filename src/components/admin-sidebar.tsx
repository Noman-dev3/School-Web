"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  Home, Building2, UserCheck, GraduationCap, Wallet, Briefcase, 
  FolderKanban, SlidersHorizontal, ChevronDown, ChevronRight, LogOut, 
  Search, PanelLeftClose, PanelLeftOpen, Menu, Layers
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { header } from '@/lib/data';
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { 
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem 
} from '@/components/ui/command';

interface SubNavItem {
  href: string;
  label: string;
}

interface NavItem {
  href?: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  subItems?: SubNavItem[];
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({ isCollapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [pendingAdmissionsCount, setPendingAdmissionsCount] = useState(0);

  const [openCommand, setOpenCommand] = useState(false);

  const isCmsPath = pathname?.startsWith('/admin/content-management');
  const [isCmsOpen, setIsCmsOpen] = useState(true);

  useEffect(() => {
    if (isCmsPath) {
      setIsCmsOpen(true);
    }
  }, [isCmsPath]);

  // Keyboard shortcut for Cmd/Ctrl + K (Spotlight Search)
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

  useEffect(() => {
    async function fetchPendingAdmissions() {
      try {
        const { data, error } = await supabase.from('admissions').select('status').eq('status', 'pending');
        if (!error && data) {
          setPendingAdmissionsCount(data.length);
        }
      } catch (err) {
        console.error("Failed to load pending admissions for sidebar:", err);
      }
    }
    fetchPendingAdmissions();
  }, []);

  const navGroups: NavGroup[] = [
    {
      groupName: "Overview",
      items: [
        { href: '/admin', icon: <Home className="h-4 w-4 shrink-0" />, label: 'Home' },
        { href: '/admin/school-data', icon: <Building2 className="h-4 w-4 shrink-0" />, label: 'School Data' },
      ]
    },
    {
      groupName: "Academics & Operations",
      items: [
        { 
          href: '/admin/admissions', 
          icon: <UserCheck className="h-4 w-4 shrink-0" />, 
          label: 'Admissions',
          badge: pendingAdmissionsCount > 0 ? pendingAdmissionsCount : undefined
        },
        { href: '/admin/students', icon: <GraduationCap className="h-4 w-4 shrink-0" />, label: 'Students' },
        { href: '/admin/fees', icon: <Wallet className="h-4 w-4 shrink-0" />, label: 'Fee Management' },
        { href: '/admin/teachers', icon: <Briefcase className="h-4 w-4 shrink-0" />, label: 'Teachers & Staff' },
      ]
    },
    {
      groupName: "Portal Content",
      items: [
        {
          label: 'Content Management',
          icon: <FolderKanban className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />,
          subItems: [
            { href: '/admin/content-management/visual-builder', label: '🎨 Live Visual Builder' },
            { href: '/admin/content-management/results', label: 'Exam Results' },
            { href: '/admin/content-management/events', label: 'Events Calendar' },
            { href: '/admin/content-management/gallery', label: 'Photo Gallery' },
            { href: '/admin/content-management/announcements', label: 'Announcements' },
            { href: '/admin/content-management/testimonials', label: 'Testimonials' },
            { href: '/admin/content-management/faq', label: 'Portal FAQ' },
            { href: '/admin/content-management/toppers', label: 'Class Toppers' },
            { href: '/admin/content-management/board-students', label: 'Board Achievers' },
          ]
        }
      ]
    },
    {
      groupName: "System",
      items: [
        { href: '/admin/settings', icon: <SlidersHorizontal className="h-4 w-4 shrink-0" />, label: 'Portal Settings' },
      ]
    }
  ];

  const isActive = (path?: string) => {
    if (!pathname || !path) return false;
    if (path === '/admin' && pathname !== '/admin') return false;
    return pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    setSheetOpen(false);
  };

  const runCommand = (action: () => void) => {
    setOpenCommand(false);
    action();
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full select-none">
      {/* Sidebar Top Brand Header */}
      <div className={cn(
        "flex items-center h-16 shrink-0 transition-all duration-300 px-4 border-none",
        collapsed ? "justify-center px-2" : "justify-between"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-md shadow-emerald-900/20 shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden transition-all duration-300">
              <h1 className="text-sm font-bold text-foreground font-headline truncate leading-tight">
                {header.logo.title}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Admin Suite
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls: Mac Spotlight Search Button & Collapse Toggle */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenCommand(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl transition-colors"
            title="Open Spotlight Search (⌘K)"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Desktop Collapse Toggle Button */}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hidden sm:flex h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl shrink-0"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Links List (Border-free & Scrollbar-hidden) */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <div className="space-y-1">
              {group.items.map((item) => {
                // If Item Has Sub-Items (Content Management nested dropdown)
                if (item.subItems) {
                  const isParentActive = isCmsPath;
                  return (
                    <div key={item.label} className="space-y-1">
                      {collapsed ? (
                        <div className="relative group/item flex justify-center">
                          <button
                            onClick={() => setIsCmsOpen(!isCmsOpen)}
                            className={cn(
                              "flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 w-full",
                              isParentActive
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                            )}
                            title={item.label}
                          >
                            {item.icon}
                          </button>

                          {/* Hover Popout Submenu when Sidebar is Collapsed */}
                          <div className="absolute left-full ml-3 top-0 bg-popover/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl p-3 w-52 opacity-0 pointer-events-none group-hover/item:opacity-100 group-hover/item:pointer-events-auto transition-all z-50 space-y-1.5">
                            <div className="px-1 py-1 text-[11px] font-bold text-muted-foreground mb-1 flex items-center gap-1.5">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            <div className="border-l-2 border-blue-500/60 pl-3 space-y-2">
                              {item.subItems.map((sub) => {
                                const subActive = isActive(sub.href);
                                return (
                                  <Link
                                    key={sub.label}
                                    href={sub.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                      "block text-xs transition-all truncate",
                                      subActive
                                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                                        : 'text-muted-foreground hover:text-foreground font-semibold'
                                    )}
                                  >
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsCmsOpen(!isCmsOpen)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 select-none",
                              isParentActive
                                ? 'bg-white dark:bg-slate-800 text-foreground font-bold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              {item.icon}
                              <span className="truncate">{item.label}</span>
                            </div>
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                                isCmsOpen && "rotate-180"
                              )}
                            />
                          </button>

                          {/* Expanded Nested Sub-links Matching Reference Design */}
                          {isCmsOpen && (
                            <div className="ml-4 pl-4 border-l-2 border-blue-500/60 space-y-2.5 my-2">
                              {item.subItems.map((sub) => {
                                const subActive = isActive(sub.href);
                                return (
                                  <Link
                                    key={sub.label}
                                    href={sub.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                      "block text-xs transition-all duration-200 truncate",
                                      subActive
                                        ? 'text-blue-600 dark:text-blue-400 font-bold translate-x-0.5'
                                        : 'text-foreground/80 hover:text-foreground font-semibold hover:translate-x-0.5'
                                    )}
                                  >
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                }

                // Regular Top-Level Link with Sharp Radius (rounded-xl)
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href || '#'}
                    onClick={handleLinkClick}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center rounded-xl transition-all duration-200 relative group/item",
                      collapsed ? "justify-center p-2.5" : "justify-between px-3 py-2 text-xs font-semibold",
                      active
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}
                  >
                    <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
                      {item.icon}
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && (
                      item.badge ? (
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                          active 
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        )}>
                          {item.badge}
                        </span>
                      ) : null
                    )}

                    {/* Collapsed Badge Dot Indicator */}
                    {collapsed && item.badge ? (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-background" />
                    ) : null}

                    {/* Hover Floating Tooltip when Collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/item:opacity-100 transition-opacity z-50 shadow-lg">
                        {item.label}
                        {item.badge ? ` (${item.badge})` : ''}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Footer (Clean profile with capitalized text & borderless theme toggle) */}
      <div className={cn("mt-auto shrink-0 transition-all duration-300 border-none", collapsed ? "p-2" : "p-3")}>
        <div className={cn(
          "flex items-center p-2 transition-all duration-300 border-none bg-transparent shadow-none",
          collapsed ? "flex-col gap-2 justify-center" : "gap-2.5 justify-between"
        )}>
          <Avatar className="h-8 w-8 border-none shrink-0">
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Admin" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate capitalize">
                {user?.email?.split('@')[0] || 'Admin'}
              </p>
            </div>
          )}

          <div className="flex items-center gap-1">
            {!collapsed && <ThemeToggle />}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-md shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-none bg-background px-4 sm:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border-none">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-slate-100/70 dark:bg-slate-950 border-none">
            <SidebarContent collapsed={false} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1 rounded-md">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold font-headline">{header.logo.title} Admin</span>
        </div>
        <div className="w-8" />
      </header>

      {/* Desktop Fixed Collapsible Sidebar (Border-free) */}
      <aside className={cn(
        "fixed top-0 left-0 hidden h-full border-none bg-slate-100/70 dark:bg-slate-950 sm:flex flex-col z-40 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* macOS Spotlight-style Centered Command Palette Search Window */}
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
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/fees'))}>
              Fee Management & Arrears
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
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/content-management/gallery'))}>
              Photo Gallery
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/content-management/testimonials'))}>
              Testimonials
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/content-management/faq'))}>
              Portal FAQ
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
