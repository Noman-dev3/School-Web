"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  Home, Building2, UserCheck, GraduationCap, Wallet, Briefcase, 
  FolderKanban, SlidersHorizontal, ChevronDown, ChevronRight, LogOut, 
  Search, PanelLeftClose, PanelLeftOpen, Menu, Layers, Sparkles, Paintbrush,
  Calendar, Image as ImageIcon, Megaphone, MessageSquare, HelpCircle, Trophy, Award
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
  icon?: React.ReactNode;
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
        { href: '/admin', icon: <Home className="h-4 w-4 shrink-0 text-amber-500" />, label: 'Home Overview' },
        { href: '/admin/school-data', icon: <Building2 className="h-4 w-4 shrink-0 text-teal-500" />, label: 'School Data Analytics' },
      ]
    },
    {
      groupName: "Academics & Operations",
      items: [
        { 
          href: '/admin/admissions', 
          icon: <UserCheck className="h-4 w-4 shrink-0 text-emerald-500" />, 
          label: 'Admissions',
          badge: pendingAdmissionsCount > 0 ? pendingAdmissionsCount : undefined
        },
        { href: '/admin/management', icon: <Layers className="h-4 w-4 shrink-0 text-indigo-500" />, label: 'Student Management (360)' },
        { href: '/admin/teachers', icon: <Briefcase className="h-4 w-4 shrink-0 text-violet-500" />, label: 'Teachers & Staff' },
      ]
    },
    {
      groupName: "Portal Content",
      items: [
        {
          label: 'CMS Content Manager',
          icon: <FolderKanban className="h-4 w-4 shrink-0 text-rose-500" />,
          subItems: [
            { href: '/admin/content-management/visual-builder', label: '🎨 Live CMS Studio', icon: <Paintbrush className="w-3.5 h-3.5 text-amber-500" /> },
            { href: '/admin/content-management/results', label: 'Exam Results', icon: <Trophy className="w-3.5 h-3.5 text-yellow-500" /> },
            { href: '/admin/content-management/events', label: 'Events Calendar', icon: <Calendar className="w-3.5 h-3.5 text-blue-500" /> },
            { href: '/admin/content-management/gallery', label: 'Photo Gallery', icon: <ImageIcon className="w-3.5 h-3.5 text-purple-500" /> },
            { href: '/admin/content-management/announcements', label: 'Announcements', icon: <Megaphone className="w-3.5 h-3.5 text-teal-500" /> },
            { href: '/admin/content-management/testimonials', label: 'Testimonials', icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> },
            { href: '/admin/content-management/faq', label: 'Portal FAQ', icon: <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> },
            { href: '/admin/content-management/toppers', label: 'Class Toppers', icon: <Award className="w-3.5 h-3.5 text-amber-500" /> },
            { href: '/admin/content-management/board-students', label: 'Board Achievers', icon: <GraduationCap className="w-3.5 h-3.5 text-rose-500" /> },
          ]
        }
      ]
    },
    {
      groupName: "System",
      items: [
        { href: '/admin/settings', icon: <SlidersHorizontal className="h-4 w-4 shrink-0 text-amber-500" />, label: 'Portal Settings' },
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
    <div className="flex flex-col h-full select-none bg-background/95 backdrop-blur-xl">
      {/* Sidebar Top Brand Header */}
      <div className={cn(
        "flex items-center h-16 shrink-0 transition-all duration-300 px-4 border-b border-border/40",
        collapsed ? "justify-center px-2" : "justify-between"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-amber-500 text-white p-2 rounded-xl shadow-md shadow-amber-500/20 shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden transition-all duration-300">
              <h1 className="text-xs sm:text-sm font-extrabold text-foreground font-headline truncate leading-tight">
                {header.logo.title}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
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
            className="h-8 w-8 text-muted-foreground hover:text-amber-500 rounded-xl transition-colors"
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
              className="hidden sm:flex h-8 w-8 text-muted-foreground hover:text-amber-500 rounded-xl shrink-0"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Links List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-1.5">
            {!collapsed && (
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground px-3 py-1">
                {group.groupName}
              </p>
            )}

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
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                            )}
                            title={item.label}
                          >
                            {item.icon}
                          </button>

                          {/* Hover Popout Submenu when Sidebar is Collapsed */}
                          <div className="absolute left-full ml-3 top-0 bg-popover/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl p-3 w-56 opacity-0 pointer-events-none group-hover/item:opacity-100 group-hover/item:pointer-events-auto transition-all z-50 space-y-1.5">
                            <div className="px-1 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            <div className="border-l-2 border-amber-500/60 pl-3 space-y-2">
                              {item.subItems.map((sub) => {
                                const subActive = isActive(sub.href);
                                return (
                                  <Link
                                    key={sub.label}
                                    href={sub.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                      "flex items-center gap-2 text-xs transition-all truncate py-1",
                                      subActive
                                        ? 'text-amber-600 dark:text-amber-400 font-bold'
                                        : 'text-muted-foreground hover:text-foreground font-semibold'
                                    )}
                                  >
                                    {sub.icon}
                                    <span>{sub.label}</span>
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
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold border-l-4 border-amber-500 pl-2'
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
                            <div className="ml-4 pl-3 border-l-2 border-amber-500/40 space-y-1.5 my-1.5">
                              {item.subItems.map((sub) => {
                                const subActive = isActive(sub.href);
                                return (
                                  <Link
                                    key={sub.label}
                                    href={sub.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                      "flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200 truncate",
                                      subActive
                                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                                        : 'text-muted-foreground hover:text-foreground font-medium hover:bg-muted/40'
                                    )}
                                  >
                                    {sub.icon}
                                    <span>{sub.label}</span>
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

                // Regular Top-Level Link with Warm Accent
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
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold border-l-4 border-amber-500 pl-2'
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
                            ? 'bg-amber-500 text-white' 
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        )}>
                          {item.badge}
                        </span>
                      ) : null
                    )}

                    {/* Collapsed Badge Dot Indicator */}
                    {collapsed && item.badge ? (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-background" />
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

      {/* User Profile Footer */}
      <div className={cn("mt-auto shrink-0 transition-all duration-300 border-t border-border/40", collapsed ? "p-2" : "p-3")}>
        <div className={cn(
          "flex items-center p-2 transition-all duration-300 border-none bg-transparent shadow-none",
          collapsed ? "flex-col gap-2 justify-center" : "gap-2.5 justify-between"
        )}>
          <Avatar className="h-8 w-8 border-none shrink-0">
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Admin" />
            <AvatarFallback className="bg-amber-500/20 text-amber-600 font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate capitalize">
                {user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium truncate">Super Administrator</p>
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
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-background px-4 sm:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border-border/60">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-background border-r border-border/60">
            <SidebarContent collapsed={false} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 text-white p-1 rounded-md">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold font-headline">{header.logo.title} Admin</span>
        </div>
        <div className="w-8" />
      </header>

      {/* Desktop Fixed Collapsible Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 hidden h-full border-r border-border/50 bg-background sm:flex flex-col z-40 transition-all duration-300 ease-in-out",
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
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/content-management/visual-builder'))}>
              🎨 Live CMS Studio
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
