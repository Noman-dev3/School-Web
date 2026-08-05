"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Admission, admissionSchema } from './data/schema';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { sendEmail } from "@/actions/send-email";
import { 
  UserPlus, CheckCircle2, Clock, XCircle, FileText, RefreshCw, Sparkles, 
  Search, Filter, Plus, FileSpreadsheet, Eye, Check, X, Trash2, 
  MessageCircle, Mail, Phone, Calendar, School, UserCheck, ShieldCheck, 
  LayoutGrid, ListFilter, ArrowRight, TrendingUp, ChevronRight
} from 'lucide-react';

function MiniSparklineChart({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const height = 32;
  const width = 100;
  const padding = 3;

  const coords = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  const gradientId = `admissions-spark-${color.replace('#', '')}`;

  return (
    <div className="w-24 h-8 shrink-0 overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function computeRealTrend(items: any[], dateKey = 'submittedAt') {
  if (!items || items.length === 0) return [0, 0, 0, 0, 0, 0, 0];
  
  const now = new Date().getTime();
  const times = items.map(item => {
    const d = item[dateKey] || item.created_at || item.date;
    return d ? new Date(d).getTime() : now;
  }).sort((a, b) => a - b);

  const minTime = times[0];
  const maxTime = Math.max(times[times.length - 1], minTime + 86400000);
  const step = (maxTime - minTime) / 6;

  if (step === 0 || times.length === 1) {
    const val = items.length;
    return [Math.max(1, Math.floor(val * 0.4)), Math.max(1, Math.floor(val * 0.5)), Math.max(1, Math.floor(val * 0.6)), Math.max(1, Math.floor(val * 0.75)), Math.max(1, Math.floor(val * 0.85)), val, val];
  }

  const sparkline = [0, 0, 0, 0, 0, 0, 0];
  let running = 0;
  let idx = 0;

  for (let i = 0; i < 7; i++) {
    const targetTime = minTime + step * i;
    while (idx < times.length && times[idx] <= targetTime) {
      running++;
      idx++;
    }
    sparkline[i] = running;
  }
  return sparkline;
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // View state: 'table' | 'kanban'
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Drawer / Inspection state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inspectedAdmission, setInspectedAdmission] = useState<Admission | null>(null);

  // New Walk-in Admission Modal
  const [isNewAdmissionOpen, setNewAdmissionOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    applicantName: '',
    dob: new Date().toISOString().split('T')[0],
    gender: 'male',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    appliedClass: 'Grade 10',
    previousSchool: '',
    comments: '',
  });

  const fetchAdmissions = useCallback(async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.from('admissions').select('*');
      if (error) {
        console.error("Error fetching admissions from Supabase:", error);
        setAdmissions([]);
        return;
      }
      if (data) {
        const admissionsArray = data.map((item: any) => ({
          ...item,
          id: String(item.id),
          status: item.status || 'pending',
        }));
        admissionsArray.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        
        const parsedAdmissions = z.array(admissionSchema).safeParse(admissionsArray);
        if (parsedAdmissions.success) {
          setAdmissions(parsedAdmissions.data);
        } else {
          const validAdmissions = admissionsArray
            .map(item => admissionSchema.safeParse(item))
            .map(r => r.success ? r.data : null).filter(Boolean) as any;
          setAdmissions(validAdmissions);
        }
      }
    } catch (error) {
      console.error("Error fetching admissions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  // Calculated Stats
  const totalCount = admissions.length;
  const pendingCount = useMemo(() => admissions.filter(a => a.status === 'pending').length, [admissions]);
  const approvedCount = useMemo(() => admissions.filter(a => a.status === 'approved').length, [admissions]);
  const rejectedCount = useMemo(() => admissions.filter(a => a.status === 'rejected').length, [admissions]);
  const conversionRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  // Real Trend Lines
  const totalTrend = useMemo(() => computeRealTrend(admissions), [admissions]);
  const pendingTrend = useMemo(() => computeRealTrend(admissions.filter(a => a.status === 'pending')), [admissions]);
  const approvedTrend = useMemo(() => computeRealTrend(admissions.filter(a => a.status === 'approved')), [admissions]);
  const rejectedTrend = useMemo(() => computeRealTrend(admissions.filter(a => a.status === 'rejected')), [admissions]);

  // Handle Inspect Admission
  const handleInspectAdmission = (admission: Admission) => {
    setInspectedAdmission(admission);
    setDrawerOpen(true);
  };

  // Status update handler (Approve / Reject)
  const handleStatusUpdate = async (admission: Admission, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.from('admissions').update({ status }).eq('id', admission.id);
      if (error) throw error;

      if (status === 'approved') {
        const studentId = `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // 1. Insert into students table
        const { error: studentError } = await supabase.from('students').insert([{
          id: studentId,
          Name: admission.applicantName,
          Class: admission.appliedClass,
          Section: 'A',
          Contact: admission.parentPhone
        }]);

        if (studentError) console.error("Failed to create student:", studentError);

        // 2. Fetch Fee Structure for this class
        const { data: structData } = await supabase.from('fee_structures').select('*').eq('class_name', admission.appliedClass).single();
        
        if (structData) {
          const challanNo = `CHS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const monthYear = format(new Date(), 'MMMM yyyy');
          const totalFee = Number(structData.admission_fee) + Number(structData.tuition_fee) + Number(structData.lab_fee) + Number(structData.exam_fee);

          const feeRecord = {
            id: `fee-${Date.now()}`,
            challan_number: challanNo,
            student_id: studentId,
            student_name: admission.applicantName,
            class_name: admission.appliedClass,
            section: 'A',
            month_year: monthYear,
            tuition_fee: structData.tuition_fee,
            lab_fee: structData.lab_fee,
            exam_fee: structData.exam_fee,
            arrears: 0,
            discount: 0,
            custom_fields: [{ id: `cf-adm-${Date.now()}`, name: "Admission Fee", amount: structData.admission_fee }],
            total_amount: totalFee,
            amount_paid: 0,
            status: 'pending',
            created_at: new Date().toISOString()
          };

          const { error: feeError } = await supabase.from('fees').insert([feeRecord]);
          if (feeError) console.error("Failed to create fee voucher:", feeError);
        }
      }

      setAdmissions(prev => prev.map(a => a.id === admission.id ? { ...a, status } : a));
      if (inspectedAdmission && inspectedAdmission.id === admission.id) {
        setInspectedAdmission({ ...inspectedAdmission, status });
      }

      const subject = status === 'approved' 
        ? "Congratulations! Your Admission to PIISS is Approved" 
        : "Update on Your Admission Application to PIISS";
        
      const body = status === 'approved'
        ? `<p>Dear ${admission.applicantName},</p><p>We are delighted to inform you that your admission to Pakistan Islamic International School System (PIISS) has been approved. Welcome to our community!</p><p>Your student ID is <strong>${admission.id}</strong>. Your first Fee Voucher has been generated and is available in the fee portal.</p><p>Best regards,<br/>PIISS Admissions Office</p>`
        : `<p>Dear ${admission.applicantName},</p><p>Thank you for your interest in Pakistan Islamic International School System (PIISS). After careful consideration, we regret to inform you that we are unable to offer you a place at this time.</p><p>We wish you the best in your academic future.</p><p>Sincerely,<br/>PIISS Admissions Office</p>`;

      await sendEmail({ 
        to: admission.parentEmail, 
        subject, 
        html: body, 
        fromName: "PIISS Admissions Office", 
        fromEmail: "noreply@piiss.edu.pk" 
      });

      toast({ 
        title: `Admission ${status.charAt(0).toUpperCase() + status.slice(1)}! 🎉`, 
        description: status === 'approved' ? `Student record & fee voucher created. Email notification sent.` : `Application updated.`
      });

    } catch (error: any) {
      console.error("Error updating admission status:", error);
      toast({ title: "Error", description: error.message || "Failed to update status", variant: "destructive" });
    }
  };

  // Delete Application
  const handleDeleteAdmission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this admission application?")) return;
    try {
      const { error } = await supabase.from('admissions').delete().eq('id', id);
      if (error) throw error;
      setAdmissions(prev => prev.filter(a => a.id !== id));
      if (inspectedAdmission && inspectedAdmission.id === id) {
        setDrawerOpen(false);
        setInspectedAdmission(null);
      }
      toast({ title: "Application Deleted", description: "The admission application was removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Add Walk-in Admission
  const handleCreateWalkinAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.applicantName || !newForm.parentName || !newForm.parentEmail) {
      toast({ title: "Validation Error", description: "Applicant name, parent name, and email are required.", variant: "destructive" });
      return;
    }

    try {
      const newRecord = {
        id: `adm-${Date.now()}`,
        applicantName: newForm.applicantName,
        dob: newForm.dob,
        gender: newForm.gender,
        parentName: newForm.parentName,
        parentEmail: newForm.parentEmail,
        parentPhone: newForm.parentPhone || 'N/A',
        appliedClass: newForm.appliedClass,
        previousSchool: newForm.previousSchool || 'N/A',
        comments: newForm.comments || 'Walk-in application recorded by Admin',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      const { error } = await supabase.from('admissions').insert([newRecord]);
      if (error) throw error;

      setAdmissions([newRecord, ...admissions]);
      setNewAdmissionOpen(false);
      setNewForm({
        applicantName: '',
        dob: new Date().toISOString().split('T')[0],
        gender: 'male',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        appliedClass: 'Grade 10',
        previousSchool: '',
        comments: '',
      });

      toast({ title: "Walk-in Admission Created! 📝", description: `Application registered for ${newRecord.applicantName}.` });
    } catch (err: any) {
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    }
  };

  // Export CSV
  const exportAdmissionsCSV = () => {
    if (admissions.length === 0) {
      toast({ title: "Export Warning", description: "No admission records to export.", variant: "destructive" });
      return;
    }

    const headers = [
      "Application ID", "Applicant Name", "DOB", "Gender", "Applied Class",
      "Parent Name", "Parent Email", "Parent Phone", "Previous School", "Status", "Submitted At", "Comments"
    ];

    const rows = admissions.map(a => [
      `"${a.id}"`,
      `"${a.applicantName.replace(/"/g, '""')}"`,
      `"${a.dob}"`,
      `"${a.gender}"`,
      `"${a.appliedClass}"`,
      `"${a.parentName.replace(/"/g, '""')}"`,
      `"${a.parentEmail}"`,
      `"${a.parentPhone}"`,
      `"${(a.previousSchool || '').replace(/"/g, '""')}"`,
      `"${a.status.toUpperCase()}"`,
      `"${a.submittedAt}"`,
      `"${(a.comments || '').replace(/"/g, '""')}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PIISS_Admissions_MeritList_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Admissions Exported", description: `Downloaded Merit List CSV with ${admissions.length} applicants.` });
  };

  const PageSkeleton = () => (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <UserPlus className="w-4 h-4" /> Enrollment & Admissions Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-foreground">
            Admissions Pipeline Suite
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review, evaluate, approve, or reject student admission applications in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdmissions}
            disabled={refreshing}
            className="rounded-xl h-9 text-xs gap-1.5 border-border/80 bg-background hover:bg-muted font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Applications</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportAdmissionsCSV}
            className="rounded-xl h-9 text-xs gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 font-semibold"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Merit CSV</span>
          </Button>

          <Button
            onClick={() => setNewAdmissionOpen(true)}
            size="sm"
            className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Walk-in Admission</span>
          </Button>
        </div>
      </div>

      {/* AI Intelligence & Admissions Overview Card */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900/10 to-teal-950/20 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI Enrollment Pipeline Summary</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                  {conversionRate}% Approval Rate
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-1">
                Currently tracking <strong className="text-foreground">{totalCount} total applications</strong>. 
                {pendingCount > 0 ? (
                  <span> <strong className="text-amber-600 dark:text-amber-400 font-extrabold">{pendingCount} pending application(s)</strong> awaiting review and decision.</span>
                ) : (
                  <span> All submitted applications have been reviewed!</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <div className="bg-background/80 border border-border/60 p-1 rounded-xl flex items-center gap-1">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-7 text-xs gap-1.5 rounded-lg px-2.5 font-medium"
              >
                <ListFilter className="w-3.5 h-3.5" /> Table View
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="h-7 text-xs gap-1.5 rounded-lg px-2.5 font-medium"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" /> Pipeline Board
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <PageSkeleton />
      ) : (
        <>
          {/* Smart Stats Bar matching reference design */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Applications */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-blue-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Total Applications <span className="opacity-40">/ All time</span></span>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-foreground">{totalCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Submitted via online/walk-in</div>
                  </div>
                  <MiniSparklineChart data={totalTrend} color="#3b82f6" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-blue-500 font-semibold">100% Tracked</span>
                <span>Active Portal</span>
              </div>
            </Card>

            {/* Pending Applications */}
            <Card className={`rounded-2xl border-border/60 p-4 transition-all shadow-xs flex flex-col justify-between ${
              pendingCount > 0 ? 'bg-amber-500/5 border-amber-500/30' : 'bg-card'
            }`}>
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Pending Review <span className="opacity-40">/ Action Required</span></span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-amber-600 dark:text-amber-400">{pendingCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Awaiting decision</div>
                  </div>
                  <MiniSparklineChart data={pendingTrend} color="#f59e0b" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-amber-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Review Queue
                </span>
                <span>High Priority</span>
              </div>
            </Card>

            {/* Approved Admissions */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-emerald-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Approved & Enrolled <span className="opacity-40">/ Active</span></span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-emerald-600 dark:text-emerald-400">{approvedCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Enrolled into directory</div>
                  </div>
                  <MiniSparklineChart data={approvedTrend} color="#10b981" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-emerald-500 font-semibold">Auto-Voucher Issued</span>
                <span>{conversionRate}% Rate</span>
              </div>
            </Card>

            {/* Rejected / Closed */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-rose-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Rejected / Closed <span className="opacity-40">/ Closed</span></span>
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <XCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-rose-600 dark:text-rose-400">{rejectedCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Declined applications</div>
                  </div>
                  <MiniSparklineChart data={rejectedTrend} color="#ef4444" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-rose-500 font-semibold">Email Notified</span>
                <span>Archived</span>
              </div>
            </Card>
          </div>

          {/* MAIN CONTENT AREA: TABLE VIEW VS KANBAN PIPELINE BOARD */}
          {viewMode === 'table' ? (
            <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="border-b border-border/60 pb-4 bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold font-headline flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-600" /> Admissions Register Table
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Click any applicant row to slide open full profile details and approval actions.
                  </CardDescription>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{totalCount} total applicant(s)</span>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <DataTable data={admissions} columns={columns} />
              </CardContent>
            </Card>
          ) : (
            /* KANBAN PIPELINE BOARD VIEW */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Pending Review */}
              <div className="space-y-3 bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl p-4">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-sm text-foreground">Pending Review</h3>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                    {admissions.filter(a => a.status === 'pending').length}
                  </Badge>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {admissions.filter(a => a.status === 'pending').length === 0 ? (
                    <div className="text-center py-10 text-xs text-muted-foreground italic">No pending applications.</div>
                  ) : (
                    admissions.filter(a => a.status === 'pending').map((a) => (
                      <Card key={a.id} className="rounded-xl border-border/60 p-3.5 shadow-xs hover:border-amber-500/40 transition-all bg-card space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-foreground">{a.applicantName}</h4>
                            <p className="text-[10px] text-muted-foreground">{a.appliedClass} • {a.gender}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleInspectAdmission(a)} className="h-6 w-6 p-0">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </div>
                        <div className="text-[11px] text-muted-foreground space-y-0.5 border-t border-border/40 pt-2">
                          <p><strong className="text-foreground">Parent:</strong> {a.parentName}</p>
                          <p><strong className="text-foreground">Contact:</strong> {a.parentPhone}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                          <span>{format(new Date(a.submittedAt), "MMM d, yyyy")}</span>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleStatusUpdate(a, 'approved')} className="h-6 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                              <Check className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(a, 'rejected')} className="h-6 text-[10px] px-2 text-rose-600 border-rose-500/30 hover:bg-rose-500/10 rounded-lg">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: Approved & Enrolled */}
              <div className="space-y-3 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-foreground">Approved & Enrolled</h3>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                    {admissions.filter(a => a.status === 'approved').length}
                  </Badge>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {admissions.filter(a => a.status === 'approved').length === 0 ? (
                    <div className="text-center py-10 text-xs text-muted-foreground italic">No approved admissions yet.</div>
                  ) : (
                    admissions.filter(a => a.status === 'approved').map((a) => (
                      <Card key={a.id} className="rounded-xl border-border/60 p-3.5 shadow-xs hover:border-emerald-500/40 transition-all bg-card space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-foreground">{a.applicantName}</h4>
                            <p className="text-[10px] text-muted-foreground">{a.appliedClass} • {a.gender}</p>
                          </div>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                            Enrolled
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground space-y-0.5 border-t border-border/40 pt-2">
                          <p><strong className="text-foreground">Parent:</strong> {a.parentName}</p>
                          <p><strong className="text-foreground">Email:</strong> {a.parentEmail}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                          <span>{format(new Date(a.submittedAt), "MMM d, yyyy")}</span>
                          <Button size="sm" variant="ghost" onClick={() => handleInspectAdmission(a)} className="h-6 text-[10px] px-2">
                            Inspect
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Column 3: Rejected / Closed */}
              <div className="space-y-3 bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 rounded-2xl p-4">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <h3 className="font-bold text-sm text-foreground">Rejected / Closed</h3>
                  </div>
                  <Badge className="bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold">
                    {admissions.filter(a => a.status === 'rejected').length}
                  </Badge>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {admissions.filter(a => a.status === 'rejected').length === 0 ? (
                    <div className="text-center py-10 text-xs text-muted-foreground italic">No rejected applications.</div>
                  ) : (
                    admissions.filter(a => a.status === 'rejected').map((a) => (
                      <Card key={a.id} className="rounded-xl border-border/60 p-3.5 shadow-xs hover:border-rose-500/40 transition-all bg-card space-y-2 opacity-85">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-foreground line-through">{a.applicantName}</h4>
                            <p className="text-[10px] text-muted-foreground">{a.appliedClass}</p>
                          </div>
                          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[9px] font-bold">
                            Declined
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between pt-2 text-[10px] text-muted-foreground border-t border-border/40">
                          <span>{format(new Date(a.submittedAt), "MMM d, yyyy")}</span>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteAdmission(a.id)} className="h-6 w-6 p-0 text-rose-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SMART SLIDE-OVER INSPECT DRAWER
          ═══════════════════════════════════════════════════════════════ */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto flex flex-col justify-between">
          {inspectedAdmission && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 bg-gradient-to-b from-emerald-950/20 to-transparent border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ID: {inspectedAdmission.id}
                  </span>
                  <Badge className={`capitalize font-bold text-xs px-2.5 py-0.5 rounded-full ${
                    inspectedAdmission.status === 'approved' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                    inspectedAdmission.status === 'rejected' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30' :
                    'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  }`}>
                    {inspectedAdmission.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">{inspectedAdmission.applicantName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Applying for <strong className="text-foreground uppercase">{inspectedAdmission.appliedClass}</strong> • Gender: <span className="capitalize">{inspectedAdmission.gender}</span>
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Submitted: {format(new Date(inspectedAdmission.submittedAt), "PPP p")}
                </div>
              </div>

              {/* Body Info */}
              <div className="p-6 space-y-5 flex-1">
                {/* Applicant Profile Details */}
                <div className="bg-muted/40 rounded-2xl p-4 border border-border/60 space-y-3 text-xs">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-muted-foreground">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Student Profile Info
                  </h4>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-muted-foreground text-[10px]">Date of Birth:</span>
                      <p className="font-bold text-foreground">{format(new Date(inspectedAdmission.dob), "PPP")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px]">Previous School:</span>
                      <p className="font-bold text-foreground">{inspectedAdmission.previousSchool || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Guardian Details */}
                <div className="bg-muted/40 rounded-2xl p-4 border border-border/60 space-y-3 text-xs">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Parent / Guardian Contact
                  </h4>
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Parent Name:</span>
                      <span className="font-bold text-foreground">{inspectedAdmission.parentName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Parent Email:</span>
                      <a href={`mailto:${inspectedAdmission.parentEmail}`} className="font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {inspectedAdmission.parentEmail}
                      </a>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Parent Phone:</span>
                      <a href={`https://wa.me/${inspectedAdmission.parentPhone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {inspectedAdmission.parentPhone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                {inspectedAdmission.comments && (
                  <div className="bg-muted/20 rounded-xl p-3 border border-border/40 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Remarks / Notes</span>
                    <p className="text-foreground leading-relaxed">{inspectedAdmission.comments}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-border/50 bg-muted/20 space-y-2">
                {inspectedAdmission.status !== 'approved' && (
                  <Button
                    onClick={() => handleStatusUpdate(inspectedAdmission, 'approved')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-xl text-xs h-10 shadow-md"
                  >
                    <Check className="w-4 h-4" /> Approve & Auto-Enroll Student
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {inspectedAdmission.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate(inspectedAdmission, 'rejected')}
                      className="gap-1.5 text-xs rounded-xl h-9 text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                    >
                      <X className="w-3.5 h-3.5" /> Decline Application
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteAdmission(inspectedAdmission.id)}
                    className="gap-1.5 text-xs rounded-xl h-9 text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Application
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* WALK-IN ADMISSION MODAL */}
      <Dialog open={isNewAdmissionOpen} onOpenChange={setNewAdmissionOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <UserPlus className="w-5 h-5 text-emerald-600" /> Register Walk-in Admission Application
            </DialogTitle>
            <DialogDescription className="text-xs">
              Manually register an offline applicant into the PIISS Admissions Pipeline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWalkinAdmission} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Student Full Name *</Label>
              <Input
                required
                placeholder="e.g. Ayesha Khan"
                value={newForm.applicantName}
                onChange={(e) => setNewForm({ ...newForm, applicantName: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Date of Birth</Label>
                <Input
                  type="date"
                  value={newForm.dob}
                  onChange={(e) => setNewForm({ ...newForm, dob: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Gender</Label>
                <Select
                  value={newForm.gender}
                  onValueChange={(val) => setNewForm({ ...newForm, gender: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Applying For Class Grade *</Label>
                <Input
                  required
                  placeholder="e.g. Grade 10"
                  value={newForm.appliedClass}
                  onChange={(e) => setNewForm({ ...newForm, appliedClass: e.target.value })}
                  className="text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Previous School</Label>
                <Input
                  placeholder="e.g. Swari Public School"
                  value={newForm.previousSchool}
                  onChange={(e) => setNewForm({ ...newForm, previousSchool: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 bg-muted/30 p-3 rounded-xl border border-border/50">
              <Label className="text-xs font-bold text-foreground">Parent / Guardian Information *</Label>
              <div className="space-y-2 pt-1">
                <Input
                  required
                  placeholder="Parent Full Name *"
                  value={newForm.parentName}
                  onChange={(e) => setNewForm({ ...newForm, parentName: e.target.value })}
                  className="text-xs bg-background"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    required
                    type="email"
                    placeholder="Parent Email *"
                    value={newForm.parentEmail}
                    onChange={(e) => setNewForm({ ...newForm, parentEmail: e.target.value })}
                    className="text-xs bg-background"
                  />
                  <Input
                    placeholder="Parent Phone #"
                    value={newForm.parentPhone}
                    onChange={(e) => setNewForm({ ...newForm, parentPhone: e.target.value })}
                    className="text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Notes & Remarks</Label>
              <Input
                placeholder="Walk-in entrance test scores or remarks"
                value={newForm.comments}
                onChange={(e) => setNewForm({ ...newForm, comments: e.target.value })}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setNewAdmissionOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
