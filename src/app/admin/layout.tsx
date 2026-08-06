"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, AuthGuard } from '@/context/auth-context';
import { AdminSidebar } from '@/components/admin-sidebar';
import { cn } from '@/lib/utils';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const savedState = localStorage.getItem('admin_sidebar_collapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(nextState));
      return nextState;
    });
  };

  if (isLoginPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col sm:flex-row text-foreground overflow-x-hidden">
      <AdminSidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out p-0 m-0",
          isCollapsed ? "sm:ml-20" : "sm:ml-64"
        )}
      >
        <main className="flex-1 bg-white dark:bg-[#121214] rounded-tl-[32px] p-6 sm:p-8 lg:p-10 shadow-sm border-l border-t border-border/20 min-h-[calc(100vh-0.75rem)] mt-3 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <AdminShell>{children}</AdminShell>
      </AuthGuard>
    </AuthProvider>
  );
}
