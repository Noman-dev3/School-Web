
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, ShieldCheck, Eye, EyeOff, Lock, AlertTriangle, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, lockoutTimeRemaining, loginAttempts } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeRemaining > 0) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast({
        title: "Authentication Successful",
        description: "Welcome to the PIISS Enterprise Management Dashboard.",
      });
      router.push('/admin');
    } catch (error) {
      toast({
        title: "Security Verification Failed",
        description: (error as Error).message || "Invalid credentials provided.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('admin@piiss.edu.pk');
    setPassword('admin123');
    toast({
      title: "Demo Credentials Populated",
      description: "Click 'Sign In to Portal' to authenticate.",
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Ambient background glow elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Institution Identity & Security Showcase */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white font-headline tracking-wide">PIISS Portal</h1>
                <p className="text-xs text-emerald-400 font-medium">Enterprise Management</p>
              </div>
            </div>

            <div className="space-y-6 mt-6">
              <div>
                <h2 className="text-2xl font-bold font-headline text-white leading-tight">
                  Secure Access Command Center
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Centralized administrative dashboard for student admissions, academic records, staff management, and portal operations.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200">256-Bit TLS Encrypted Session</p>
                    <p className="text-[11px] text-slate-400">Strict AuthGuard state protection enabled</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <Lock className="h-5 w-5 text-indigo-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-200">Brute-Force Rate Limiting</p>
                    <p className="text-[11px] text-slate-400">Automatic IP lockout on invalid attempts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-500/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Online v2.4
            </span>
            <span>PIISS IT Security</span>
          </div>
        </div>

        {/* Right Side: High-Security Login Form */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold font-headline text-white">Portal Sign In</h3>
                <p className="text-xs text-slate-400">Enter authorized admin credentials to proceed.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center gap-1.5 text-xs">
                <KeyRound className="h-4 w-4 text-emerald-400" />
                <span>SSL Secured</span>
              </div>
            </div>

            {/* Lockout Warning Banner if rate limited */}
            {lockoutTimeRemaining > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-shake">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                <div>
                  <p className="font-semibold">Security Lockout Active</p>
                  <p className="text-[11px] text-rose-300/80">
                    Too many failed login attempts. Please wait <span className="font-bold text-white">{lockoutTimeRemaining}s</span> before retrying.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
                  Administrative Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@piiss.edu.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={lockoutTimeRemaining > 0 || isSubmitting}
                    className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl h-11 text-sm pl-4 pr-10"
                  />
                  <ShieldCheck className="absolute right-3 top-3 h-5 w-5 text-slate-600 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-300">
                    Secret Key / Password
                  </Label>
                  {loginAttempts > 0 && (
                    <span className="text-[11px] text-amber-400">
                      Failed attempts: {loginAttempts}/5
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={lockoutTimeRemaining > 0 || isSubmitting}
                    className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl h-11 text-sm pl-4 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={lockoutTimeRemaining > 0 || isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl h-11 transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating Session...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Sign In to Portal</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-between bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Test Admin Credentials</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQuickDemoFill}
                  className="h-8 text-xs bg-slate-900 hover:bg-slate-800 border-slate-700 text-emerald-400 hover:text-emerald-300 rounded-lg"
                >
                  Quick Fill
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[11px] text-slate-500">
            Protected by PIISS Encrypted Auth &bull; Authorized Personnel Only
          </div>
        </div>

      </div>
    </div>
  );
}

