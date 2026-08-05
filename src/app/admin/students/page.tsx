"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { studentSchema, Student } from './data/schema';
import { z } from 'zod';
import { StudentCard } from './components/student-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddStudentDialog } from './components/add-student-dialog';
import { BulkImportDialog } from './components/bulk-import-dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, Search, GraduationCap, Users, Sparkles, LayoutGrid, 
  ListFilter, FileSpreadsheet, Plus, Phone, Mail, Calendar, UserCheck, 
  Eye, Edit, Trash2, Printer, CheckCircle2, MessageCircle, AlertTriangle,
  History, ShieldCheck, X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentDetailsDialog } from './components/student-details-dialog';
import { EditStudentDialog } from './components/edit-student-dialog';

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

  const gradientId = `students-spark-${color.replace('#', '')}`;

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

function computeRealTrend(items: any[], dateKey = 'created_at') {
  if (!items || items.length === 0) return [0, 0, 0, 0, 0, 0, 0];
  
  const now = new Date().getTime();
  const times = items.map(item => {
    const d = item[dateKey] || item.createdAt || item.date;
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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { toast } = useToast();

  // Slide-Over Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);
  const [studentFeesHistory, setStudentFeesHistory] = useState<any[]>([]);

  // Dialog State
  const [isEditOpen, setEditOpen] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.from('students').select('*');
      if (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } else if (data) {
        const studentsArray = data.map((item: any) => ({
          ...item,
          id: String(item.id),
        }));
        const parsedStudents = z.array(studentSchema).safeParse(studentsArray);
        if (parsedStudents.success) {
          setStudents(parsedStudents.data);
        } else {
          const validStudents = studentsArray
            .map(item => studentSchema.safeParse(item))
            .map(r => r.success ? r.data : null).filter(Boolean) as any;
          setStudents(validStudents);
        }
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();

    const channel = supabase.channel('students-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => loadStudents())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStudents]);

  // Unique Classes list for filter
  const classList = useMemo(() => {
    const set = new Set(students.map(s => s.Class).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return students.filter(student => {
      const matchesSearch = 
        student.Name.toLowerCase().includes(query) || 
        student.id.toLowerCase().includes(query) ||
        (student.Class && student.Class.toLowerCase().includes(query)) ||
        (student.Contact && student.Contact.toLowerCase().includes(query));

      const matchesClass = classFilter === "all" || (student.Class && student.Class === classFilter);

      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, classFilter]);

  // Calculated Stats
  const totalCount = students.length;
  const activeClassesCount = useMemo(() => new Set(students.map(s => s.Class).filter(Boolean)).size, [students]);
  const maleCount = useMemo(() => students.filter(s => s.Gender?.toLowerCase() === 'male' || s.Gender?.toLowerCase() === 'boy').length, [students]);
  const femaleCount = useMemo(() => students.filter(s => s.Gender?.toLowerCase() === 'female' || s.Gender?.toLowerCase() === 'girl').length, [students]);

  // Real Sparkline Trends
  const totalTrend = useMemo(() => computeRealTrend(students), [students]);
  const maleTrend = useMemo(() => computeRealTrend(students.filter(s => s.Gender?.toLowerCase() === 'male')), [students]);
  const femaleTrend = useMemo(() => computeRealTrend(students.filter(s => s.Gender?.toLowerCase() === 'female')), [students]);
  const classTrend = useMemo(() => computeRealTrend(students), [students]);

  // Handle Inspect Student Drawer & Fetch Fee History
  const handleInspectStudent = async (student: Student) => {
    setInspectedStudent(student);
    setDrawerOpen(true);

    try {
      const { data: feesData } = await supabase
        .from('fees')
        .select('*')
        .or(`student_id.eq.${student.id},student_name.ilike.%${student.Name}%`)
        .order('created_at', { ascending: false });

      setStudentFeesHistory(feesData || []);
    } catch {
      setStudentFeesHistory([]);
    }
  };

  // Export CSV
  const exportStudentsCSV = () => {
    if (students.length === 0) {
      toast({ title: "Export Warning", description: "No student records to export.", variant: "destructive" });
      return;
    }

    const headers = ["Student ID", "Full Name", "Class Grade", "Section", "Gender", "Contact Number"];
    const rows = filteredStudents.map(s => [
      `"${s.id}"`,
      `"${s.Name.replace(/"/g, '""')}"`,
      `"${s.Class || ''}"`,
      `"${s.Section || 'A'}"`,
      `"${s.Gender || ''}"`,
      `"${s.Contact || ''}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PIISS_Student_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Directory Exported", description: `Downloaded CSV directory with ${filteredStudents.length} students.` });
  };

  const PageSkeleton = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <GraduationCap className="w-4 h-4" /> Academic Student Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-foreground">
            Student Roster & Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage enrolled students, academic grades, profiles, roll numbers, and contact links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStudents}
            disabled={refreshing}
            className="rounded-xl h-9 text-xs gap-1.5 border-border/80 bg-background hover:bg-muted font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Directory</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportStudentsCSV}
            className="rounded-xl h-9 text-xs gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 font-semibold"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </Button>

          <BulkImportDialog />
          <AddStudentDialog />
        </div>
      </div>

      {/* AI Directory Intelligence Banner */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900/10 to-teal-950/20 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI Directory Intelligence</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                  {activeClassesCount} Active Grades
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-1">
                Currently managing <strong className="text-foreground">{totalCount} enrolled students</strong> across <strong className="text-emerald-600 dark:text-emerald-400">{activeClassesCount} grade levels</strong>. 
                Gender distribution: <strong className="text-sky-600 dark:text-sky-400">{maleCount} Male</strong> & <strong className="text-emerald-600 dark:text-emerald-400">{femaleCount} Female</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <div className="bg-background/80 border border-border/60 p-1 rounded-xl flex items-center gap-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-7 text-xs gap-1.5 rounded-lg px-2.5 font-medium"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" /> Grid View
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-7 text-xs gap-1.5 rounded-lg px-2.5 font-medium"
              >
                <ListFilter className="w-3.5 h-3.5" /> Table View
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
            {/* Total Enrolled Students */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-blue-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Enrolled Students <span className="opacity-40">/ All time</span></span>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-foreground">{totalCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Active enrolled profiles</div>
                  </div>
                  <MiniSparklineChart data={totalTrend} color="#3b82f6" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-blue-500 font-semibold">100% Verified</span>
                <span>Active Portal</span>
              </div>
            </Card>

            {/* Active Academic Classes */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-indigo-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Active Grades <span className="opacity-40">/ Total Classes</span></span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-foreground">{activeClassesCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Grade sections configured</div>
                  </div>
                  <MiniSparklineChart data={classTrend} color="#6366f1" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-indigo-500 font-semibold">Class Roster</span>
                <span>Structured</span>
              </div>
            </Card>

            {/* Male Students */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-sky-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Male Students <span className="opacity-40">/ Boys</span></span>
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-foreground">{maleCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Enrolled male students</div>
                  </div>
                  <MiniSparklineChart data={maleTrend} color="#0284c7" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-sky-500 font-semibold">{totalCount > 0 ? Math.round((maleCount/totalCount)*100) : 0}% Ratio</span>
                <span>Active</span>
              </div>
            </Card>

            {/* Female Students */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-emerald-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Female Students <span className="opacity-40">/ Girls</span></span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-foreground">{femaleCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Enrolled female students</div>
                  </div>
                  <MiniSparklineChart data={femaleTrend} color="#10b981" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-emerald-500 font-semibold">{totalCount > 0 ? Math.round((femaleCount/totalCount)*100) : 0}% Ratio</span>
                <span>Active</span>
              </div>
            </Card>
          </div>

          {/* Unified Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/60 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input 
                type="search"
                placeholder="Search student name, roll ID, class, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-xl bg-background border-border/70 text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-40 text-xs h-9 rounded-xl border-border/70 bg-background">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Class Grades</SelectItem>
                  {classList.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-xs text-muted-foreground font-semibold px-2">
                Showing <span className="text-foreground font-extrabold">{filteredStudents.length}</span> of {students.length}
              </div>
            </div>
          </div>

          {/* MAIN WORKSPACE CONTENT: GRID VS TABLE */}
          {viewMode === 'grid' ? (
            /* GRID VIEW */
            students.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredStudents.map((student) => (
                  <div key={student.id} onClick={() => handleInspectStudent(student)} className="cursor-pointer">
                    <StudentCard student={student} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border border-dashed p-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <GraduationCap className="h-10 w-10 text-muted-foreground opacity-40" />
                  <h3 className="text-base font-bold text-foreground">No Students Enrolled Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Click &apos;Add Student&apos; or &apos;CSV Import&apos; above to create student records in the school directory.
                  </p>
                </div>
              </Card>
            )
          ) : (
            /* HIGH DENSITY TABLE VIEW */
            <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="p-4 pb-3 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-emerald-600" /> Student Directory Table
                  </CardTitle>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{filteredStudents.length} student(s)</span>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/30">
                      <TableHead className="text-xs font-bold">Roll / Student ID</TableHead>
                      <TableHead className="text-xs font-bold">Student Name</TableHead>
                      <TableHead className="text-xs font-bold">Class Grade & Section</TableHead>
                      <TableHead className="text-xs font-bold">Gender</TableHead>
                      <TableHead className="text-xs font-bold">Parent Contact</TableHead>
                      <TableHead className="text-xs font-bold">Address</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs">
                          No student records match your search query.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => {
                        const initials = student.Name
                          ? student.Name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                          : 'ST';
                        return (
                          <TableRow 
                            key={student.id} 
                            onClick={() => handleInspectStudent(student)}
                            className="hover:bg-muted/50 cursor-pointer transition-colors group"
                          >
                            <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              #{student.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-8 w-8 rounded-lg border border-border/60">
                                  <AvatarImage src={student.profilePicture || undefined} alt={student.Name} />
                                  <AvatarFallback className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-xs text-foreground group-hover:text-emerald-600 transition-colors">
                                  {student.Name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[11px] font-semibold bg-muted/40">
                                {student.Class || 'N/A'} ({student.Section || 'A'})
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs capitalize font-medium text-muted-foreground">
                              {student.Gender || 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs font-mono font-medium">
                              {student.Contact || 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-muted-foreground truncate max-w-[140px]">
                              {student.Address || 'Swat, KP'}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold">
                                Enrolled
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleInspectStudent(student)}
                                className="h-8 w-8 p-0 hover:bg-muted rounded-lg"
                                title="Inspect Student Profile"
                              >
                                <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SMART SLIDE-OVER INSPECT DRAWER
          ═══════════════════════════════════════════════════════════════ */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto flex flex-col justify-between">
          {inspectedStudent && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 bg-gradient-to-b from-emerald-950/20 to-transparent border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    ID #{inspectedStudent.id}
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Enrolled Active
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-2xl border-2 border-emerald-500/30 shadow-md">
                    <AvatarImage src={inspectedStudent.profilePicture || undefined} alt={inspectedStudent.Name} />
                    <AvatarFallback className="bg-emerald-600 text-white font-black text-lg rounded-2xl">
                      {inspectedStudent.Name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">{inspectedStudent.Name}</h3>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Class {inspectedStudent.Class || 'N/A'} ({inspectedStudent.Section || 'A'})
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize mt-0.5">Gender: {inspectedStudent.Gender || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Body Info */}
              <div className="p-6 space-y-5 flex-1">
                {/* Guardian Contact Info */}
                <div className="bg-muted/40 rounded-2xl p-4 border border-border/60 space-y-3 text-xs">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Complete Student Profile Details
                  </h4>
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Contact Phone:</span>
                      {inspectedStudent.Contact ? (
                        <a 
                          href={`https://wa.me/${inspectedStudent.Contact.replace(/[^\d]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> {inspectedStudent.Contact}
                        </a>
                      ) : (
                        <span className="font-semibold text-foreground">N/A</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Home Address:</span>
                      <span className="font-semibold text-foreground">{inspectedStudent.Address || 'Swat, KP'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Date Enrolled:</span>
                      <span className="font-semibold text-foreground font-mono">
                        {inspectedStudent.Date_Added ? new Date(inspectedStudent.Date_Added).toLocaleDateString() : 'Active Student'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Student Fee Vouchers History */}
                <div className="bg-muted/40 rounded-2xl p-4 border border-border/60 space-y-3 text-xs">
                  <h4 className="font-bold text-foreground flex items-center justify-between uppercase tracking-wider text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-emerald-600" /> Recent Fee Vouchers
                    </span>
                    <span className="text-[10px] text-muted-foreground">{studentFeesHistory.length} record(s)</span>
                  </h4>

                  {studentFeesHistory.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic">No fee records found for this student.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {studentFeesHistory.map((fee) => (
                        <div key={fee.id} className="flex justify-between items-center bg-background p-2.5 rounded-xl border border-border/50 text-[11px]">
                          <div>
                            <p className="font-bold text-foreground font-mono">{fee.challan_number}</p>
                            <p className="text-[10px] text-muted-foreground">{fee.month_year}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">Rs. {Number(fee.total_amount).toLocaleString()}</p>
                            <Badge className={`text-[9px] font-bold px-1.5 py-0 rounded-full ${
                              fee.status === 'paid' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                              fee.status === 'overdue' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400' :
                              'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            }`}>
                              {fee.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-border/50 bg-muted/20 space-y-2">
                <Button
                  onClick={() => { setDrawerOpen(false); setEditOpen(true); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-xl text-xs h-10 shadow-md"
                >
                  <Edit className="w-4 h-4" /> Edit Student Details
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Student Dialog */}
      {inspectedStudent && isEditOpen && (
        <EditStudentDialog student={inspectedStudent} isOpen={isEditOpen} onOpenChange={setEditOpen} />
      )}
    </div>
  );
}
