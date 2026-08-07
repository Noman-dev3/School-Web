"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { 
  CreditCard, Plus, Search, Filter, CheckCircle2, Clock, AlertTriangle, 
  Printer, DollarSign, Download, Eye, Trash2, Edit3, ShieldAlert,
  ArrowUpRight, FileText, Check, X, RefreshCw, Calendar, UserCheck, Loader2,
  Globe, EyeOff, Sparkles, Layers, Users, Zap, Settings2, FileSpreadsheet, HeartHandshake,
  TrendingUp, History, Coins, MoreVertical, CheckSquare, Square, Handshake, Gift, MessageCircle,
  UploadCloud, Table2, AlertCircle, Info, ChevronRight, ChevronLeft, ArrowRight, ShieldCheck,
  TrendingDown, Percent, SlidersHorizontal, Calculator, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FeeRecord, FeeStructure, DynamicFeeField } from "@/app/admin/data-schemas";
import { header } from "@/lib/data";
import { parseExcelFile, executeDualImport, ImportFileSummary } from "@/lib/excel-importer";
import { FeeExportModal } from "@/components/fee-export-modal";

const defaultFeeStructuresSeed: FeeStructure[] = [
  { id: "struct-1", class_name: "Playgroup / Nursery", tuition_fee: 3500, admission_fee: 5000, exam_fee: 1000, lab_fee: 0, custom_fields: [], is_public: true, kinship_enabled: true, kinship_discount_percent: 25 },
  { id: "struct-2", class_name: "Grade 1 - Grade 5", tuition_fee: 4500, admission_fee: 6000, exam_fee: 1500, lab_fee: 500, custom_fields: [], is_public: true, kinship_enabled: true, kinship_discount_percent: 25 },
  { id: "struct-3", class_name: "Grade 6 - Grade 8", tuition_fee: 5500, admission_fee: 7000, exam_fee: 2000, lab_fee: 1000, custom_fields: [], is_public: true, kinship_enabled: true, kinship_discount_percent: 25 },
  { id: "struct-4", class_name: "Grade 9 - Grade 10 (Matric)", tuition_fee: 7000, admission_fee: 8000, exam_fee: 2500, lab_fee: 1500, custom_fields: [{ id: "cf-seed-1", name: "Computer Lab Charges", amount: 500 }], is_public: true, kinship_enabled: true, kinship_discount_percent: 20 },
  { id: "struct-5", class_name: "Grade 11 - Grade 12 (FBISE HSSC)", tuition_fee: 9500, admission_fee: 10000, exam_fee: 3000, lab_fee: 2500, custom_fields: [{ id: "cf-seed-2", name: "Science Lab Charges", amount: 1000 }], is_public: true, kinship_enabled: true, kinship_discount_percent: 15 },
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

  const gradientId = `fees-spark-${color.replace('#', '')}`;

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
    const d = item[dateKey] || item.payment_date || item.createdAt || item.date;
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

// ─── Import Engine Types ─────────────────────────────────────────────────────
type KnownField =
  | 'student_name' | 'student_id' | 'class_name' | 'section' | 'month_year'
  | 'challan_number' | 'tuition_fee' | 'lab_fee' | 'exam_fee' | 'arrears'
  | 'discount' | 'total_amount' | 'amount_paid' | 'status' | 'notes' | '__custom__';

interface ColumnMap { [excelHeader: string]: KnownField; }

interface ImportPreviewRow {
  _rowIndex: number;
  _warnings: string[];
  _isConflict: boolean;
  student_name: string;
  student_id: string;
  class_name: string;
  section: string;
  month_year: string;
  challan_number: string;
  tuition_fee: number;
  lab_fee: number;
  exam_fee: number;
  arrears: number;
  discount: number;
  total_amount: number;
  amount_paid: number;
  status: string;
  notes: string;
  custom_fields: DynamicFeeField[];
}

const FIELD_ALIASES: Record<string, string[]> = {
  student_name:   ['name', 'student name', 'student_name', 'full name', 'fullname', 'pupil name', 'student'],
  student_id:     ['id', 'student id', 'student_id', 'roll', 'roll no', 'roll number', 'rollno', 'reg no', 'registration'],
  class_name:     ['class', 'grade', 'class_name', 'class name', 'std', 'standard'],
  section:        ['section', 'sec', 'div', 'division'],
  month_year:     ['month', 'month year', 'month_year', 'period', 'month/year'],
  challan_number: ['challan', 'challan number', 'challan_number', 'challan no', 'challan#', 'voucher no'],
  tuition_fee:    ['tuition', 'tuition fee', 'monthly fee', 'tution fee', 'tution', 'monthly'],
  lab_fee:        ['lab', 'lab fee', 'laboratory', 'lab charges'],
  exam_fee:       ['exam', 'exam fee', 'examination', 'exam charges', 'test fee'],
  arrears:        ['arrears', 'balance', 'dues', 'outstanding', 'previous dues', 'carry forward'],
  discount:       ['discount', 'concession', 'waiver', 'rebate', 'scholarship'],
  total_amount:   ['total', 'total amount', 'net amount', 'net total', 'payable', 'total payable', 'amount'],
  amount_paid:    ['paid', 'amount paid', 'received', 'collected'],
  status:         ['status', 'payment status', 'fee status'],
  notes:          ['notes', 'remarks', 'comment', 'comments', 'description', 'note'],
};

function detectColumnMap(headers: string[]): ColumnMap {
  const map: ColumnMap = {};
  for (const header of headers) {
    const lh = header.toLowerCase().trim();
    let matched: KnownField = '__custom__';
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(lh)) { matched = field as KnownField; break; }
    }
    map[header] = matched;
  }
  return map;
}

