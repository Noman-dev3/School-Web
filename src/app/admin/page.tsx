
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { 
  Users, GraduationCap, UserPlus, Calendar, ArrowUpRight, ShieldCheck, 
  RefreshCw, Download, CheckCircle2, XCircle, Clock, Search, Eye, 
  Activity, ArrowRight, Sparkles, Filter, ExternalLink, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Admission } from "./admissions/data/schema";
import { Student } from "./students/data/schema";
import { AdmissionsStatusChart } from "./components/admissions-status-chart";
import { StudentsByClassChart } from "./components/students-by-class-chart";
import { Event } from "./content-management/events/data/schema";

interface DashboardData {
  totalStudents: number;
  totalTeachers: number;
  pendingAdmissions: number;
  upcomingEvents: number;
  admissions: Admission[];
  students: Student[];
  events: Event[];
}

function MiniSparklineChart({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const height = 36;
  const width = 110;
  const padding = 4;

  const coords = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  const gradientId = `sparkline-${color.replace('#', '')}`;

  return (
    <div className="w-28 h-9 shrink-0 overflow-hidden">
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

function computeRealTrend(items: any[], dateKey = 'created_at') {
  if (!items || items.length === 0) return [0, 0, 0, 0, 0, 0, 0];
  
  const now = new Date().getTime();
  const times = items.map(item => {
    const d = item[dateKey] || item.submittedAt || item.date || item.createdAt;
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

export default function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedApplicant, setSelectedApplicant] = useState<Admission | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const studentTrend = useMemo(() => computeRealTrend(data?.students || []), [data?.students]);
  const teacherTrend = useMemo(() => computeRealTrend(data?.admissions || []), [data?.admissions]);
  const admissionsTrend = useMemo(() => computeRealTrend(data?.admissions?.filter(a => a.status === 'pending') || []), [data?.admissions]);
  const eventsTrend = useMemo(() => computeRealTrend(data?.events || []), [data?.events]);

  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [
        { data: studentsData },
        { data: teachersData },
        { data: admissionsData },
        { data: eventsData }
      ] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('teachers').select('*'),
        supabase.from('admissions').select('*'),
        supabase.from('events').select('*')
      ]);

      const students = (studentsData || []) as Student[];
      const admissions = ((admissionsData || []).map((item: any) => ({ ...item, id: String(item.id) }))) as Admission[];
      const events = (eventsData || []) as Event[];

      const totalStudents = students.length;
      const totalTeachers = (teachersData || []).length;
      const pendingAdmissions = admissions.filter(a => a.status === 'pending').length;
      const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;

      setData({ 
        totalStudents, 
        totalTeachers, 
        pendingAdmissions, 
        upcomingEvents,
        admissions,
        students,
        events
      });
    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
      toast({
        title: "Data Sync Failed",
        description: "Could not fetch updated metrics from database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleUpdateAdmissionStatus = async (item: Admission, newStatus: 'approved' | 'rejected') => {
    const key = item.id;
    if (!key) return;

    setUpdatingId(key);
    try {
      const { error } = await supabase.from('admissions').update({ status: newStatus }).eq('id', key);
      if (error) throw error;
      
      toast({
        title: `Application ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Admission for ${item.applicantName} updated successfully.`,
      });

      // Reload fresh metrics
      await loadDashboardData();
    } catch (err) {
      console.error("Status update error:", err);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating status.",
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered Admissions List
  const filteredAdmissions = useMemo(() => {
    if (!data?.admissions) return [];
    return data.admissions.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        !query ||
        item.applicantName?.toLowerCase().includes(query) ||
        item.parentName?.toLowerCase().includes(query) ||
        item.appliedClass?.toLowerCase().includes(query) ||
        item.parentEmail?.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [data?.admissions, statusFilter, searchQuery]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 mt-2 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Skeleton className="lg:col-span-3 h-80 rounded-2xl" />
          <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-headline text-foreground tracking-tight">
            Welcome back, <span className="text-primary font-black">School Admin</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Here&apos;s what&apos;s happening on your school platform today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={refreshing}
            className="rounded-xl h-9 text-xs gap-1.5 border-border/80 bg-background hover:bg-muted font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs font-semibold px-4"
          >
            <Link href="/admin/admissions">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Review Admissions ({data.pendingAdmissions})</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid matching reference design */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <Card className="rounded-xl border-border/80 bg-card p-4 transition-all shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
              <span>Total Students <span className="opacity-40">/ All time</span></span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-3xl font-bold font-headline text-foreground">{data.totalStudents}</div>
              <MiniSparklineChart data={studentTrend} color="#3b82f6" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground font-medium">
            <span className="text-emerald-500 font-semibold">Enrolled</span> active in portal
          </div>
        </Card>

        {/* Total Faculty */}
        <Card className="rounded-xl border-border/80 bg-card p-4 transition-all shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
              <span>Faculty & Staff <span className="opacity-40">/ Current</span></span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-3xl font-bold font-headline text-foreground">{data.totalTeachers}</div>
              <MiniSparklineChart data={teacherTrend} color="#6366f1" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground font-medium">
            <span className="text-blue-500 font-semibold">Active</span> teaching faculty
          </div>
        </Card>

        {/* Pending Admissions */}
        <Card className="rounded-xl border-border/80 bg-card p-4 transition-all shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
              <span>Pending Admissions <span className="opacity-40">/ Current</span></span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-3xl font-bold font-headline text-foreground">{data.pendingAdmissions}</div>
              <MiniSparklineChart data={admissionsTrend} color="#f59e0b" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground font-medium">
            <span className="text-amber-500 font-semibold">Pending</span> applications
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="rounded-xl border-border/80 bg-card p-4 transition-all shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
              <span>Upcoming Events <span className="opacity-40">/ Scheduled</span></span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div className="text-3xl font-bold font-headline text-foreground">{data.upcomingEvents}</div>
              <MiniSparklineChart data={eventsTrend} color="#10b981" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground font-medium">
            <span className="text-emerald-500 font-semibold">Active</span> calendar events
          </div>
        </Card>
      </div>

      {/* Recharts Analytics Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 rounded-2xl border-border/80 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-headline">Student Grade Distribution</CardTitle>
                <CardDescription className="text-xs">Class-by-class student enrollment breakdown.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <StudentsByClassChart students={data.students} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl border-border/80 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-headline">Admissions Funnel</CardTitle>
                <CardDescription className="text-xs">Status breakdown of submitted applications.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <AdmissionsStatusChart admissions={data.admissions} />
          </CardContent>
        </Card>
      </div>

      {/* Admissions Management Table */}
      <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold font-headline">Recent Admission Applications</CardTitle>
                <Badge variant="secondary" className="text-[10px] rounded-full">
                  {filteredAdmissions.length} Listed
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Inspect applicant submissions and approve or reject applications in real time.
              </CardDescription>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search applicant or parent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-background border-border/80"
                />
              </div>

              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
                <TabsList className="h-9 p-1 rounded-xl bg-muted/60 text-xs">
                  <TabsTrigger value="all" className="text-xs px-2.5 py-1 rounded-lg">All</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs px-2.5 py-1 rounded-lg text-amber-600 dark:text-amber-400">
                    Pending ({data.admissions.filter(a => a.status === 'pending').length})
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="text-xs px-2.5 py-1 rounded-lg text-emerald-600 dark:text-emerald-400">Approved</TabsTrigger>
                  <TabsTrigger value="rejected" className="text-xs px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {filteredAdmissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No admission records match your filter criteria.</p>
              <p className="text-xs text-muted-foreground/80 mt-1">Try resetting search filters or select &apos;All&apos;.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold">Applicant Name</TableHead>
                  <TableHead className="text-xs font-semibold">Class Applied</TableHead>
                  <TableHead className="text-xs font-semibold">Parent / Guardian</TableHead>
                  <TableHead className="text-xs font-semibold">Contact Email</TableHead>
                  <TableHead className="text-xs font-semibold">Submission Date</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Quick Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmissions.slice(0, 8).map((item) => {
                  const isUpdating = updatingId === item.id;
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-xs text-foreground">
                        {item.applicantName}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] bg-background">
                          {item.appliedClass}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.parentName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {item.parentEmail}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Recent'}
                      </TableCell>
                      <TableCell>
                        {item.status === 'approved' && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </Badge>
                        )}
                        {item.status === 'pending' && (
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] gap-1 animate-pulse">
                            <Clock className="h-3 w-3" /> Pending Review
                          </Badge>
                        )}
                        {item.status === 'rejected' && (
                          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] gap-1">
                            <XCircle className="h-3 w-3" /> Rejected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedApplicant(item)}
                          className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="View Full Profile"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        {item.status !== 'approved' && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleUpdateAdmissionStatus(item, 'approved')}
                            className="h-7 text-[11px] px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                          >
                            Approve
                          </Button>
                        )}

                        {item.status !== 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleUpdateAdmissionStatus(item, 'rejected')}
                            className="h-7 text-[11px] px-2.5 rounded-lg border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-medium"
                          >
                            Reject
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>



      {/* Applicant Detail Dialog */}
      <Dialog open={!!selectedApplicant} onOpenChange={(open) => !open && setSelectedApplicant(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-headline">
              Applicant Profile: {selectedApplicant?.applicantName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete submission details from the online admissions portal.
            </DialogDescription>
          </DialogHeader>

          {selectedApplicant && (
            <div className="space-y-4 text-xs mt-2">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Applied Grade</span>
                  <p className="font-bold text-foreground text-sm">{selectedApplicant.appliedClass}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Application Status</span>
                  <p className="font-bold capitalize text-primary text-sm">{selectedApplicant.status}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Date of Birth</span>
                  <p className="font-medium text-foreground">{selectedApplicant.dob || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Gender</span>
                  <p className="font-medium text-foreground">{selectedApplicant.gender || 'N/A'}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Parent / Guardian Contact</span>
                <p className="font-semibold text-foreground">{selectedApplicant.parentName}</p>
                <p className="text-muted-foreground font-mono">Email: {selectedApplicant.parentEmail}</p>
                <p className="text-muted-foreground font-mono">Phone: {selectedApplicant.parentPhone}</p>
              </div>

              {selectedApplicant.previousSchool && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Previous School Attended</span>
                  <p className="text-foreground font-medium">{selectedApplicant.previousSchool}</p>
                </div>
              )}

              {selectedApplicant.comments && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Additional Notes</span>
                  <p className="text-foreground text-xs italic">{selectedApplicant.comments}</p>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApplicant(null)}
                  className="rounded-xl text-xs"
                >
                  Close Profile
                </Button>
                {selectedApplicant.status !== 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleUpdateAdmissionStatus(selectedApplicant, 'approved');
                      setSelectedApplicant(null);
                    }}
                    className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Approve Application
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

