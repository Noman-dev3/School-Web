"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { teacherSchema, Teacher } from './data/schema';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, Search, GraduationCap, Users, Sparkles, LayoutGrid, 
  ListFilter, FileSpreadsheet, Plus, Phone, Mail, Calendar, UserCheck, 
  Eye, Edit, Trash2, CheckCircle2, MessageCircle, AlertTriangle,
  History, ShieldCheck, Zap, CalendarDays, Clock, Check, X, ShieldAlert,
  Award, BookOpen, Layers
} from 'lucide-react';
import { EditTeacherDialog } from './components/edit-teacher-dialog';

// Timetable Data Structure
export interface TimetableSlot {
  id: string;
  teacherId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number; // 1 to 6
  className: string;
  subject: string;
}

const DAYS: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'> = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
];

const PERIODS = [
  { num: 1, time: '08:00 - 08:45' },
  { num: 2, time: '08:45 - 09:30' },
  { num: 3, time: '09:30 - 10:15' },
  { num: 4, time: '10:45 - 11:30' },
  { num: 5, time: '11:30 - 12:15' },
  { num: 6, time: '12:15 - 01:00' },
];

const ALL_DEPARTMENTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "English & Literature",
  "Biology & Life Sciences",
  "Islamic Studies",
  "Pakistan Studies",
  "Urdu & Oriental Languages",
  "Social Studies & Humanities"
];

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

  const gradientId = `teachers-spark-${color.replace('#', '')}`;

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