export default function AdminFeesPage() {
  const { toast } = useToast();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Tab Command Center
  const [activeTab, setActiveTab] = useState<'cashier' | 'structures' | 'batch' | 'studentLookup'>('cashier');
  const [selectedLookupStudentId, setSelectedLookupStudentId] = useState<string>('');

  // ── Smart Inspect Slide-Over Drawer State ────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inspectedRecord, setInspectedRecord] = useState<FeeRecord | null>(null);

  // ── Excel / CSV Import State ──────────────────────────────────────────────
  const [isImportOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSheets, setImportSheets] = useState<string[]>([]);
  const [importActiveSheet, setImportActiveSheet] = useState<string>('');
  const [importRawRows, setImportRawRows] = useState<Record<string, any>[]>([]);
  const [importColumnMap, setImportColumnMap] = useState<ColumnMap>({});
  const [isImportParsing, setImportParsing] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  // ── Unified Dual Excel Importer State ──────────────────────────────────────
  const [dualImportSummaries, setDualImportSummaries] = useState<ImportFileSummary[]>([]);
  const [isDualImportOpen, setIsDualImportOpen] = useState(false);
  const [isDualImportProcessing, setIsDualImportProcessing] = useState(false);

  const handleDualExcelFiles = async (files: FileList | File[]) => {
    try {
      const summaries: ImportFileSummary[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) continue;
        const arrayBuffer = await file.arrayBuffer();
        const summary = parseExcelFile(arrayBuffer, file.name);
        summaries.push(summary);
      }

      if (summaries.length === 0) {
        toast({ title: "No Valid Excel Files", description: "Please select valid .xls or .xlsx files.", variant: "destructive" });
        return;
      }

      setDualImportSummaries(summaries);
      setIsDualImportOpen(true);
    } catch (err: any) {
      toast({ title: "Excel Parse Error", description: err.message, variant: "destructive" });
    }
  };

  const handleExecuteDualImport = async () => {
    if (dualImportSummaries.length === 0) return;
    setIsDualImportProcessing(true);
    try {
      const result = await executeDualImport(dualImportSummaries);
      
      toast({
        title: "Dual Import Successful! 🚀",
        description: `Imported/Updated ${result.createdStudentsCount} Students, ${result.createdTariffsCount} Class Tariffs, and ${result.createdVouchersCount} Fee Vouchers with Custom Discounts!`,
      });

      setIsDualImportOpen(false);
      setDualImportSummaries([]);

      // Refresh Fee Records & Fee Structures
      const { data: freshFees } = await supabase.from('fees').select('*').order('created_at', { ascending: false });
      if (freshFees) setFeeRecords(freshFees);

      const { data: freshStructures } = await supabase.from('fee_structures').select('*');
      if (freshStructures) setFeeStructures(freshStructures);

    } catch (err: any) {
      toast({ title: "Import Execution Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsDualImportProcessing(false);
    }
  };

  // Checkbox Selection State
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // Dialog States
  const [isIssueChallanOpen, setIssueChallanOpen] = useState(false);
  const [isBatchIssueOpen, setBatchIssueOpen] = useState(false);
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [isChallanModalOpen, setChallanModalOpen] = useState(false);
  const [isEditStructureOpen, setEditStructureOpen] = useState(false);
  const [isEditVoucherOpen, setEditVoucherOpen] = useState(false);

  // Batch Issue State
  const [batchForm, setBatchForm] = useState({
    month_year: "September 2026",
    class_name: "all",
    applySiblingDiscount: true,
    autoAddArrears: true,
  });
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Selected Items & Edit Record State
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);

  // Form states for New Challan (with Dynamic Custom Fields & Arrears)
  const [newChallan, setNewChallan] = useState({
    student_name: "",
    student_id: "",
    class_name: "Grade 10",
    section: "A",
    month_year: "August 2026",
    tuition_fee: 7000,
    lab_fee: 1500,
    exam_fee: 2000,
    arrears: 0,
    discount: 0,
    discount_reason: "",
    custom_fields: [] as DynamicFeeField[],
    notes: "",
  });

  // Payment Form State with On-the-spot Negotiation Waiver Toggle
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: 0,
    payment_method: "Cash",
    receipt_url: "",
    notes: "",
    mark_unpaid_as_waived: false,
    waiver_reason: "Counter Negotiated Settlement",
  });

  async function fetchRealFeesData(isMounted = true) {
    setLoading(true);
    try {
      // 1. Fetch live Fee Records
      try {
        const { data: feesData, error: feesErr } = await supabase
          .from('fees')
          .select('*')
          .order('created_at', { ascending: false });

        if (isMounted) {
          if (!feesErr && feesData) {
            setFeeRecords(feesData);
          } else {
            setFeeRecords([]);
          }
        }
      } catch {
        if (isMounted) setFeeRecords([]);
      }

      // 2. Fetch live Fee Structures
      try {
        const { data: structData, error: structErr } = await supabase
          .from('fee_structures')
          .select('*');

        if (isMounted) {
          if (!structErr && structData && structData.length > 0) {
            setFeeStructures(structData);
          } else {
            setFeeStructures(defaultFeeStructuresSeed);
          }
        }
      } catch {
        if (isMounted) setFeeStructures(defaultFeeStructuresSeed);
      }

      // 3. Fetch Registered Students
      try {
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, Name, Class, Section, Contact');

        if (isMounted && studentsData) {
          setRegisteredStudents(studentsData);
        }
      } catch {
        // Ignore
      }
    } catch (err) {
      console.warn("Notice loading fees data:", err);
    } finally {
      if (isMounted) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }

  useEffect(() => {
    let isMounted = true;
    fetchRealFeesData(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSelectedRecordIds([]);
    fetchRealFeesData(true);
  };

  // ROBUST ARREARS ENGINE: Calculate Previous Unpaid Arrears for any student (Single & Batch)
  const calculateStudentArrears = (studentId?: string, studentName?: string) => {
    if (!studentId && !studentName) return 0;
    const idSearch = (studentId || "").trim().toLowerCase();
    const nameSearch = (studentName || "").trim().toLowerCase();

    const previousUnpaidRecords = feeRecords.filter((r) => {
      if (r.status === 'paid') return false;
      const rId = (r.student_id || "").trim().toLowerCase();
      const rName = (r.student_name || "").trim().toLowerCase();

      const matchesId = idSearch && rId && (rId === idSearch || rId.includes(idSearch) || idSearch.includes(rId));
      const matchesName = nameSearch && rName && (rName === nameSearch || rName.includes(nameSearch) || nameSearch.includes(rName));

      return matchesId || matchesName;
    });

    const totalArrears = previousUnpaidRecords.reduce((sum, r) => {
      const unpaidBalance = Number(r.total_amount || 0) - Number(r.amount_paid || 0);
      return sum + Math.max(0, unpaidBalance);
    }, 0);

    return totalArrears;
  };

  // Helper to load class tariff defaults into new challan form
  const applyClassStructureToChallan = (className: string, currentChallanState = newChallan) => {
    const matchingStruct = feeStructures.find(
      s => s.class_name.toLowerCase() === className.toLowerCase() ||
           s.class_name.toLowerCase().includes(className.toLowerCase()) ||
           className.toLowerCase().includes(s.class_name.toLowerCase())
    );

    if (matchingStruct) {
      const classDefaults = matchingStruct.custom_fields || [];
      return {
        ...currentChallanState,
        class_name: className,
        tuition_fee: Number(matchingStruct.tuition_fee || 0),
        lab_fee: Number(matchingStruct.lab_fee || 0),
        exam_fee: Number(matchingStruct.exam_fee || 0),
        custom_fields: [...classDefaults],
      };
    }
    return { ...currentChallanState, class_name: className };
  };

  // Admin-Managed Kinship Discount Helper
  const calculateSiblingDiscount = (student: any, targetClassName?: string) => {
    if (!student.Contact) return 0;
    
    const className = targetClassName || student.Class || student.class || "";
    
    const matchingStruct = feeStructures.find(
      s => s.class_name.toLowerCase() === className.toLowerCase() ||
           s.class_name.toLowerCase().includes(className.toLowerCase()) ||
           className.toLowerCase().includes(s.class_name.toLowerCase())
    );

    if (matchingStruct && matchingStruct.kinship_enabled === false) {
      return 0;
    }

    const customRatePercent = matchingStruct?.kinship_discount_percent !== undefined 
      ? Number(matchingStruct.kinship_discount_percent) 
      : 25;

    const sameContactStudents = registeredStudents.filter(
      s => s.Contact && s.Contact.trim() === student.Contact.trim()
    );

    if (sameContactStudents.length > 1) {
      sameContactStudents.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      const siblingIndex = sameContactStudents.findIndex(s => String(s.id) === String(student.id));

      if (siblingIndex >= 1) {
        return customRatePercent / 100;
      }
    }
    return 0;
  };

  // Student Selector Auto-Fill Handler with Arrears & Kinship
  const handleStudentSelect = (studentIdVal: string) => {
    const found = registeredStudents.find(s => String(s.id) === studentIdVal);
    if (found) {
      const studentName = found.Name || found.name || "";
      const studentId = String(found.id);
      const studentClass = found.Class || found.class || "Grade 10";
      const studentSection = found.Section || found.section || "A";

      const previousArrears = calculateStudentArrears(studentId, studentName);

      let updatedChallan = applyClassStructureToChallan(studentClass, {
        ...newChallan,
        student_name: studentName,
        student_id: studentId,
        section: studentSection,
        arrears: previousArrears,
      });

      const discountRate = calculateSiblingDiscount(found, studentClass);
      if (discountRate > 0) {
        const calculatedDiscount = Math.round(updatedChallan.tuition_fee * discountRate);
        updatedChallan.discount = calculatedDiscount;
        updatedChallan.notes = `Class Kinship Discount (${discountRate * 100}%) applied`;
      }

      setNewChallan(updatedChallan);

      toast({
        title: "Student Details Loaded",
        description: `Auto-filled details, class tariff, and Rs. ${previousArrears.toLocaleString()} previous arrears.`
      });
    }
  };

  // Filtered Fee Records
  const filteredRecords = feeRecords.filter((rec) => {
    const matchesSearch = 
      rec.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.challan_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.student_id && rec.student_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || rec.status === statusFilter;
    const matchesClass = classFilter === "all" || rec.class_name === classFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  // Open Smart Inspect Drawer for a Record
  const handleInspectRecord = (rec: FeeRecord) => {
    setInspectedRecord(rec);
    setDrawerOpen(true);
  };

  // Checkbox Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecordIds(filteredRecords.map(r => r.id));
    } else {
      setSelectedRecordIds([]);
    }
  };

  const handleToggleSelectRecord = (id: string) => {
    if (selectedRecordIds.includes(id)) {
      setSelectedRecordIds(selectedRecordIds.filter(i => i !== id));
    } else {
      setSelectedRecordIds([...selectedRecordIds, id]);
    }
  };

  // KPI Calculations
  const totalExpected = feeRecords.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
  const totalCollected = feeRecords.reduce((sum, r) => sum + (Number(r.amount_paid) || 0), 0);
  const totalArrearsPending = feeRecords.reduce((sum, r) => sum + (Number(r.arrears) || 0), 0);
  const defaulterRecords = feeRecords.filter((r) => r.status === "overdue");
  const defaulterCount = defaulterRecords.length;
  const overdueRiskTotal = defaulterRecords.reduce((sum, r) => sum + Math.max(0, Number(r.total_amount) - Number(r.amount_paid)), 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // Handlers for New Challan Custom Fields
  const handleAddChallanCustomField = () => {
    setNewChallan(prev => ({
      ...prev,
      custom_fields: [...prev.custom_fields, { id: `cf-${Date.now()}`, name: "ID Card Reissue", amount: 200 }]
    }));
  };

  const handleCustomFieldChange = (index: number, field: 'name' | 'amount', value: any) => {
    setNewChallan(prev => {
      const updated = [...prev.custom_fields];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, custom_fields: updated };
    });
  };

  const handleRemoveChallanCustomField = (index: number) => {
    setNewChallan(prev => ({
      ...prev,
      custom_fields: prev.custom_fields.filter((_, i) => i !== index)
    }));
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      const netPaid = Number(paymentForm.amount_paid) || 0;
      const totalAmount = Number(selectedRecord.total_amount) || 0;
      let newStatus: FeeRecord['status'] = 'paid';

      if (paymentForm.mark_unpaid_as_waived) {
        newStatus = 'paid';
      } else if (netPaid >= totalAmount) {
        newStatus = 'paid';
      } else if (netPaid > 0) {
        newStatus = 'partial';
      } else {
        newStatus = 'pending';
      }

      const paymentDate = new Date().toISOString().split('T')[0];
      const updatedNotes = paymentForm.mark_unpaid_as_waived 
        ? `${selectedRecord.notes || ''} | Waived remaining: ${paymentForm.waiver_reason}`.trim()
        : selectedRecord.notes;

      const { error } = await supabase
        .from('fees')
        .update({
          amount_paid: netPaid,
          status: newStatus,
          payment_method: paymentForm.payment_method,
          payment_date: paymentDate,
          receipt_url: paymentForm.receipt_url || null,
          notes: updatedNotes
        })
        .eq('id', selectedRecord.id);

      if (error) throw error;

      setFeeRecords(prev => prev.map(r => r.id === selectedRecord.id ? {
        ...r,
        amount_paid: netPaid,
        status: newStatus,
        payment_method: paymentForm.payment_method,
        payment_date: paymentDate,
        notes: updatedNotes
      } : r));

      setPaymentOpen(false);
      toast({ title: "Payment Recorded 💳", description: `Rs. ${netPaid.toLocaleString()} recorded for ${selectedRecord.student_name}.` });
    } catch (err: any) {
      toast({ title: "Payment Failed", description: err.message, variant: "destructive" });
    }
  };

  // Calculate Net Total for New Challan
  const calculatedChallanTotal = 
    Number(newChallan.tuition_fee || 0) + 
    Number(newChallan.lab_fee || 0) + 
    Number(newChallan.exam_fee || 0) + 
    Number(newChallan.arrears || 0) + 
    newChallan.custom_fields.reduce((sum, f) => sum + Number(f.amount || 0), 0) - 
    Number(newChallan.discount || 0);

  // AUTOMATED 1ST-OF-MONTH BATCH & ARREARS ENGINE
  const handleGenerateBatchChallans = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBatchProcessing(true);

    try {
      const targetStudents = registeredStudents.filter((st) => {
        if (batchForm.class_name === "all") return true;
        const stClass = (st.Class || st.class || "").toLowerCase();
        return stClass.includes(batchForm.class_name.toLowerCase()) || batchForm.class_name.toLowerCase().includes(stClass);
      });

      if (targetStudents.length === 0) {
        toast({ title: "No Students Found", description: "No registered students match the selected class criteria.", variant: "destructive" });
        setIsBatchProcessing(false);
        return;
      }

      const yearStr = new Date().getFullYear();
      const generatedBatch: FeeRecord[] = targetStudents.map((st, idx) => {
        const studentClass = st.Class || st.class || "Grade 10";
        const studentName = st.Name || st.name || `Student ${st.id}`;
        const studentIdStr = String(st.id);
        const section = st.Section || st.section || "A";

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
        if (batchForm.autoAddArrears) {
          autoArrears = calculateStudentArrears(studentIdStr, studentName);
        }

        let discount = 0;
        if (batchForm.applySiblingDiscount) {
          const discountRate = calculateSiblingDiscount(st, studentClass);
          discount = Math.round(tuitionFee * discountRate);
        }

        const totalCustom = customFields.reduce((sum, f) => sum + Number(f.amount || 0), 0);
        const netTotal = Math.max(0, tuitionFee + labFee + examFee + autoArrears + totalCustom - discount);

        return {
          id: `fee-batch-${Date.now()}-${idx}`,
          challan_number: `CHS-${yearStr}-${Math.floor(10000 + Math.random() * 90000)}`,
          student_name: studentName,
          student_id: studentIdStr,
          class_name: studentClass,
          section: section,
          month_year: batchForm.month_year,
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
        };
      });

      const { error } = await supabase.from('fees').insert(generatedBatch);

      if (error) {
        toast({ title: "Batch Error", description: error.message, variant: "destructive" });
      } else {
        setFeeRecords([...generatedBatch, ...feeRecords]);
        setBatchIssueOpen(false);
        toast({
          title: "1st-of-Month Fee Engine Complete! 🎉",
          description: `Issued ${generatedBatch.length} vouchers for ${batchForm.month_year} with auto-arrears roll-forward.`
        });
      }
    } catch (err: any) {
      toast({ title: "Batch Error", description: err.message || "Failed to generate batch challans.", variant: "destructive" });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Excel File Drop Handler
  const handleImportFileDrop = useCallback(async (file: File) => {
    setImportFile(file);
    setImportParsing(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheets = wb.SheetNames;
      setImportSheets(sheets);
      const firstSheet = sheets[0] ?? '';
      setImportActiveSheet(firstSheet);
      if (wb && wb.Sheets[firstSheet]) {
        const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], { defval: '' });
        setImportRawRows(rows);
        if (rows.length > 0) {
          setImportColumnMap(detectColumnMap(Object.keys(rows[0])));
        }
      }
    } catch {
      toast({ title: 'Parse Error', description: 'Could not read file. Ensure it is a valid .xlsx or .csv.', variant: 'destructive' });
    } finally {
      setImportParsing(false);
    }
  }, [toast]);

  // Issue Single Voucher
  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const yearStr = new Date().getFullYear();
      const challanNum = `CHS-${yearStr}-${Math.floor(10000 + Math.random() * 90000)}`;

      const newRecordPayload: FeeRecord = {
        id: `fee-${Date.now()}`,
        challan_number: challanNum,
        student_name: newChallan.student_name,
        student_id: newChallan.student_id || `STU-${Math.floor(100 + Math.random() * 900)}`,
        class_name: newChallan.class_name,
        section: newChallan.section,
        month_year: newChallan.month_year,
        tuition_fee: Number(newChallan.tuition_fee),
        lab_fee: Number(newChallan.lab_fee),
        exam_fee: Number(newChallan.exam_fee),
        arrears: Number(newChallan.arrears),
        discount: Number(newChallan.discount),
        custom_fields: newChallan.custom_fields,
        total_amount: calculatedChallanTotal,
        amount_paid: 0,
        status: 'pending',
        notes: newChallan.notes,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('fees').insert([newRecordPayload]);
      if (error) throw error;

      setFeeRecords([newRecordPayload, ...feeRecords]);
      setIssueChallanOpen(false);
      toast({ title: "Voucher Issued! 📄", description: `Challan #${challanNum} issued for ${newChallan.student_name}.` });
    } catch (err: any) {
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    }
  };

  const PageSkeleton = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <CreditCard className="w-4 h-4" /> School Financial Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-foreground">
            Fee & Arrears Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Streamlined 3-step billing cycle: Cashier Terminal, Class Fee Tariffs, and Batch Monthly Billing Engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl h-9 text-xs gap-1.5 border-border/80 bg-background hover:bg-muted font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Fees</span>
          </Button>

          <FeeExportModal feeRecords={feeRecords} />
        </div>
      </div>

      {/* AI Financial Health & Recovery Banner */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900/10 to-teal-950/20 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI Financial Recovery Intelligence</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                  {collectionRate}% Collection Rate
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-1">
                Realized <strong className="text-emerald-600 dark:text-emerald-400">Rs. {totalCollected.toLocaleString()}</strong> out of <strong className="text-foreground">Rs. {totalExpected.toLocaleString()}</strong> gross billed. 
                {defaulterCount > 0 ? (
                  <span> <strong className="text-rose-600 dark:text-rose-400 font-extrabold">{defaulterCount} defaulter accounts</strong> owe Rs. {overdueRiskTotal.toLocaleString()} in overdue arrears.</span>
                ) : (
                  <span> 100% clean recovery! All issued vouchers are up to date.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setStatusFilter("overdue"); setActiveTab('cashier'); }}
              className="h-8 text-xs gap-1.5 rounded-xl border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10 font-semibold"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Filter {defaulterCount} Defaulters
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <PageSkeleton />
      ) : (
        <>
          {/* Glassmorphic KPI Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Gross Billed */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-blue-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Gross Billed <span className="opacity-40">/ Total</span></span>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-2xl font-bold font-headline text-foreground">Rs. {totalExpected.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{feeRecords.length} total vouchers</div>
                  </div>
                  <MiniSparklineChart data={computeRealTrend(feeRecords)} color="#3b82f6" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-blue-500 font-semibold">Active Cycle</span>
                <span>Gross Billing</span>
              </div>
            </Card>

            {/* Cash Realized */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-emerald-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Realized Cash <span className="opacity-40">/ Collected</span></span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-2xl font-bold font-headline text-emerald-600 dark:text-emerald-400">Rs. {totalCollected.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{collectionRate}% collection rate</div>
                  </div>
                  <MiniSparklineChart data={computeRealTrend(feeRecords.filter(r => r.amount_paid > 0))} color="#10b981" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-emerald-500 font-semibold">{collectionRate}% Recovered</span>
                <span>Bank & Cash</span>
              </div>
            </Card>

            {/* Accumulated Arrears */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-amber-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Accumulated Arrears <span className="opacity-40">/ Carried</span></span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <History className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-2xl font-bold font-headline text-amber-600 dark:text-amber-400">Rs. {totalArrearsPending.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Carried from past months</div>
                  </div>
                  <MiniSparklineChart data={computeRealTrend(feeRecords.filter(r => r.arrears > 0))} color="#f59e0b" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-amber-500 font-semibold">Auto Rolled</span>
                <span>Arrears Pool</span>
              </div>
            </Card>

            {/* Overdue Defaulters Risk */}
            <Card className="rounded-2xl border-border/60 bg-card p-4 transition-all hover:border-rose-500/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Defaulter Risk <span className="opacity-40">/ Overdue</span></span>
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-2xl font-bold font-headline text-rose-600 dark:text-rose-400">{defaulterCount} <span className="text-xs text-muted-foreground">Accounts</span></div>
                    <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Rs. {overdueRiskTotal.toLocaleString()} unpaid</div>
                  </div>
                  <MiniSparklineChart data={computeRealTrend(defaulterRecords)} color="#f43f5e" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                <span className="text-rose-500 font-semibold">Action Required</span>
                <span>WhatsApp Links</span>
              </div>
            </Card>
          </div>

          {/* 3-TAB UNIFIED COMMAND CENTER */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
              <TabsList className="bg-card border border-border/60 p-1 rounded-2xl h-11">
                <TabsTrigger value="cashier" className="rounded-xl text-xs gap-2 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <CreditCard className="w-4 h-4" /> Cashier & Collection Terminal
                </TabsTrigger>
                <TabsTrigger value="studentLookup" className="rounded-xl text-xs gap-2 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <UserCheck className="w-4 h-4" /> Student Fee & Challan Lookup
                </TabsTrigger>
                <TabsTrigger value="structures" className="rounded-xl text-xs gap-2 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <Settings2 className="w-4 h-4" /> Class Tariffs & Sibling Matrix
                </TabsTrigger>
                <TabsTrigger value="batch" className="rounded-xl text-xs gap-2 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <Zap className="w-4 h-4" /> Monthly Billing & Excel Wizard
                </TabsTrigger>
              </TabsList>

              {/* CONTEXTUAL ACTION BUTTONS PER TAB */}
              {activeTab === 'cashier' && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIssueChallanOpen(true)}
                    size="sm"
                    className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Issue Single Voucher
                  </Button>

                  <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="search"
                      placeholder="Search student, Roll ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9 rounded-xl bg-background text-xs border-border/70 w-52"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-28 text-xs h-9 rounded-xl border-border/70 bg-background">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeTab === 'structures' && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => { setEditingStructure({ id: `struct-${Date.now()}`, class_name: "Grade 9 - New Grade", tuition_fee: 6500, admission_fee: 7000, exam_fee: 2000, lab_fee: 1000, custom_fields: [], is_public: true, kinship_enabled: true, kinship_discount_percent: 20 }); setEditStructureOpen(true); }}
                    size="sm"
                    className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Class Fee Tariff
                  </Button>
                </div>
              )}

              {activeTab === 'batch' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleGenerateBatchChallans}
                    disabled={isBatchProcessing}
                    className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 font-bold"
                  >
                    <Zap className="h-3.5 w-3.5 text-emerald-600" /> Run 1st-of-Month Billing
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => importFileRef.current?.click()}
                    className="rounded-xl h-9 text-xs gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 font-bold"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Upload Excel Sheet
                  </Button>
                </div>
              )}
            </div>

            {/* TAB 1: CASHIER & COLLECTION TERMINAL */}
            <TabsContent value="cashier" className="space-y-4">
              <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
                <CardHeader className="p-4 pb-3 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" /> Active Voucher Register
                    </CardTitle>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{filteredRecords.length} voucher(s)</span>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-muted/30">
                        <TableHead className="w-12 text-center">
                          <Checkbox 
                            checked={filteredRecords.length > 0 && selectedRecordIds.length === filteredRecords.length}
                            onCheckedChange={handleSelectAll}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead className="text-xs font-bold">Challan #</TableHead>
                        <TableHead className="text-xs font-bold">Student Name</TableHead>
                        <TableHead className="text-xs font-bold">Class & Section</TableHead>
                        <TableHead className="text-xs font-bold">Billing Month</TableHead>
                        <TableHead className="text-xs font-bold text-right">Net Payable</TableHead>
                        <TableHead className="text-xs font-bold text-right">Paid</TableHead>
                        <TableHead className="text-xs font-bold">Status</TableHead>
                        <TableHead className="text-xs font-bold text-right w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-xs">
                            No fee vouchers match your search criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords.map((rec) => {
                          const netUnpaid = Math.max(0, Number(rec.total_amount) - Number(rec.amount_paid));
                          return (
                            <TableRow 
                              key={rec.id} 
                              onClick={() => handleInspectRecord(rec)}
                              className="hover:bg-muted/50 cursor-pointer transition-colors group"
                            >
                              <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                <Checkbox 
                                  checked={selectedRecordIds.includes(rec.id)}
                                  onCheckedChange={() => handleToggleSelectRecord(rec.id)}
                                  className="rounded"
                                />
                              </TableCell>
                              <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {rec.challan_number}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">{rec.student_name}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono">ID: #{rec.student_id || 'N/A'}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[11px] font-semibold bg-muted/40">
                                  {rec.class_name} ({rec.section || 'A'})
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs font-medium text-muted-foreground">{rec.month_year}</TableCell>
                              <TableCell className="text-xs font-bold text-right text-foreground font-mono">
                                Rs. {Number(rec.total_amount).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-xs font-bold text-right text-emerald-600 dark:text-emerald-400 font-mono">
                                Rs. {Number(rec.amount_paid).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full ${
                                  rec.status === 'paid' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' :
                                  rec.status === 'overdue' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30' :
                                  'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                }`}>
                                  {rec.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 rounded-xl text-xs">
                                    <DropdownMenuItem
                                      onClick={() => { setSelectedRecord(rec); setPaymentForm({ amount_paid: netUnpaid > 0 ? netUnpaid : Number(rec.total_amount), payment_method: "Cash", receipt_url: "", notes: "", mark_unpaid_as_waived: false, waiver_reason: "Counter Negotiated Settlement" }); setPaymentOpen(true); }}
                                      className="gap-2 font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                                    >
                                      <DollarSign className="w-3.5 h-3.5" /> Record Payment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => { setSelectedRecord(rec); setChallanModalOpen(true); }}
                                      className="gap-2 font-semibold cursor-pointer"
                                    >
                                      <Printer className="w-3.5 h-3.5 text-muted-foreground" /> Print PDF Voucher
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => { setSelectedRecord(rec); setEditVoucherOpen(true); }}
                                      className="gap-2 font-semibold cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit Voucher Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        window.open(`https://wa.me/?text=${encodeURIComponent(`Dear Parent, this is a reminder regarding ${rec.student_name}'s fee voucher (${rec.month_year}) for Rs. ${Number(rec.total_amount).toLocaleString()}. Please submit at your earliest convenience.`)}`, '_blank');
                                      }}
                                      className="gap-2 font-semibold cursor-pointer"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Reminder
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={async () => {
                                        if (confirm(`Are you sure you want to delete challan #${rec.challan_number}?`)) {
                                          const { error } = await supabase.from('fees').delete().eq('id', rec.id);
                                          if (!error) {
                                            setFeeRecords(prev => prev.filter(r => r.id !== rec.id));
                                            toast({ title: "Voucher Deleted", description: `Challan #${rec.challan_number} removed.` });
                                          }
                                        }
                                      }}
                                      className="gap-2 font-bold text-rose-600 dark:text-rose-400 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete Voucher
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: CLASS FEE TARIFFS & KINSHIP MATRIX */}
            <TabsContent value="structures" className="space-y-4">
              <Card className="rounded-2xl border-border/80 shadow-xs">
                <CardHeader className="p-4 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-emerald-600" /> Class Tariff & Sibling Concession Matrix
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Set tuition, exam, lab fees, and sibling discount percentages per grade.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => { setEditingStructure({ id: `struct-${Date.now()}`, class_name: "Grade 9 - New Grade", tuition_fee: 6500, admission_fee: 7000, exam_fee: 2000, lab_fee: 1000, custom_fields: [], is_public: true, kinship_enabled: true, kinship_discount_percent: 20 }); setEditStructureOpen(true); }}
                    size="sm"
                    className="rounded-xl h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Class Tariff
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {feeStructures.map((struct) => (
                      <Card key={struct.id} className="rounded-2xl border-border/60 bg-card p-4 space-y-3 shadow-2xs hover:border-emerald-500/40 transition-all">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-foreground font-headline">{struct.class_name}</h3>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]">
                            {struct.kinship_discount_percent}% Sibling Off
                          </Badge>
                        </div>

                        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-b border-border/40 py-2">
                          <div className="flex justify-between">
                            <span>Tuition Fee:</span>
                            <span className="font-bold text-foreground">Rs. {Number(struct.tuition_fee).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lab / Computer Charges:</span>
                            <span className="font-semibold text-foreground">Rs. {Number(struct.lab_fee).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Exam Fee:</span>
                            <span className="font-semibold text-foreground">Rs. {Number(struct.exam_fee).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-emerald-600 font-semibold">
                            <span>Sibling Discount:</span>
                            <span>{struct.kinship_enabled ? `${struct.kinship_discount_percent}% Active` : 'Disabled'}</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditingStructure(struct); setEditStructureOpen(true); }}
                          className="w-full text-xs h-8 rounded-xl font-semibold gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-muted-foreground" /> Edit Class Tariff
                        </Button>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: MONTHLY BILLING ENGINE & EXCEL WIZARD */}
            <TabsContent value="batch" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {/* 1st-of-Month Billing Card */}
                <Card className="rounded-2xl border-border/80 shadow-xs p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-600">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">1st-of-Month Auto Billing Engine</h3>
                      <p className="text-xs text-muted-foreground">Auto-generates vouchers for all enrolled students with arrears roll-forward.</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Billing Period / Month</Label>
                      <Input
                        value={batchForm.month_year}
                        onChange={(e) => setBatchForm({ ...batchForm, month_year: e.target.value })}
                        className="text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between border p-3 rounded-xl bg-muted/20">
                      <div>
                        <p className="font-bold text-foreground">Roll Over Unpaid Arrears</p>
                        <p className="text-[10px] text-muted-foreground">Auto-adds unpaid balances from previous months</p>
                      </div>
                      <Switch
                        checked={batchForm.autoAddArrears}
                        onCheckedChange={(checked) => setBatchForm({ ...batchForm, autoAddArrears: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between border p-3 rounded-xl bg-muted/20">
                      <div>
                        <p className="font-bold text-foreground">Apply Sibling / Kinship Discount</p>
                        <p className="text-[10px] text-muted-foreground">Auto-applies 25% discount for 2nd/3rd child</p>
                      </div>
                      <Switch
                        checked={batchForm.applySiblingDiscount}
                        onCheckedChange={(checked) => setBatchForm({ ...batchForm, applySiblingDiscount: checked })}
                      />
                    </div>

                    <Button
                      onClick={handleGenerateBatchChallans}
                      disabled={isBatchProcessing}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 rounded-xl gap-2 shadow-md"
                    >
                      {isBatchProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Run 1st-of-Month Auto Billing
                    </Button>
                  </div>
                </Card>

                {/* Excel Import Card */}
                <Card className="rounded-2xl border-border/80 shadow-xs p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-600">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">Unified Dual Excel Import Engine</h3>
                      <p className="text-xs text-muted-foreground">Auto-imports student profiles, grade fee tariffs, custom discounts & printable vouchers in 1 click.</p>
                    </div>
                  </div>

                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files) handleDualExcelFiles(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-emerald-500/40 rounded-2xl p-6 text-center space-y-3 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Drag & Drop Single or Multiple Excel Files (.xls, .xlsx)</p>
                      <p className="text-[10px] text-muted-foreground">Supports G-I, G-II, G-III, G-V, G-VII, G-IX, G-X, K.G, P.G, PREP files simultaneously</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => importFileRef.current?.click()}
                      className="text-xs rounded-xl font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-400 gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Select Files (Multi-Select Supported)
                    </Button>
                    <input
                      ref={importFileRef}
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => { if (e.target.files && e.target.files.length > 0) handleDualExcelFiles(e.target.files); }}
                      className="hidden"
                    />
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 4: STUDENT FEE & CHALLAN LOOKUP */}
            <TabsContent value="studentLookup" className="space-y-4">
              <Card className="rounded-2xl border-border/80 shadow-xs p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-foreground font-headline">Student Fee History & Challan Lookup</h3>
                      <p className="text-xs text-muted-foreground">Select any student to view their complete billing ledger and issue or print vouchers.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-[280px]">
                    <Select value={selectedLookupStudentId} onValueChange={setSelectedLookupStudentId}>
                      <SelectTrigger className="text-xs h-10 rounded-xl border-border/70 bg-background font-semibold w-full">
                        <SelectValue placeholder="Select student to inspect fees..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 rounded-xl">
                        {registeredStudents.map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.Name} ({s.Class} - {s.Section}) [ID: #{s.id}]
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* SELECTED STUDENT FINANCIAL SUMMARY */}
                {selectedLookupStudentId ? (() => {
                  const student = registeredStudents.find(s => String(s.id) === selectedLookupStudentId);
                  const studentName = student?.Name || '';
                  const studentClass = student?.Class || '';
                  const studentSection = student?.Section || 'A';
                  const studentContact = student?.Contact || '';

                  const studentVouchers = feeRecords.filter(r => {
                    const rId = (r.student_id || '').trim().toLowerCase();
                    const rName = (r.student_name || '').trim().toLowerCase();
                    const targetId = String(selectedLookupStudentId).trim().toLowerCase();
                    const targetName = studentName.trim().toLowerCase();
                    return (rId && rId === targetId) || (rName && rName === targetName);
                  });

                  const totalBilled = studentVouchers.reduce((s, r) => s + Number(r.total_amount || 0), 0);
                  const totalPaid = studentVouchers.reduce((s, r) => s + Number(r.amount_paid || 0), 0);
                  const netPending = Math.max(0, totalBilled - totalPaid);

                  return (
                    <div className="space-y-4">
                      {/* Profile & KPI Summary Banner */}
                      <div className="bg-muted/30 border border-border/60 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                            {studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-foreground">{studentName}</h4>
                              <Badge variant="outline" className="text-[10px] font-mono font-bold text-emerald-600 border-emerald-500/30">
                                ID #{selectedLookupStudentId}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Class {studentClass} ({studentSection}) • Contact: {studentContact || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground font-medium">Total Billed</p>
                            <p className="font-bold text-foreground font-mono">Rs. {totalBilled.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-medium">Total Paid</p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">Rs. {totalPaid.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-medium">Net Due</p>
                            <p className={`font-bold font-mono ${netPending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              Rs. {netPending.toLocaleString()}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => {
                              setNewChallan({
                                ...newChallan,
                                student_name: studentName,
                                student_id: String(selectedLookupStudentId),
                                class_name: studentClass,
                                section: studentSection,
                                arrears: netPending,
                              });
                              setIssueChallanOpen(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl gap-1 shadow-xs ml-2"
                          >
                            <Plus className="w-3.5 h-3.5" /> Issue Voucher
                          </Button>
                        </div>
                      </div>

                      {/* Dedicated Student Fee Vouchers Table */}
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent bg-muted/30">
                            <TableHead className="text-xs font-bold">Challan #</TableHead>
                            <TableHead className="text-xs font-bold">Billing Month</TableHead>
                            <TableHead className="text-xs font-bold text-right">Tuition</TableHead>
                            <TableHead className="text-xs font-bold text-right">Lab / Exam</TableHead>
                            <TableHead className="text-xs font-bold text-right">Arrears</TableHead>
                            <TableHead className="text-xs font-bold text-right">Discount</TableHead>
                            <TableHead className="text-xs font-bold text-right">Net Payable</TableHead>
                            <TableHead className="text-xs font-bold text-right">Paid</TableHead>
                            <TableHead className="text-xs font-bold">Status</TableHead>
                            <TableHead className="text-xs font-bold text-right w-20">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentVouchers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-xs italic">
                                No fee vouchers issued for {studentName} yet.
                              </TableCell>
                            </TableRow>
                          ) : (
                            studentVouchers.map((rec) => {
                              const netUnpaid = Math.max(0, Number(rec.total_amount) - Number(rec.amount_paid));
                              return (
                                <TableRow key={rec.id} className="hover:bg-muted/50 transition-colors">
                                  <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    {rec.challan_number}
                                  </TableCell>
                                  <TableCell className="text-xs font-medium">{rec.month_year}</TableCell>
                                  <TableCell className="text-xs font-mono text-right">Rs. {Number(rec.tuition_fee).toLocaleString()}</TableCell>
                                  <TableCell className="text-xs font-mono text-right">Rs. {(Number(rec.lab_fee) + Number(rec.exam_fee)).toLocaleString()}</TableCell>
                                  <TableCell className="text-xs font-mono text-right text-amber-600">Rs. {Number(rec.arrears).toLocaleString()}</TableCell>
                                  <TableCell className="text-xs font-mono text-right text-emerald-600">- Rs. {Number(rec.discount).toLocaleString()}</TableCell>
                                  <TableCell className="text-xs font-mono text-right font-bold text-foreground">Rs. {Number(rec.total_amount).toLocaleString()}</TableCell>
                                  <TableCell className="text-xs font-mono text-right font-bold text-emerald-600">Rs. {Number(rec.amount_paid).toLocaleString()}</TableCell>
                                  <TableCell>
                                    <Badge className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full ${
                                      rec.status === 'paid' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                                      rec.status === 'overdue' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400' :
                                      'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                    }`}>
                                      {rec.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48 rounded-xl text-xs">
                                        <DropdownMenuItem
                                          onClick={() => { setSelectedRecord(rec); setPaymentForm({ amount_paid: netUnpaid > 0 ? netUnpaid : Number(rec.total_amount), payment_method: "Cash", receipt_url: "", notes: "", mark_unpaid_as_waived: false, waiver_reason: "Counter Negotiated Settlement" }); setPaymentOpen(true); }}
                                          className="gap-2 font-bold text-emerald-600"
                                        >
                                          <DollarSign className="w-3.5 h-3.5" /> Record Payment
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { setSelectedRecord(rec); setChallanModalOpen(true); }} className="gap-2 font-semibold">
                                          <Printer className="w-3.5 h-3.5 text-muted-foreground" /> Print PDF Voucher
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { setSelectedRecord(rec); setEditVoucherOpen(true); }} className="gap-2 font-semibold">
                                          <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit Voucher
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })() : (
                  <div className="text-center py-12 space-y-3 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                    <UserCheck className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Select a Student Above</p>
                      <p className="text-xs text-muted-foreground">Pick any student to inspect their entire fee ledger and check all issued challans.</p>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SMART SLIDE-OVER STUDENT LEDGER DRAWER
          ═══════════════════════════════════════════════════════════════ */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto flex flex-col justify-between">
          {inspectedRecord && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 bg-gradient-to-b from-emerald-950/20 to-transparent border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    {inspectedRecord.challan_number}
                  </Badge>
                  <Badge className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${
                    inspectedRecord.status === 'paid' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                    inspectedRecord.status === 'overdue' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400' :
                    'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  }`}>
                    {inspectedRecord.status}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold text-foreground tracking-tight">{inspectedRecord.student_name}</h3>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Class {inspectedRecord.class_name} ({inspectedRecord.section || 'A'}) • {inspectedRecord.month_year}
                </p>
              </div>

              {/* Itemized Voucher Breakdown */}
              <div className="p-6 space-y-4 flex-1 text-xs">
                <div className="bg-muted/40 rounded-2xl p-4 border border-border/60 space-y-2">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground mb-2">Itemized Fee Breakdown</h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tuition Fee:</span>
                    <span className="font-bold text-foreground font-mono">Rs. {Number(inspectedRecord.tuition_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lab Charges:</span>
                    <span className="font-semibold text-foreground font-mono">Rs. {Number(inspectedRecord.lab_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exam Fee:</span>
                    <span className="font-semibold text-foreground font-mono">Rs. {Number(inspectedRecord.exam_fee).toLocaleString()}</span>
                  </div>
                  {inspectedRecord.arrears > 0 && (
                    <div className="flex justify-between text-amber-600 font-semibold">
                      <span>Previous Arrears:</span>
                      <span className="font-mono">Rs. {Number(inspectedRecord.arrears).toLocaleString()}</span>
                    </div>
                  )}
                  {inspectedRecord.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Kinship Discount:</span>
                      <span className="font-mono">- Rs. {Number(inspectedRecord.discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/60 flex justify-between font-bold text-sm text-foreground">
                    <span>Net Total Payable:</span>
                    <span className="font-mono text-emerald-600">Rs. {Number(inspectedRecord.total_amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Direct WhatsApp Reminder Trigger */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-950 dark:text-emerald-300">Send WhatsApp Reminder</p>
                    <p className="text-[10px] text-muted-foreground">Send payment reminder directly to parent</p>
                  </div>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Dear Parent, this is a reminder regarding ${inspectedRecord.student_name}'s fee voucher (${inspectedRecord.month_year}) for Rs. ${inspectedRecord.total_amount.toLocaleString()}. Please submit at your earliest convenience.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-700"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Send
                  </a>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-border/50 bg-muted/20 space-y-2">
                <Button
                  onClick={() => { setSelectedRecord(inspectedRecord); setChallanModalOpen(true); setDrawerOpen(false); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-xl text-xs h-10 shadow-md"
                >
                  <Printer className="w-4 h-4" /> Print 2-Copy Landscape Voucher
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* RECORD PAYMENT DIALOG */}
      <Dialog open={isPaymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <DollarSign className="w-5 h-5 text-emerald-600" /> Record Fee Payment
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record received cash or bank deposit for {selectedRecord?.student_name}.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <form onSubmit={handleRecordPayment} className="space-y-4 py-2 text-xs">
              <div className="bg-muted/40 p-3 rounded-xl border border-border/60 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Challan #:</span>
                  <span className="font-mono font-bold text-foreground">{selectedRecord.challan_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Due Amount:</span>
                  <span className="font-mono font-bold text-emerald-600">Rs. {Number(selectedRecord.total_amount).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Amount Paid (Rs.) *</Label>
                <Input
                  type="number"
                  required
                  value={paymentForm.amount_paid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: Number(e.target.value) })}
                  className="text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Payment Method</Label>
                <Select
                  value={paymentForm.payment_method}
                  onValueChange={(val) => setPaymentForm({ ...paymentForm, payment_method: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash Counter</SelectItem>
                    <SelectItem value="Bank Deposit">Bank Deposit</SelectItem>
                    <SelectItem value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</SelectItem>
                    <SelectItem value="Online Transfer">Online Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Counter-Negotiation Waiver Toggle */}
              <div className="flex items-center justify-between border p-3 rounded-xl bg-amber-500/10 border-amber-500/30">
                <div>
                  <p className="font-bold text-amber-950 dark:text-amber-300">Waive Remaining Unpaid Balance</p>
                  <p className="text-[10px] text-muted-foreground">Mark as fully paid after negotiated discount</p>
                </div>
                <Switch
                  checked={paymentForm.mark_unpaid_as_waived}
                  onCheckedChange={(checked) => setPaymentForm({ ...paymentForm, mark_unpaid_as_waived: checked })}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Save Payment Receipt
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* SINGLE VOUCHER ISSUE DIALOG */}
      <Dialog open={isIssueChallanOpen} onOpenChange={setIssueChallanOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl max-h-[92vh] overflow-y-auto p-6 bg-background border-border/80 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground font-headline">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Plus className="w-5 h-5" />
              </div>
              Issue Individual Fee Voucher
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Select student to auto-fill class tariffs, custom fee heads, and custom concessions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateChallan} className="space-y-4 py-3 text-xs">
            {/* Student Search */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Select Registered Student *</Label>
              <Select onValueChange={handleStudentSelect}>
                <SelectTrigger className="text-xs h-10 rounded-xl border-border/70 bg-background font-medium">
                  <SelectValue placeholder="Search student by name, roll ID or class..." />
                </SelectTrigger>
                <SelectContent className="max-h-56 rounded-xl">
                  {registeredStudents.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.Name} ({s.Class} - {s.Section}) [ID: #{s.id}]
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student Meta Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Student Name *</Label>
                <Input
                  required
                  placeholder="Student Name"
                  value={newChallan.student_name}
                  onChange={(e) => setNewChallan({ ...newChallan, student_name: e.target.value })}
                  className="text-xs h-9 rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Billing Month *</Label>
                <Input
                  required
                  placeholder="e.g. September 2026"
                  value={newChallan.month_year}
                  onChange={(e) => setNewChallan({ ...newChallan, month_year: e.target.value })}
                  className="text-xs h-9 rounded-xl font-semibold"
                />
              </div>
            </div>

            {/* Fee Heads Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">Fee Heads & Charges</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddChallanCustomField()}
                  className="h-7 text-xs text-emerald-600 font-bold gap-1 p-0 hover:bg-transparent"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Fee Head
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Tuition Fee</Label>
                  <Input
                    type="number"
                    value={newChallan.tuition_fee}
                    onChange={(e) => setNewChallan({ ...newChallan, tuition_fee: Number(e.target.value) })}
                    className="text-xs h-9 font-mono font-bold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Lab Charges</Label>
                  <Input
                    type="number"
                    value={newChallan.lab_fee}
                    onChange={(e) => setNewChallan({ ...newChallan, lab_fee: Number(e.target.value) })}
                    className="text-xs h-9 font-mono font-bold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Exam Fee</Label>
                  <Input
                    type="number"
                    value={newChallan.exam_fee}
                    onChange={(e) => setNewChallan({ ...newChallan, exam_fee: Number(e.target.value) })}
                    className="text-xs h-9 font-mono font-bold rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] text-amber-600 font-semibold">Previous Arrears</Label>
                  <Input
                    type="number"
                    value={newChallan.arrears}
                    onChange={(e) => setNewChallan({ ...newChallan, arrears: Number(e.target.value) })}
                    className="text-xs h-9 font-mono font-bold rounded-xl text-amber-600 border-amber-500/30 bg-amber-500/5"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-emerald-600 font-semibold">Custom Discount (Rs.)</Label>
                  <Input
                    type="number"
                    value={newChallan.discount}
                    onChange={(e) => setNewChallan({ ...newChallan, discount: Number(e.target.value) })}
                    className="text-xs h-9 font-mono font-bold rounded-xl text-emerald-600 border-emerald-500/30 bg-emerald-500/5"
                  />
                </div>
              </div>

              {/* Dynamic Fee Line Items */}
              {newChallan.custom_fields.length > 0 && (
                <div className="space-y-2 pt-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Additional Fee Line Items</Label>
                  {newChallan.custom_fields.map((field, idx) => (
                    <div key={field.id || idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Fee Name (e.g. Transport, Hostel, Fine)"
                        value={field.name}
                        onChange={(e) => handleCustomFieldChange(idx, 'name', e.target.value)}
                        className="text-xs h-8 flex-1 rounded-xl"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={field.amount}
                        onChange={(e) => handleCustomFieldChange(idx, 'amount', Number(e.target.value))}
                        className="text-xs h-8 w-28 font-mono font-bold rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveChallanCustomField(idx)}
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Concession Note */}
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Concession Reason / Voucher Notes</Label>
                <Input
                  placeholder="e.g. Special Concession, Top Rank Scholar, Staff Child"
                  value={newChallan.notes || ''}
                  onChange={(e) => setNewChallan({ ...newChallan, notes: e.target.value })}
                  className="text-xs h-8 rounded-xl"
                />
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 bg-muted/40 border border-border/60 rounded-2xl flex justify-between items-center mt-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Net Total Payable:</span>
              <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                Rs. {calculatedChallanTotal.toLocaleString()}
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIssueChallanOpen(false)} className="rounded-xl text-xs h-9">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-9 gap-1.5 shadow-md">
                <Check className="w-4 h-4" /> Issue Voucher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          🖨️ BEAUTIFUL 2-SIDED LANDSCAPE PRINTABLE FEE VOUCHER DIALOG
          ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={isChallanModalOpen} onOpenChange={setChallanModalOpen}>
        <DialogContent className="max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-3">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" /> Printable 2-Side Landscape Fee Voucher
              </DialogTitle>
              <DialogDescription className="text-xs">
                Bank Copy & School/Student Copy side-by-side landscape format.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => { setChallanModalOpen(false); setEditVoucherOpen(true); }}
                className="text-xs h-9 font-bold rounded-xl gap-1.5 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
              >
                <Edit3 className="w-4 h-4" /> Edit Voucher Details
              </Button>
              <Button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 rounded-xl text-xs h-9 shadow-md"
              >
                <Printer className="w-4 h-4" /> Print PDF Voucher
              </Button>
            </div>
          </DialogHeader>

          {selectedRecord && (() => {
            const dynamicArrears = calculateStudentArrears(selectedRecord.student_id || undefined, selectedRecord.student_name);
            const displayArrears = Number(selectedRecord.arrears || 0) > 0 ? Number(selectedRecord.arrears) : dynamicArrears;
            const hasArrearsIncluded = Number(selectedRecord.arrears || 0) > 0;
            const netPayableWithArrears = Number(selectedRecord.total_amount || 0) + (hasArrearsIncluded ? 0 : dynamicArrears);

            return (
              <div className="pt-4 space-y-6">
                {/* PRINTABLE CONTAINER (2-SIDE LANDSCAPE) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                  
                  {/* 📄 COPY 1: BANK / SCHOOL COPY */}
                  <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 space-y-3 relative">
                    <Badge className="absolute top-3 right-3 bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                      BANK / SCHOOL COPY
                    </Badge>

                    {/* Header */}
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h3 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400">Pioneer International Islamic School System</h3>
                      <p className="text-[10px] text-slate-500">Official Bank Collection Challan Voucher</p>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1">Bank: HBL Main Branch • A/C # 1234-5678-9012</p>
                    </div>

                    {/* Student Meta */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Challan #:</span>
                        <span className="font-mono font-bold text-emerald-600">{selectedRecord.challan_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student Name:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{selectedRecord.student_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Class & Section:</span>
                        <span className="font-semibold">{selectedRecord.class_name} ({selectedRecord.section || 'A'})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Billing Month:</span>
                        <span className="font-semibold">{selectedRecord.month_year}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1 text-[10px]">
                        <span className="text-slate-500">Issue Date: 01 {selectedRecord.month_year}</span>
                        <span className="text-rose-600 font-bold">Due Date: 10 {selectedRecord.month_year}</span>
                      </div>
                    </div>

                    {/* Fee Table */}
                    <table className="w-full text-[10px] border-collapse border border-slate-200 dark:border-slate-700">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <th className="border border-slate-200 dark:border-slate-700 p-1 text-left">Fee Head</th>
                          <th className="border border-slate-200 dark:border-slate-700 p-1 text-right">Amount (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-200 dark:border-slate-700 p-1">Tuition Fee</td>
                          <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">{Number(selectedRecord.tuition_fee).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-200 dark:border-slate-700 p-1">Lab / Computer Charges</td>
                          <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">{Number(selectedRecord.lab_fee).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-200 dark:border-slate-700 p-1">Exam Fee</td>
                          <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">{Number(selectedRecord.exam_fee).toLocaleString()}</td>
                        </tr>
                        {(selectedRecord.custom_fields || []).map((f) => (
                          <tr key={f.id}>
                            <td className="border border-slate-200 dark:border-slate-700 p-1">{f.name}</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">{Number(f.amount).toLocaleString()}</td>
                          </tr>
                        ))}
                        {displayArrears > 0 && (
                          <tr className="text-amber-600 font-semibold bg-amber-500/5">
                            <td className="border border-slate-200 dark:border-slate-700 p-1">Previous Arrears (Unpaid Dues)</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">Rs. {Number(displayArrears).toLocaleString()}</td>
                          </tr>
                        )}
                        {selectedRecord.discount > 0 && (
                          <tr className="text-emerald-600 font-semibold bg-emerald-500/5">
                            <td className="border border-slate-200 dark:border-slate-700 p-1">Kinship Concession / Discount</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">- Rs. {Number(selectedRecord.discount).toLocaleString()}</td>
                          </tr>
                        )}
                        <tr className="bg-slate-100 dark:bg-slate-800 font-extrabold text-[11px]">
                          <td className="border border-slate-200 dark:border-slate-700 p-1 text-emerald-800 dark:text-emerald-400">Net Payable Amount</td>
                          <td className="border border-slate-200 dark:border-slate-700 p-1 text-right text-emerald-800 dark:text-emerald-400 font-mono">Rs. {Number(netPayableWithArrears).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Stamp & Sign Footer */}
                    <div className="flex justify-between items-end pt-4 text-[9px] text-slate-400">
                      <div className="border-t border-slate-300 w-24 text-center pt-1">Cashier Stamp</div>
                      <div className="border-t border-slate-300 w-24 text-center pt-1">Depositor Sign</div>
                    </div>
                  </div>

                  {/* 📄 COPY 2: STUDENT / PARENT COPY */}
                  <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 space-y-3 relative">
                    <Badge className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider">
                      STUDENT / PARENT COPY
                    </Badge>

                    {/* Header */}
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h3 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400">Pioneer International Islamic School System</h3>
                      <p className="text-[10px] text-slate-500">Official Student Fee Payment Receipt</p>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1">Bank: HBL Main Branch • A/C # 1234-5678-9012</p>
                    </div>

                    {/* Student Meta */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Challan #:</span>
                        <span className="font-mono font-bold text-emerald-600">{selectedRecord.challan_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student Name:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{selectedRecord.student_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Parent / Guardian:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {registeredStudents.find(s => s.Name === selectedRecord.student_name)?.parentName || `Mr./Mrs. ${selectedRecord.student_name.split(' ')[0]} Guardian`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Class & Section:</span>
                        <span className="font-semibold">{selectedRecord.class_name} ({selectedRecord.section || 'A'})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Billing Month:</span>
                        <span className="font-semibold">{selectedRecord.month_year}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1 text-[10px]">
                        <span className="text-slate-500">Issue Date: 01 {selectedRecord.month_year}</span>
                        <span className="text-rose-600 font-bold">Due Date: 10 {selectedRecord.month_year}</span>
                      </div>
                    </div>

                    {/* Fee Table */}
                    <table className="w-full text-[10px] border-collapse border border-slate-200 dark:border-slate-700">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <th className="border border-slate-200 dark:border-slate-700 p-1 text-left">Fee Head</th>
                          <th className="border border-slate-200 dark:border-slate-700 p-1 text-right">Amount (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-200 dark:border-slate-700 p-1">Tuition Fee</td>
                          <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">{Number(selectedRecord.tuition_fee).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-200 dark:border-slate-700 p-1">Lab / Computer Charges</td>
                          <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">{Number(selectedRecord.lab_fee).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-200 dark:border-slate-700 p-1">Exam Fee</td>
                          <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">{Number(selectedRecord.exam_fee).toLocaleString()}</td>
                        </tr>
                        {(selectedRecord.custom_fields || []).map((f) => (
                          <tr key={f.id}>
                            <td className="border border-slate-200 dark:border-slate-700 p-1">{f.name}</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">{Number(f.amount).toLocaleString()}</td>
                          </tr>
                        ))}
                        {displayArrears > 0 && (
                          <tr className="text-amber-600 font-semibold bg-amber-500/5">
                            <td className="border border-slate-200 dark:border-slate-700 p-1">Previous Arrears (Unpaid Dues)</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">Rs. {Number(displayArrears).toLocaleString()}</td>
                          </tr>
                        )}
                        {selectedRecord.discount > 0 && (
                          <tr className="text-emerald-600 font-semibold bg-emerald-500/5">
                            <td className="border border-slate-200 dark:border-slate-700 p-1">Kinship Concession / Discount</td>
                            <td className="border border-slate-200 dark:border-slate-700 p-1 text-right font-mono">- Rs. {Number(selectedRecord.discount).toLocaleString()}</td>
                          </tr>
                        )}
                        <tr className="bg-slate-100 dark:bg-slate-800 font-extrabold text-[11px]">
                          <td className="border border-slate-200 dark:border-slate-700 p-1 text-emerald-800 dark:text-emerald-400">Net Payable Amount</td>
                          <td className="border border-slate-200 dark:border-slate-700 p-1 text-right text-emerald-800 dark:text-emerald-400 font-mono">Rs. {Number(netPayableWithArrears).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Stamp & Sign Footer */}
                    <div className="flex justify-between items-end pt-4 text-[9px] text-slate-400">
                      <div className="border-t border-slate-300 w-24 text-center pt-1">School Officer Stamp</div>
                      <div className="border-t border-slate-300 w-24 text-center pt-1">Student Copy</div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* EDIT / ADD CLASS FEE TARIFF DIALOG */}
      <Dialog open={isEditStructureOpen} onOpenChange={setEditStructureOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Settings2 className="w-5 h-5 text-emerald-600" /> {editingStructure?.id.startsWith('struct-') ? 'Edit Class Tariff' : 'Add New Class Tariff'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure base tuition, lab, exam fees, and sibling discount percentage.
            </DialogDescription>
          </DialogHeader>

          {editingStructure && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payload = {
                  class_name: editingStructure.class_name,
                  tuition_fee: Number(editingStructure.tuition_fee),
                  admission_fee: Number(editingStructure.admission_fee || 0),
                  exam_fee: Number(editingStructure.exam_fee || 0),
                  lab_fee: Number(editingStructure.lab_fee || 0),
                  custom_fields: editingStructure.custom_fields || [],
                  is_public: editingStructure.is_public ?? true,
                  kinship_enabled: editingStructure.kinship_enabled ?? true,
                  kinship_discount_percent: Number(editingStructure.kinship_discount_percent || 25),
                };

                const existingIndex = feeStructures.findIndex(s => s.id === editingStructure.id);
                if (existingIndex >= 0) {
                  await supabase.from('fee_structures').update(payload).eq('id', editingStructure.id);
                  setFeeStructures(prev => prev.map(s => s.id === editingStructure.id ? { ...s, ...payload } : s));
                } else {
                  const newStruct = { id: `struct-${Date.now()}`, ...payload };
                  await supabase.from('fee_structures').insert([newStruct]);
                  setFeeStructures([newStruct, ...feeStructures]);
                }

                setEditStructureOpen(false);
                toast({ title: "Class Tariff Saved! ⚙️", description: `Updated fee structure for ${editingStructure.class_name}.` });
              } catch (err: any) {
                toast({ title: "Save Error", description: err.message, variant: "destructive" });
              }
            }} className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Class Grade Name *</Label>
                <Input
                  required
                  value={editingStructure.class_name}
                  onChange={(e) => setEditingStructure({ ...editingStructure, class_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Monthly Tuition Fee *</Label>
                  <Input
                    type="number"
                    required
                    value={editingStructure.tuition_fee}
                    onChange={(e) => setEditingStructure({ ...editingStructure, tuition_fee: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Admission Fee</Label>
                  <Input
                    type="number"
                    value={editingStructure.admission_fee}
                    onChange={(e) => setEditingStructure({ ...editingStructure, admission_fee: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Lab / Computer Charges</Label>
                  <Input
                    type="number"
                    value={editingStructure.lab_fee}
                    onChange={(e) => setEditingStructure({ ...editingStructure, lab_fee: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Exam Fee</Label>
                  <Input
                    type="number"
                    value={editingStructure.exam_fee}
                    onChange={(e) => setEditingStructure({ ...editingStructure, exam_fee: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">Class-wide Custom Charges (e.g., Tech Fee, Sports)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingStructure({
                      ...editingStructure,
                      custom_fields: [...(editingStructure.custom_fields || []), { id: `cf-${Date.now()}`, name: "Technology Fee", amount: 300 }]
                    })}
                    className="h-6 text-[10px] text-emerald-600 font-bold gap-1 p-0 hover:bg-transparent"
                  >
                    <Plus className="w-3 h-3" /> Add Charge Head
                  </Button>
                </div>

                {(editingStructure.custom_fields || []).map((field, idx) => (
                  <div key={field.id || idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Charge Name (e.g., Sports Fee)"
                      value={field.name}
                      onChange={(e) => {
                        const updated = [...(editingStructure.custom_fields || [])];
                        updated[idx].name = e.target.value;
                        setEditingStructure({ ...editingStructure, custom_fields: updated });
                      }}
                      className="text-xs flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={field.amount}
                      onChange={(e) => {
                        const updated = [...(editingStructure.custom_fields || [])];
                        updated[idx].amount = Number(e.target.value);
                        setEditingStructure({ ...editingStructure, custom_fields: updated });
                      }}
                      className="text-xs w-28 font-mono"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingStructure({
                        ...editingStructure,
                        custom_fields: (editingStructure.custom_fields || []).filter((_, i) => i !== idx)
                      })}
                      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 border p-3 rounded-xl bg-muted/20">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Sibling Concession (%)</Label>
                  <Input
                    type="number"
                    value={editingStructure.kinship_discount_percent ?? 25}
                    onChange={(e) => setEditingStructure({ ...editingStructure, kinship_discount_percent: Number(e.target.value) })}
                  />
                </div>

                <div className="flex flex-col justify-center items-start gap-1">
                  <Label className="text-xs font-bold">Kinship Active</Label>
                  <Switch
                    checked={editingStructure.kinship_enabled ?? true}
                    onCheckedChange={(checked) => setEditingStructure({ ...editingStructure, kinship_enabled: checked })}
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditStructureOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Save Class Tariff
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT EXISTING VOUCHER DIALOG */}
      <Dialog open={isEditVoucherOpen} onOpenChange={setEditVoucherOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl max-h-[92vh] overflow-y-auto p-6 bg-background border-border/80 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground font-headline">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <Edit3 className="w-5 h-5" />
              </div>
              Edit Fee Voucher #{selectedRecord?.challan_number}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Modify any line item, discount, arrears, or student information before printing or saving.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const tuition = Number(selectedRecord.tuition_fee || 0);
                const lab = Number(selectedRecord.lab_fee || 0);
                const exam = Number(selectedRecord.exam_fee || 0);
                const arrears = Number(selectedRecord.arrears || 0);
                const discount = Number(selectedRecord.discount || 0);
                const customTotal = (selectedRecord.custom_fields || []).reduce((sum, f) => sum + Number(f.amount || 0), 0);

                const netTotal = Math.max(0, tuition + lab + exam + arrears + customTotal - discount);

                const updatedRecord = {
                  ...selectedRecord,
                  total_amount: netTotal,
                };

                const { error } = await supabase.from('fees').update({
                  student_name: selectedRecord.student_name,
                  class_name: selectedRecord.class_name,
                  section: selectedRecord.section,
                  month_year: selectedRecord.month_year,
                  tuition_fee: tuition,
                  lab_fee: lab,
                  exam_fee: exam,
                  arrears: arrears,
                  discount: discount,
                  total_amount: netTotal,
                  notes: selectedRecord.notes,
                  custom_fields: selectedRecord.custom_fields || [],
                }).eq('id', selectedRecord.id);

                if (error) throw error;

                setFeeRecords(prev => prev.map(r => r.id === selectedRecord.id ? updatedRecord : r));
                setEditVoucherOpen(false);
                toast({ title: "Voucher Updated! ✏️", description: `Updated challan #${selectedRecord.challan_number} for ${selectedRecord.student_name}.` });
              } catch (err: any) {
                toast({ title: "Update Failed", description: err.message, variant: "destructive" });
              }
            }} className="space-y-4 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Student Full Name *</Label>
                  <Input
                    required
                    value={selectedRecord.student_name}
                    onChange={(e) => setSelectedRecord({ ...selectedRecord, student_name: e.target.value })}
                    className="text-xs h-9 rounded-xl font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Billing Month *</Label>
                  <Input
                    required
                    value={selectedRecord.month_year}
                    onChange={(e) => setSelectedRecord({ ...selectedRecord, month_year: e.target.value })}
                    className="text-xs h-9 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Tuition Fee</Label>
                  <Input
                    type="number"
                    value={selectedRecord.tuition_fee}
                    onChange={(e) => setSelectedRecord({ ...selectedRecord, tuition_fee: Number(e.target.value) })}
                    className="text-xs h-9 font-mono font-bold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Lab Charges</Label>
                  <Input
                    type="number"
                    value={selectedRecord.lab_fee}
                    onChange={(e) => setSelectedRecord({ ...selectedRecord, lab_fee: Number(e.target.value) })}
                    className="text-xs h-9 font-mono font-bold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Exam Fee</Label>
                  <Input
                    type="number"
                    value={selectedRecord.exam_fee}
                    onChange={(e) => setSelectedRecord({ ...selectedRecord, exam_fee: Number(e.target.value) })}
                    className="text-xs h-9 font-mono font-bold rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] text-amber-600 font-semibold">Previous Arrears</Label>
                  <Input
                    type="number"
                    value={selectedRecord.arrears}
                    onChange={(e) => setSelectedRecord({ ...selectedRecord, arrears: Number(e.target.value) })}
                    className="text-xs h-9 font-mono font-bold rounded-xl text-amber-600 border-amber-500/30 bg-amber-500/5"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-emerald-600 font-semibold">Concession / Discount</Label>
                  <Input
                    type="number"
                    value={selectedRecord.discount}
                    onChange={(e) => setSelectedRecord({ ...selectedRecord, discount: Number(e.target.value) })}
                    className="text-xs h-9 font-mono font-bold rounded-xl text-emerald-600 border-emerald-500/30 bg-emerald-500/5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Notes / Concession Reason</Label>
                <Input
                  value={selectedRecord.notes || ''}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, notes: e.target.value })}
                  className="text-xs h-8 rounded-xl"
                />
              </div>

              <div className="p-4 bg-muted/40 border border-border/60 rounded-2xl flex justify-between items-center mt-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recalculated Net Total:</span>
                <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  Rs. {(
                    Number(selectedRecord.tuition_fee || 0) +
                    Number(selectedRecord.lab_fee || 0) +
                    Number(selectedRecord.exam_fee || 0) +
                    Number(selectedRecord.arrears || 0) +
                    (selectedRecord.custom_fields || []).reduce((s, f) => s + Number(f.amount || 0), 0) -
                    Number(selectedRecord.discount || 0)
                  ).toLocaleString()}
                </span>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditVoucherOpen(false)} className="rounded-xl text-xs h-9">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-9 gap-1.5 shadow-md">
                  <Check className="w-4 h-4" /> Save Voucher Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Unified Dual Excel Pre-Import Confirmation Modal ────────────────── */}
      <Dialog open={isDualImportOpen} onOpenChange={setIsDualImportOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground font-headline">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Pre-Import Summary & Auto-Detection Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review auto-detected classes, standard tariffs, and individual student custom discounts before importing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <p className="text-xl font-black text-emerald-600 font-mono">{dualImportSummaries.length}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Excel Files</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <p className="text-xl font-black text-blue-600 font-mono">
                  {dualImportSummaries.reduce((sum, f) => sum + f.totalStudents, 0)}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Students</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <p className="text-xl font-black text-amber-600 font-mono">
                  {dualImportSummaries.reduce((sum, f) => sum + f.totalDiscountedStudents, 0)}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Custom Discounts</p>
              </div>
            </div>

            <div className="space-y-3">
              {dualImportSummaries.map((summary, idx) => (
                <div key={idx} className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground truncate max-w-[200px]">{summary.fileName}</span>
                    <Badge className="bg-emerald-600 text-white text-[10px] font-mono">
                      {summary.detectedClass} (Sec {summary.detectedSection})
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground pt-1">
                    <div>Month: <span className="font-bold text-foreground">{summary.detectedMonth}</span></div>
                    <div>Std Tariff: <span className="font-bold text-emerald-600 font-mono">Rs. {summary.standardTuition.toLocaleString()}</span></div>
                    <div>Discounts: <span className="font-bold text-amber-600">{summary.totalDiscountedStudents} Students</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDualImportOpen(false)}
              className="rounded-xl text-xs h-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExecuteDualImport}
              disabled={isDualImportProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-10 gap-2 shadow-md px-5"
            >
              {isDualImportProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Confirm & Execute Dual Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
