"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { Student, studentSchema } from '../students/data/schema';
import { FeeRecord, FeeStructure, Result } from '../data-schemas';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UnifiedStudentDrawer } from './components/unified-student-drawer';
import { 
  Search, ListFilter, Users, Sparkles, RefreshCw, Eye, GraduationCap, Calculator, FileSpreadsheet, Settings2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BulkImportDialog } from '../students/components/bulk-import-dialog';
import { BatchFeeModal } from './components/batch-fee-modal';
import { ClassTariffsModal } from './components/class-tariffs-modal';
import { DataWipeDialog } from './components/data-wipe-dialog';
import { ManagementFeeChart } from './components/management-fee-chart';
import { ManagementStudentStats } from './components/management-student-stats';

export default function ManagementDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isTariffsModalOpen, setIsTariffsModalOpen] = useState(false);

  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      const { data: studentsData } = await supabase.from('students').select('*');
      if (studentsData) {
        const parsedStudents = studentsData.map((item: any) => ({
          ...item,
          id: String(item.id),
        }));
        const validStudents = parsedStudents.map(item => studentSchema.safeParse(item)).map(r => r.success ? r.data : null).filter(Boolean) as Student[];
        setStudents(validStudents);
      }

      const { data: feesData } = await supabase.from('fees').select('*').order('created_at', { ascending: false });
      if (feesData) setFeeRecords(feesData as FeeRecord[]);

      const { data: tariffData } = await supabase.from('fee_structures').select('*');
      if (tariffData) setFeeStructures(tariffData as FeeStructure[]);

      const { data: resultsData } = await supabase.from('results').select('*').order('date_created', { ascending: false });
      if (resultsData) setResults(resultsData as Result[]);

    } catch (err) {
      console.error("Failed to load management data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const classList = useMemo(() => {
    const set = new Set(students.map(s => s.Class).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return students.filter(student => {
      const matchesSearch = 
        student.Name.toLowerCase().includes(query) || 
        student.id.toLowerCase().includes(query) ||
        (student.Class && student.Class.toLowerCase().includes(query));
      const matchesClass = classFilter === "all" || (student.Class && student.Class === classFilter);
      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, classFilter]);

  const getStudentArrears = (studentId: string) => {
    const unpaidRecords = feeRecords.filter(r => String(r.student_id) === String(studentId) && r.status !== 'paid');
    return unpaidRecords.reduce((sum, r) => sum + (Number(r.total_amount || 0) - Number(r.amount_paid || 0)), 0);
  };

  const managementMetrics = useMemo(() => {
    const totalStudentsCount = students.length;
    const totalArrearsAmount = feeRecords
      .filter(r => r.status !== 'paid')
      .reduce((sum, r) => sum + (Number(r.total_amount || 0) - Number(r.amount_paid || 0)), 0);

    const totalBilledAmount = feeRecords.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
    const totalPaidAmount = feeRecords.reduce((sum, r) => sum + Number(r.amount_paid || 0), 0);
    const collectionRate = totalBilledAmount > 0 ? Math.round((totalPaidAmount / totalBilledAmount) * 100) : 100;
    const activeTariffsCount = feeStructures.length;

    return {
      totalStudentsCount,
      totalArrearsAmount,
      totalPaidAmount,
      totalBilledAmount,
      collectionRate,
      activeTariffsCount,
    };
  }, [students, feeRecords, feeStructures]);

  const handleInspectStudent = (student: Student) => {
    setInspectedStudent(student);
    setDrawerOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(i => i !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleBulkIssueChallans = async () => {
    if (selectedStudentIds.length === 0) return;
    setIsBatchModalOpen(true);
  };

  const handleBatchFeeConfirm = async (config: any) => {
    try {
      const targetStudents = students.filter(s => selectedStudentIds.includes(s.id));
      if (targetStudents.length === 0) return;

      const yearStr = new Date().getFullYear();
      const generatedBatch: FeeRecord[] = targetStudents.map((st, idx) => {
        const studentClass = st.Class || "Grade 10";
        const studentName = st.Name || `Student ${st.id}`;
        
        const matchingStruct = feeStructures.find(
          s => s.class_name.toLowerCase() === studentClass.toLowerCase() ||
               s.class_name.toLowerCase().includes(studentClass.toLowerCase()) ||
               studentClass.toLowerCase().includes(s.class_name.toLowerCase())
        );

        const tuitionFee = matchingStruct ? Number(matchingStruct.tuition_fee) : 6000;
        const labFee = matchingStruct ? Number(matchingStruct.lab_fee) : 1000;
        const examFee = matchingStruct ? Number(matchingStruct.exam_fee) : 1500;
        const customFields = matchingStruct?.custom_fields ? [...matchingStruct.custom_fields] : [];

        let autoArrears = 0;
        if (config.autoAddArrears) {
          autoArrears = getStudentArrears(st.id);
        }

        let discount = 0;
        if (config.applySiblingDiscount && matchingStruct && matchingStruct.kinship_enabled !== false) {
          // Simplistic kinship logic for batch: if multiple same contacts, apply discount
          const sameContactStudents = students.filter(s => s.Contact && s.Contact.trim() === st.Contact?.trim());
          if (sameContactStudents.length > 1) {
            sameContactStudents.sort((a, b) => String(a.id).localeCompare(String(b.id)));
            const siblingIndex = sameContactStudents.findIndex(s => String(s.id) === String(st.id));
            if (siblingIndex >= 1) {
              const customRatePercent = Number(matchingStruct.kinship_discount_percent || 25);
              discount = Math.round(tuitionFee * (customRatePercent / 100));
            }
          }
        }

        const totalCustom = customFields.reduce((sum, f) => sum + Number(f.amount || 0), 0);
        const netTotal = Math.max(0, tuitionFee + labFee + examFee + autoArrears + totalCustom - discount);

        return {
          id: `fee-batch-${Date.now()}-${idx}`,
          challan_number: `CHS-${yearStr}-${Math.floor(10000 + Math.random() * 90000)}`,
          student_name: studentName,
          student_id: String(st.id),
          class_name: studentClass,
          section: st.Section || "A",
          month_year: config.month_year,
          tuition_fee: tuitionFee,
          lab_fee: labFee,
          exam_fee: examFee,
          arrears: autoArrears,
          discount: discount,
          custom_fields: customFields,
          total_amount: netTotal,
          amount_paid: 0,
          status: "pending",
          notes: autoArrears > 0 ? `Carried over Rs. ${autoArrears.toLocaleString()} previous arrears` : "1st-of-month fee voucher",
          created_at: new Date().toISOString(),
        } as FeeRecord;
      });

      const { error } = await supabase.from('fees').insert(generatedBatch);
      if (error) throw error;

      setFeeRecords([...generatedBatch, ...feeRecords]);
      setSelectedStudentIds([]);
      toast({
        title: "Batch Issuance Complete! 🎉",
        description: `Issued ${generatedBatch.length} vouchers for ${config.month_year}.`
      });
    } catch (err: any) {
      toast({ title: "Batch Error", description: err.message, variant: "destructive" });
    }
  };

  const PageSkeleton = () => (
    <div className="space-y-6 p-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-[600px] w-full rounded-2xl" />
    </div>
  );

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Settings2 className="w-4 h-4" /> Management Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-foreground">
            Unified Student Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage profiles, fees, arrears, and results all from one unified interface.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={refreshing}
            className="rounded-xl h-9 text-xs gap-1.5 border-border/80 bg-background hover:bg-muted font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTariffsModalOpen(true)}
            className="rounded-xl h-9 text-xs gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 font-semibold"
          >
            <Settings2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Class Tariffs</span>
          </Button>

          <BulkImportDialog />
          <DataWipeDialog onSuccess={loadData} />
        </div>
      </div>

      {/* KPI STATISTICS SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Active Students */}
        <Card className="p-4 bg-card/60 dark:bg-card/40 backdrop-blur-xl border-border/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Total Enrolled</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold font-headline text-foreground mt-2">
              {managementMetrics.totalStudentsCount}
            </div>
          </div>
          <div className="mt-3 text-[10px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>Across <strong className="text-foreground">{classList.length}</strong> classes</span>
            <span className="text-emerald-500 font-bold">Active</span>
          </div>
        </Card>

        {/* Total Outstanding Arrears */}
        <Card className="p-4 bg-card/60 dark:bg-card/40 backdrop-blur-xl border-border/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Pending Arrears</span>
              <Sparkles className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-2">
              Rs. {managementMetrics.totalArrearsAmount.toLocaleString()}
            </div>
          </div>
          <div className="mt-3 text-[10px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>Uncollected vouchers</span>
            <span className="text-rose-500 font-bold">Unpaid</span>
          </div>
        </Card>

        {/* Collection Efficiency Rate */}
        <Card className="p-4 bg-card/60 dark:bg-card/40 backdrop-blur-xl border-border/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Fee Collection Rate</span>
              <Calculator className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold font-headline text-foreground mt-2">
              {managementMetrics.collectionRate}%
            </div>
          </div>
          <div className="mt-3 text-[10px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>Rs. {managementMetrics.totalPaidAmount.toLocaleString()} collected</span>
            <span className="text-blue-500 font-bold">Billed</span>
          </div>
        </Card>

        {/* Class Tariffs Configured */}
        <Card className="p-4 bg-card/60 dark:bg-card/40 backdrop-blur-xl border-border/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Class Fee Tariffs</span>
              <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold font-headline text-foreground mt-2">
              {managementMetrics.activeTariffsCount}
            </div>
          </div>
          <div className="mt-3 text-[10px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>Defined structures</span>
            <span className="text-amber-500 font-bold">Configured</span>
          </div>
        </Card>
      </div>

      {/* DATA VISUALS & CHARTS GRID */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 bg-card/60 dark:bg-card/40 backdrop-blur-xl border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-sm font-bold font-headline">Fee Collection vs Pending Arrears by Class</CardTitle>
            <CardDescription className="text-xs">Real-time breakdown of paid revenue against unpaid dues.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ManagementFeeChart feeRecords={feeRecords} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card/60 dark:bg-card/40 backdrop-blur-xl border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-sm font-bold font-headline">Enrollment & Academic Pass Rate</CardTitle>
            <CardDescription className="text-xs">Distribution of students and result statistics.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ManagementStudentStats students={students} results={results} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/60 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[300px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input 
              type="search"
              placeholder="Search student, roll ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-background border-border/70 text-xs"
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[140px] text-xs h-9 rounded-xl border-border/70 bg-background">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Classes</SelectItem>
              {classList.map(cls => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedStudentIds.length > 0 ? (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-xs font-bold text-emerald-600 mr-2">{selectedStudentIds.length} selected</span>
            <Button size="sm" onClick={handleBulkIssueChallans} className="h-9 rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white">
              <Calculator className="w-3.5 h-3.5" /> Batch Fees
            </Button>
            <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs gap-1.5 font-bold">
              <GraduationCap className="w-3.5 h-3.5" /> Bulk Promote
            </Button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-semibold px-2">
            Showing <span className="text-foreground font-extrabold">{filteredStudents.length}</span> students
          </div>
        )}
      </div>

      <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/30">
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-xs font-bold">Student Name</TableHead>
                <TableHead className="text-xs font-bold">Roll #</TableHead>
                <TableHead className="text-xs font-bold">Class</TableHead>
                <TableHead className="text-xs font-bold text-right">Pending Arrears</TableHead>
                <TableHead className="text-xs font-bold text-right w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                    No students match your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const arrears = getStudentArrears(student.id);
                  const isSelected = selectedStudentIds.includes(student.id);
                  const initials = student.Name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  
                  return (
                    <TableRow 
                      key={student.id} 
                      onClick={() => handleInspectStudent(student)}
                      className={`hover:bg-muted/50 cursor-pointer transition-colors group ${isSelected ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : ''}`}
                    >
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => {}}
                          onClick={(e: any) => handleToggleSelect(student.id, e)}
                        />
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
                      <TableCell className="font-mono text-xs font-bold text-muted-foreground">
                        {student.id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-semibold bg-muted/40">
                          {student.Class || 'N/A'} ({student.Section || 'A'})
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {arrears > 0 ? (
                          <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                            Rs. {arrears.toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">Clear</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" onClick={() => handleInspectStudent(student)} className="h-8 w-8 p-0 hover:bg-muted rounded-lg">
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

      <UnifiedStudentDrawer 
        isOpen={drawerOpen} 
        onOpenChange={setDrawerOpen} 
        student={inspectedStudent}
        feeRecords={feeRecords}
        feeStructures={feeStructures}
        results={results}
        onDataChange={loadData}
      />

      <BatchFeeModal
        isOpen={isBatchModalOpen}
        onOpenChange={setIsBatchModalOpen}
        selectedCount={selectedStudentIds.length}
        onConfirm={handleBatchFeeConfirm}
      />

      <ClassTariffsModal
        isOpen={isTariffsModalOpen}
        onOpenChange={setIsTariffsModalOpen}
        feeStructures={feeStructures}
      />
    </div>
  );
}
