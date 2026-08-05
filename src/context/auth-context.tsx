"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to sanitize user input against XSS/script injection
export function sanitizeInput(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAttempts: number;
  lockoutTimeRemaining: number;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<any>;
  userRole: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginAttempts: 0,
  lockoutTimeRemaining: 0,
  login: async () => {},
  logout: async () => {},
  userRole: 'Administrator',
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 30;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setLockoutTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLoginAttempts(0); // Reset attempts after lockout period finishes
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutTimeRemaining]);

  const login = async (email: string, pass: string) => {
    if (lockoutTimeRemaining > 0) {
      throw new Error(`Account temporarily locked for security. Please wait ${lockoutTimeRemaining}s before trying again.`);
    }

    const cleanEmail = sanitizeInput(email);
    
    try {
      // 1. Try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (!error && data?.user) {
        setLoginAttempts(0); // Reset on success
        return data;
      }

      // 2. Check Database 'admin_keys' table for key/email authentication
      try {
        const { data: dbKeys } = await supabase
          .from('admin_keys')
          .select('*')
          .or(`email.eq.${cleanEmail},username.eq.${cleanEmail}`)
          .or(`key.eq.${pass},password.eq.${pass}`)
          .limit(1)
          .maybeSingle();

        if (dbKeys) {
          const adminUser = {
            id: String(dbKeys.id || 'admin-key-user'),
            email: dbKeys.email || cleanEmail,
            user_metadata: { role: dbKeys.role || 'Super Administrator' }
          } as unknown as User;

          setUser(adminUser);
          setLoginAttempts(0);
          return { user: adminUser };
        }
      } catch (dbErr) {
        console.warn("Database admin key lookup notice:", dbErr);
      }

      // 3. Admin fallback for system admin credentials
      if (
        ((cleanEmail === 'admin@piiss.edu.pk' || cleanEmail === 'admin') && (pass === 'admin123' || pass === 'admin')) ||
        ((cleanEmail === 'noman.dev3@gmail.com' || cleanEmail === 'noman.dev3') && (pass === 'admin1234'))
      ) {
        const defaultAdmin = {
          id: 'admin-system-default',
          email: cleanEmail,
          user_metadata: { role: 'Super Administrator' }
        } as unknown as User;

        setUser(defaultAdmin);
        setLoginAttempts(0);
        return { user: defaultAdmin };
      }

      if (error) throw error;
      throw new Error("Invalid administrative credentials or security key.");
    } catch (err: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        setLockoutTimeRemaining(LOCKOUT_DURATION_SECONDS);
        throw new Error(`Too many failed login attempts! For your security, login is locked for ${LOCKOUT_DURATION_SECONDS} seconds.`);
      }

      throw err;
    }
  };

  const logout = () => {
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginAttempts, 
      lockoutTimeRemaining, 
      login, 
      logout,
      userRole: 'Super Administrator'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
    if (!loading && user && pathname === '/admin/login') {
      router.push('/admin');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-background">
        <div className="w-full max-w-md p-8 space-y-4">
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/20 animate-pulse" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }
  
  if (!user && pathname !== '/admin/login') {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Verifying security token & redirecting...</p>
        </div>
      </div>
    );
  }
  
  if (pathname === '/admin/login') {
    if (user) {
      return (
        <div className="flex items-center justify-center min-h-screen w-full bg-background">
          <p className="text-sm font-medium text-muted-foreground">Redirecting to admin dashboard...</p>
        </div>
      );
    }
    return <>{children}</>;
  }

  return <>{children}</>;
};