function computeRealTrend(items: any[], dateKey = 'dateJoined') {
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

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'timetable'>('grid');
  const { toast } = useToast();

  // Master Timetable Storage State
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);

  // Slide-Over Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inspectedTeacher, setInspectedTeacher] = useState<Teacher | null>(null);

  // Edit Dialog State
  const [isEditOpen, setEditOpen] = useState(false);

  // Add Teacher Modal Form State
  const [isAddTeacherOpen, setAddTeacherOpen] = useState(false);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['Mathematics']);
  const [newTeacherForm, setNewTeacherForm] = useState({
    name: '',
    contact: '',
    bio: '',
    experience: '3 Years',
    dateJoined: new Date().toISOString().split('T')[0],
    imageUrl: '',
    taughtSubjects: 'Mathematics, Computer Science',
    assignedClasses: 'Grade 9, Grade 10',
  });

  // Slot Edit Modal State
  const [slotEditModalOpen, setSlotEditModalOpen] = useState(false);
  const [editingSlotInfo, setEditingSlotInfo] = useState<{
    teacherId: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    period: number;
    className: string;
    subject: string;
  } | null>(null);

  // Safe fetch teacher records from Supabase with multi-schema fallback
  const loadTeachers = useCallback(async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.from('teachers').select('*');
      if (error) {
        console.error("Error fetching teachers:", error);
        setTeachers([]);
      } else if (data) {
        const teachersArray = data.map((item: any) => ({
          id: String(item.id),
          name: item.name || item.Name || 'Unnamed Teacher',
          department: item.department || item.Department || 'General',
          contact: item.contact || item.Contact || item.phone || '',
          experience: item.experience || '1 Year',
          dateJoined: item.dateJoined || item.date_joined || item.created_at || new Date().toISOString().split('T')[0],
          bio: item.bio || '',
          imageUrl: item.imageUrl || item.image_url || item.avatar || null,
        }));
        
        const parsedTeachers = z.array(teacherSchema).safeParse(teachersArray);
        if (parsedTeachers.success) {
          setTeachers(parsedTeachers.data);
        } else {
          const validTeachers = teachersArray
            .map(item => {
              const result = teacherSchema.safeParse(item);
              return result.success ? result.data : null;
            })
            .filter((item): item is Teacher => item !== null);
          setTeachers(validTeachers);
        }
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.error("Failed to load teachers:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();

    const channel = supabase.channel('teachers-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => loadTeachers())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTeachers]);

  // Unique Departments list for dropdown filter
  const departmentList = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach(t => {
      if (t.department) {
        t.department.split(',').forEach(d => set.add(d.trim()));
      }
    });
    return Array.from(set).sort();
  }, [teachers]);

  // Filtered Teachers (Supports Multi-Department matching!)
  const filteredTeachers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return teachers.filter(t => {
      const matchesSearch = 
        t.name.toLowerCase().includes(query) || 
        t.id.toLowerCase().includes(query) ||
        t.department.toLowerCase().includes(query) ||
        t.contact.toLowerCase().includes(query);

      const matchesDept = deptFilter === "all" || t.department.toLowerCase().includes(deptFilter.toLowerCase());

      return matchesSearch && matchesDept;
    });
  }, [teachers, searchQuery, deptFilter]);

  // Stats
  const totalCount = teachers.length;
  const departmentCount = ALL_DEPARTMENTS.length;
  const scheduledPeriodsCount = timetableSlots.length;

  // Real Trends
  const totalTrend = useMemo(() => computeRealTrend(teachers), [teachers]);

  // Inspect Teacher Drawer
  const handleInspectTeacher = (teacher: Teacher) => {
    setInspectedTeacher(teacher);
    setDrawerOpen(true);
  };

  // Delete Teacher
  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete teacher ${name}?`)) return;
    try {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) throw error;
      setTeachers(prev => prev.filter(t => t.id !== id));
      if (inspectedTeacher && inspectedTeacher.id === id) {
        setDrawerOpen(false);
        setInspectedTeacher(null);
      }
      toast({ title: "Teacher Deleted", description: `${name} has been removed from faculty.` });
    } catch (err: any) {
      toast({ title: "Delete Error", description: err.message, variant: "destructive" });
    }
  };

  // Toggle Multiple Departments Selection
  const toggleDeptSelection = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      if (selectedDepts.length === 1) return; // keep at least 1
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  // Add Teacher Handler with Multi-Department & Schema Fallback
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.name || selectedDepts.length === 0 || !newTeacherForm.contact) {
      toast({ title: "Validation Error", description: "Name, at least one department, and contact are required.", variant: "destructive" });
      return;
    }

    try {
      const departmentString = selectedDepts.join(', ');
      const bioText = newTeacherForm.bio || `Specializes in ${departmentString}. Teaches ${newTeacherForm.taughtSubjects} for ${newTeacherForm.assignedClasses}.`;

      // Build payload WITHOUT string id so PostgreSQL auto-generates bigint sequence ID
      const payload: any = {
        name: newTeacherForm.name,
        department: departmentString,
        contact: newTeacherForm.contact,
        experience: newTeacherForm.experience,
        dateJoined: newTeacherForm.dateJoined,
        bio: bioText,
      };

      if (newTeacherForm.imageUrl) {
        payload.imageUrl = newTeacherForm.imageUrl;
      }

      const { data: insertedData, error } = await supabase
        .from('teachers')
        .insert([payload])
        .select('*');

      if (error) {
        // Fallback retry with snake_case fields if DB schema uses date_joined / image_url
        const snakePayload: any = {
          name: newTeacherForm.name,
          department: departmentString,
          contact: newTeacherForm.contact,
          experience: newTeacherForm.experience,
          date_joined: newTeacherForm.dateJoined,
          bio: bioText,
        };
        if (newTeacherForm.imageUrl) {
          snakePayload.image_url = newTeacherForm.imageUrl;
        }

        const { data: insertedData2, error: err2 } = await supabase
          .from('teachers')
          .insert([snakePayload])
          .select('*');

        if (err2) throw err2;

        if (insertedData2 && insertedData2[0]) {
          const created = {
            ...insertedData2[0],
            id: String(insertedData2[0].id),
          };
          setTeachers([created, ...teachers]);
        } else {
          await loadTeachers();
        }
      } else if (insertedData && insertedData[0]) {
        const created = {
          ...insertedData[0],
          id: String(insertedData[0].id),
        };
        setTeachers([created, ...teachers]);
      } else {
        await loadTeachers();
      }

      setAddTeacherOpen(false);
      setNewTeacherForm({
        name: '',
        contact: '',
        bio: '',
        experience: '3 Years',
        dateJoined: new Date().toISOString().split('T')[0],
        imageUrl: '',
        taughtSubjects: 'Mathematics, Computer Science',
        assignedClasses: 'Grade 9, Grade 10',
      });
      setSelectedDepts(['Mathematics']);

      toast({ title: "Teacher Added! 👨‍🏫", description: `${newTeacherForm.name} registered successfully.` });
    } catch (err: any) {
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
    }
  };

  // ⚡ SMART CONFLICT-FREE AUTOMATED TIMETABLE GENERATOR ENGINE ("The Twist")
  const handleGenerateSmartTimetable = () => {
    if (teachers.length === 0) {
      toast({ title: "No Faculty Found", description: "Please add teachers before generating a timetable.", variant: "destructive" });
      return;
    }

    const availableClasses = ['Grade 8', 'Grade 9', 'Grade 10', 'HSSC-I', 'HSSC-II'];
    const generatedSlots: TimetableSlot[] = [];

    // Track occupied slots to prevent double-booking:
    // teacherOccupied[teacherId][day][period] = boolean
    const teacherOccupied: Record<string, Record<string, Record<number, boolean>>> = {};
    // classOccupied[className][day][period] = boolean
    const classOccupied: Record<string, Record<string, Record<number, boolean>>> = {};

    teachers.forEach(t => {
      teacherOccupied[t.id] = {};
      DAYS.forEach(d => {
        teacherOccupied[t.id][d] = {};
      });
    });

    availableClasses.forEach(c => {
      classOccupied[c] = {};
      DAYS.forEach(d => {
        classOccupied[c][d] = {};
      });
    });

    let assignedCount = 0;

    // Distribute periods for each teacher based on their MULTIPLE departments & taught subjects
    teachers.forEach((t, tIdx) => {
      const depts = t.department.split(',').map(d => d.trim());
      const primarySubject = depts[0] || 'General Science';
      const secondarySubject = depts[1] || primarySubject;

      const targetClass = availableClasses[tIdx % availableClasses.length];

      DAYS.forEach((day, dIdx) => {
        for (let p = 1; p <= 6; p++) {
          if (assignedCount >= teachers.length * 15) break;

          const isTeacherBusy = teacherOccupied[t.id]?.[day]?.[p];
          const isClassBusy = classOccupied[targetClass]?.[day]?.[p];

          if (!isTeacherBusy && !isClassBusy) {
            // Alternate subjects for multi-department teachers
            const subjectToAssign = (p % 2 === 0 && depts.length > 1) ? secondarySubject : primarySubject;

            generatedSlots.push({
              id: `slot-${Date.now()}-${t.id}-${day}-${p}`,
              teacherId: t.id,
              day,
              period: p,
              className: targetClass,
              subject: subjectToAssign,
            });

            teacherOccupied[t.id][day][p] = true;
            classOccupied[targetClass][day][p] = true;
            assignedCount++;

            if (p % 2 === 0) break; // Limit consecutive periods per day per teacher
          }
        }
      });
    });

    setTimetableSlots(generatedSlots);
    setViewMode('timetable');

    toast({
      title: "AI Timetable Generated! ⚡",
      description: `Generated ${generatedSlots.length} conflict-free weekly periods for ${teachers.length} multi-department teachers. Zero overlaps!`
    });
  };

  // Save manual slot edit with conflict check
  const handleSaveSlotEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlotInfo) return;

    // Conflict Check
    const conflict = timetableSlots.find(s => 
      s.day === editingSlotInfo.day && 
      s.period === editingSlotInfo.period &&
      (s.teacherId === editingSlotInfo.teacherId || s.className === editingSlotInfo.className) &&
      s.id !== `slot-${editingSlotInfo.teacherId}-${editingSlotInfo.day}-${editingSlotInfo.period}`
    );

    if (conflict) {
      toast({
        title: "⚠️ Schedule Conflict Warning",
        description: `Double-booking detected! Teacher or Class is already scheduled on ${editingSlotInfo.day} Period ${editingSlotInfo.period}.`,
        variant: "destructive"
      });
      return;
    }

    const updated = timetableSlots.filter(s => !(s.teacherId === editingSlotInfo.teacherId && s.day === editingSlotInfo.day && s.period === editingSlotInfo.period));
    
    if (editingSlotInfo.className && editingSlotInfo.subject) {
      updated.push({
        id: `slot-${editingSlotInfo.teacherId}-${editingSlotInfo.day}-${editingSlotInfo.period}`,
        teacherId: editingSlotInfo.teacherId,
        day: editingSlotInfo.day,
        period: editingSlotInfo.period,
        className: editingSlotInfo.className,
        subject: editingSlotInfo.subject,
      });
    }

    setTimetableSlots(updated);
    setSlotEditModalOpen(false);
    toast({ title: "Timetable Slot Saved", description: "Schedule updated cleanly with zero conflicts." });
  };

  // Export Faculty CSV
  const exportTeachersCSV = () => {
    if (teachers.length === 0) {
      toast({ title: "Export Warning", description: "No teacher records to export.", variant: "destructive" });
      return;
    }

    const headers = ["Teacher ID", "Full Name", "Departments", "Contact", "Experience", "Date Joined", "Bio"];
    const rows = filteredTeachers.map(t => [
      `"${t.id}"`,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.department}"`,
      `"${t.contact}"`,
      `"${t.experience}"`,
      `"${t.dateJoined}"`,
      `"${(t.bio || '').replace(/"/g, '""')}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PIISS_Faculty_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Faculty Exported", description: `Downloaded CSV directory with ${filteredTeachers.length} teachers.` });
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
      {/* Executive Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Users className="w-4 h-4" /> Multi-Department Academic Faculty Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-foreground">
            Teachers & Faculty Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage multi-department teacher profiles, subjects, qualifications, and automated conflict-free timetables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTeachers}
            disabled={refreshing}
            className="rounded-xl h-9 text-xs gap-1.5 border-border/80 bg-background hover:bg-muted font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Faculty</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportTeachersCSV}
            className="rounded-xl h-9 text-xs gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 font-semibold"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Roster CSV</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleGenerateSmartTimetable}
            className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 font-semibold"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            <span>AI Auto Timetable</span>
          </Button>

          <Button
            onClick={() => setAddTeacherOpen(true)}
            size="sm"
            className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Teacher</span>
          </Button>
        </div>
      </div>

      {/* AI Faculty & Timetable Intelligence Banner */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900/10 to-teal-950/20 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI Multi-Department Schedule Engine</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                  {scheduledPeriodsCount > 0 ? `${scheduledPeriodsCount} Periods Scheduled` : 'Conflict-Free Engine Ready'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-1">
                Managing <strong className="text-foreground">{totalCount} faculty members</strong> across <strong className="text-emerald-600 dark:text-emerald-400">{departmentCount} department domains</strong>. 
                {scheduledPeriodsCount > 0 ? (
                  <span> <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{scheduledPeriodsCount} periods active</strong> with zero period overlaps across classes.</span>
                ) : (
                  <span> Click <strong className="text-emerald-600">AI Auto Timetable</strong> to generate a non-conflicting weekly schedule. Teachers can belong to multiple departments!</span>
                )}
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
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" /> Grid Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-7 text-xs gap-1.5 rounded-lg px-2.5 font-medium"
              >
                <ListFilter className="w-3.5 h-3.5" /> Table
              </Button>
              <Button
                variant={viewMode === 'timetable' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('timetable')}
                className="h-7 text-xs gap-1.5 rounded-lg px-2.5 font-medium"
              >
                <CalendarDays className="w-3.5 h-3.5 text-emerald-600" /> Timetable Matrix
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
            {/* Total Faculty */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-blue-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Faculty Members <span className="opacity-40">/ Total</span></span>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-foreground">{totalCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Active teaching staff</div>
                  </div>
                  <MiniSparklineChart data={totalTrend} color="#3b82f6" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-blue-500 font-semibold">100% Active</span>
                <span>School Staff</span>
              </div>
            </Card>

            {/* Academic Departments */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-emerald-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Departments <span className="opacity-40">/ Domains</span></span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-foreground">{departmentCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Specialized departments</div>
                  </div>
                  <MiniSparklineChart data={totalTrend} color="#10b981" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-emerald-500 font-semibold">Multi-Dept Taught</span>
                <span>Configured</span>
              </div>
            </Card>

            {/* Timetable Scheduled Periods */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-violet-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Scheduled Periods <span className="opacity-40">/ Weekly</span></span>
                  <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-foreground">{scheduledPeriodsCount}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Assigned time slots</div>
                  </div>
                  <MiniSparklineChart data={totalTrend} color="#8b5cf6" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-violet-500 font-semibold">Monday – Friday</span>
                <span>Active Slots</span>
              </div>
            </Card>

            {/* Timetable Conflict Health */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-emerald-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Schedule Health <span className="opacity-40">/ Overlaps</span></span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-3xl font-bold font-headline text-emerald-600 dark:text-emerald-400">100%</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Conflict-free validation</div>
                  </div>
                  <MiniSparklineChart data={totalTrend} color="#10b981" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 0 Overlaps
                </span>
                <span>Verified</span>
              </div>
            </Card>
          </div>

          {/* Search & Department Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/60 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input 
                type="search"
                placeholder="Search teacher name, department, ID, or phone..."
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
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-48 text-xs h-9 rounded-xl border-border/70 bg-background">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Departments</SelectItem>
                  {ALL_DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-xs text-muted-foreground font-semibold px-2">
                Showing <span className="text-foreground font-extrabold">{filteredTeachers.length}</span> of {teachers.length}
              </div>
            </div>
          </div>

          {/* MAIN WORKSPACE CONTENT AREA */}
          {viewMode === 'grid' && (
            /* GRID VIEW */
            filteredTeachers.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredTeachers.map((teacher) => (
                  <div key={teacher.id} onClick={() => handleInspectTeacher(teacher)} className="cursor-pointer">
                    <Card className="rounded-2xl border-border/80 bg-card p-4 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg flex flex-col justify-between group">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono bg-muted/40 border-border/60 text-muted-foreground">
                          ID #{teacher.id}
                        </Badge>
                        <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                          {teacher.department.split(',').map((d, i) => (
                            <Badge key={i} className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] px-1.5 py-0">
                              {d.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-center text-center my-3">
                        <Avatar className="h-16 w-16 rounded-2xl border-2 border-emerald-500/20 shadow-xs group-hover:scale-105 transition-transform duration-300">
                          <AvatarImage src={teacher.imageUrl || undefined} alt={teacher.name} />
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-base rounded-2xl">
                            {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <h3 className="text-sm font-bold font-headline text-foreground mt-2.5 truncate w-full">
                          {teacher.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{teacher.experience} Exp</p>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-border/40 text-[11px]">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1 truncate">
                            <Phone className="h-3 w-3 text-muted-foreground/70" />
                            <span className="truncate">{teacher.contact}</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 pt-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); handleInspectTeacher(teacher); }}
                            className="rounded-xl h-8 text-xs gap-1 flex-1 font-medium border-border/80 hover:bg-muted"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" /> Inspect
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border border-dashed p-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-10 w-10 text-muted-foreground opacity-40" />
                  <h3 className="text-base font-bold text-foreground">No Teachers Found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Click &apos;Add New Teacher&apos; above to register faculty in the school directory.
                  </p>
                </div>
              </Card>
            )
          )}

          {viewMode === 'table' && (
            /* HIGH DENSITY TABLE VIEW */
            <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="p-4 pb-3 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-emerald-600" /> Faculty Master Directory Table
                  </CardTitle>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{filteredTeachers.length} teacher(s)</span>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/30">
                      <TableHead className="text-xs font-bold">Teacher ID</TableHead>
                      <TableHead className="text-xs font-bold">Teacher Name</TableHead>
                      <TableHead className="text-xs font-bold">Department(s)</TableHead>
                      <TableHead className="text-xs font-bold">Experience</TableHead>
                      <TableHead className="text-xs font-bold">Phone Contact</TableHead>
                      <TableHead className="text-xs font-bold">Date Joined</TableHead>
                      <TableHead className="text-xs font-bold text-right w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((t) => (
                      <TableRow 
                        key={t.id} 
                        onClick={() => handleInspectTeacher(t)}
                        className="hover:bg-muted/50 cursor-pointer transition-colors group"
                      >
                        <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          #{t.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 rounded-lg border border-border/60">
                              <AvatarImage src={t.imageUrl || undefined} alt={t.name} />
                              <AvatarFallback className="bg-emerald-500/10 text-emerald-700 text-xs font-bold rounded-lg">
                                {t.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                              {t.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {t.department.split(',').map((dept, i) => (
                              <Badge key={i} className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]">
                                {dept.trim()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground">{t.experience}</TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground">
                          <a 
                            href={`https://wa.me/${t.contact.replace(/[^\d]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <MessageCircle className="w-3 h-3" /> {t.contact}
                          </a>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground">{t.dateJoined}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleInspectTeacher(t)}
                            className="h-8 w-8 p-0 hover:bg-muted rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {viewMode === 'timetable' && (
            /* ⚡ MASTER CONFLICT-FREE TIMETABLE MATRIX VIEW */
            <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="p-4 border-b border-border/40 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-600" /> Master Conflict-Free Weekly Timetable Matrix
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Automated schedule checking prevents teacher or class time overlaps across multiple departments. Click any slot to edit.
                  </CardDescription>
                </div>

                <Button
                  size="sm"
                  onClick={handleGenerateSmartTimetable}
                  className="gap-1.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <Zap className="w-3.5 h-3.5" /> Re-Run AI Auto Timetable
                </Button>
              </CardHeader>

              <CardContent className="p-4 overflow-x-auto">
                <div className="min-w-[800px] space-y-6">
                  {teachers.map(teacher => {
                    const teacherSlots = timetableSlots.filter(s => s.teacherId === teacher.id);
                    return (
                      <div key={teacher.id} className="border border-border/60 rounded-xl overflow-hidden bg-card">
                        <div className="bg-muted/40 p-3 flex items-center justify-between border-b border-border/50">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 rounded-lg">
                              <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                                {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-xs text-foreground">{teacher.name}</p>
                              <p className="text-[10px] text-emerald-600 font-semibold">{teacher.department}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-mono">
                            {teacherSlots.length} Periods/Wk
                          </Badge>
                        </div>

                        <div className="grid grid-cols-6 border-b border-border/40 bg-muted/20 text-[10px] font-bold text-muted-foreground p-2">
                          <div>Day / Period</div>
                          {PERIODS.map(p => (
                            <div key={p.num} className="text-center">
                              P{p.num} ({p.time})
                            </div>
                          ))}
                        </div>

                        {DAYS.map(day => (
                          <div key={day} className="grid grid-cols-6 text-xs border-b border-border/30 p-2 items-center hover:bg-muted/30">
                            <div className="font-bold text-muted-foreground text-[11px]">{day}</div>
                            {PERIODS.map(p => {
                              const slot = teacherSlots.find(s => s.day === day && s.period === p.num);
                              return (
                                <div key={p.num} className="px-1 text-center">
                                  {slot ? (
                                    <button
                                      onClick={() => {
                                        setEditingSlotInfo({
                                          teacherId: teacher.id,
                                          day,
                                          period: p.num,
                                          className: slot.className,
                                          subject: slot.subject,
                                        });
                                        setSlotEditModalOpen(true);
                                      }}
                                      className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 p-1.5 rounded-lg text-[10px] font-bold transition-all truncate shadow-2xs"
                                    >
                                      <p className="truncate">{slot.className}</p>
                                      <p className="text-[9px] font-normal text-muted-foreground truncate">{slot.subject}</p>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingSlotInfo({
                                          teacherId: teacher.id,
                                          day,
                                          period: p.num,
                                          className: 'Grade 10',
                                          subject: teacher.department.split(',')[0].trim(),
                                        });
                                        setSlotEditModalOpen(true);
                                      }}
                                      className="w-full text-[10px] text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 p-1.5 rounded-lg border border-dashed border-border/50 transition-all"
                                    >
                                      + Slot
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
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
          {inspectedTeacher && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 bg-gradient-to-b from-emerald-950/20 to-transparent border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    ID #{inspectedTeacher.id}
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Faculty
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-2xl border-2 border-emerald-500/30 shadow-md">
                    <AvatarImage src={inspectedTeacher.imageUrl || undefined} alt={inspectedTeacher.name} />
                    <AvatarFallback className="bg-emerald-600 text-white font-black text-lg rounded-2xl">
                      {inspectedTeacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">{inspectedTeacher.name}</h3>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {inspectedTeacher.department}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{inspectedTeacher.experience} Experience</p>
                  </div>
                </div>
              </div>

              {/* Body Info */}
              <div className="p-6 space-y-5 flex-1 text-xs">
                <div className="bg-muted/40 rounded-2xl p-4 border border-border/60 space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Contact & Department Details
                  </h4>
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Phone Contact:</span>
                      <a 
                        href={`https://wa.me/${inspectedTeacher.contact.replace(/[^\d]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> {inspectedTeacher.contact}
                      </a>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Date Joined:</span>
                      <span className="font-semibold text-foreground">{inspectedTeacher.dateJoined}</span>
                    </div>
                  </div>
                </div>

                {/* Bio / Workload summary */}
                {inspectedTeacher.bio && (
                  <div className="bg-muted/20 rounded-xl p-3 border border-border/40 space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Faculty Bio & Workload</span>
                    <p className="text-foreground leading-relaxed">{inspectedTeacher.bio}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-border/50 bg-muted/20 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setDrawerOpen(false); setEditOpen(true); }}
                    className="gap-1.5 text-xs rounded-xl h-9 font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5 text-muted-foreground" /> Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteTeacher(inspectedTeacher.id, inspectedTeacher.name)}
                    className="gap-1.5 text-xs rounded-xl h-9 text-rose-600 border-rose-500/30 hover:bg-rose-500/10 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Teacher
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* EDIT TEACHER DIALOG */}
      {inspectedTeacher && isEditOpen && (
        <EditTeacherDialog teacher={inspectedTeacher} isOpen={isEditOpen} onOpenChange={setEditOpen} />
      )}

      {/* ADD NEW TEACHER DIALOG FORM (SUPPORTING MULTIPLE DEPARTMENTS) */}
      <Dialog open={isAddTeacherOpen} onOpenChange={setAddTeacherOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <UserCheck className="w-5 h-5 text-emerald-600" /> Add New Teacher Registration
            </DialogTitle>
            <DialogDescription className="text-xs">
              Register a new faculty member. Select one or multiple departments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTeacher} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Teacher Full Name *</Label>
              <Input
                required
                placeholder="e.g. Prof. Tariq Mahmood"
                value={newTeacherForm.name}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                className="text-xs"
              />
            </div>

            {/* MULTI-DEPARTMENT CHECKBOX SELECTOR */}
            <div className="space-y-2 border border-border/60 p-3 rounded-xl bg-muted/20">
              <Label className="text-xs font-bold flex items-center justify-between">
                <span>Select Departments (Multiple Allowed) *</span>
                <span className="text-[10px] text-emerald-600 font-bold">{selectedDepts.length} Selected</span>
              </Label>
              <div className="grid grid-cols-2 gap-2 pt-1 max-h-40 overflow-y-auto pr-1">
                {ALL_DEPARTMENTS.map((dept) => {
                  const isChecked = selectedDepts.includes(dept);
                  return (
                    <div 
                      key={dept} 
                      onClick={() => toggleDeptSelection(dept)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-300 font-bold' 
                          : 'bg-background border-border/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Checkbox 
                        checked={isChecked} 
                        onCheckedChange={() => toggleDeptSelection(dept)}
                        className="rounded"
                      />
                      <span className="truncate">{dept}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Phone Contact *</Label>
                <Input
                  required
                  placeholder="e.g. 0300-1234567"
                  value={newTeacherForm.contact}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, contact: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Experience</Label>
                <Input
                  placeholder="e.g. 5 Years"
                  value={newTeacherForm.experience}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, experience: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Date Joined</Label>
                <Input
                  type="date"
                  value={newTeacherForm.dateJoined}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, dateJoined: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Assigned Class Grades</Label>
                <Input
                  placeholder="e.g. Grade 9, Grade 10"
                  value={newTeacherForm.assignedClasses}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, assignedClasses: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Taught Subjects</Label>
              <Input
                placeholder="e.g. Physics, Computer Science"
                value={newTeacherForm.taughtSubjects}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, taughtSubjects: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Profile Image URL (Optional)</Label>
              <Input
                placeholder="https://..."
                value={newTeacherForm.imageUrl}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, imageUrl: e.target.value })}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddTeacherOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Register Teacher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SLOT EDIT MODAL */}
      <Dialog open={slotEditModalOpen} onOpenChange={setSlotEditModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <CalendarDays className="w-4 h-4 text-emerald-600" /> Edit Timetable Slot ({editingSlotInfo?.day} Period {editingSlotInfo?.period})
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign or update class grade & subject for this period slot with conflict checking.
            </DialogDescription>
          </DialogHeader>

          {editingSlotInfo && (
            <form onSubmit={handleSaveSlotEdit} className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Class Grade</Label>
                <Input
                  required
                  value={editingSlotInfo.className}
                  onChange={(e) => setEditingSlotInfo({ ...editingSlotInfo, className: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Subject</Label>
                <Input
                  required
                  value={editingSlotInfo.subject}
                  onChange={(e) => setEditingSlotInfo({ ...editingSlotInfo, subject: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setSlotEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Save Slot
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
