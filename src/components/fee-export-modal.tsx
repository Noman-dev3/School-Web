"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { 
  Document, Paragraph, TextRun, Table as DocxTable, TableRow as DocxTableRow, 
  TableCell as DocxTableCell, AlignmentType, WidthType, BorderStyle, HeadingLevel, Packer 
} from "docx";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FeeRecord } from "@/app/admin/data-schemas";
import { 
  Download, FileSpreadsheet, FileText, Printer, FileOutput, 
  Filter, CheckCircle2, AlertTriangle, Clock, ShieldCheck, Sparkles, Building2
} from "lucide-react";

interface FeeExportModalProps {
  feeRecords: FeeRecord[];
  triggerButton?: React.ReactNode;
}

export function FeeExportModal({ feeRecords, triggerButton }: FeeExportModalProps) {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'word' | 'print' | 'csv'>('excel');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const { toast } = useToast();

  // Extract unique classes & months for filtering
  const uniqueClasses = Array.from(new Set(feeRecords.map(r => r.class_name).filter(Boolean))).sort();
  const uniqueMonths = Array.from(new Set(feeRecords.map(r => r.month_year).filter(Boolean))).sort();

  // Filtered dataset for export
  const filteredRecords = feeRecords.filter(record => {
    const matchesClass = classFilter === 'all' || record.class_name === classFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesMonth = monthFilter === 'all' || record.month_year === monthFilter;
    return matchesClass && matchesStatus && matchesMonth;
  });

  // Calculate totals for financial summary
  const totalPayable = filteredRecords.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
  const totalPaid = filteredRecords.reduce((sum, r) => sum + (Number(r.amount_paid) || 0), 0);
  const totalArrears = filteredRecords.reduce((sum, r) => sum + (Number(r.arrears) || 0), 0);
  const totalDiscounts = filteredRecords.reduce((sum, r) => sum + (Number(r.discount) || 0), 0);
  const pendingBalance = totalPayable - totalPaid;

  // 1. EXCEL EXPORT (.xlsx)
  const exportToExcel = () => {
    const dataRows = filteredRecords.map((r, i) => ({
      "S.No": i + 1,
      "Challan No": r.challan_number || `CH-${r.id}`,
      "Student Name": r.student_name,
      "Student ID": r.student_id || "N/A",
      "Class": r.class_name,
      "Section": r.section || "A",
      "Fee Month": r.month_year,
      "Tuition Fee (PKR)": r.tuition_fee || 0,
      "Lab Fee (PKR)": r.lab_fee || 0,
      "Exam Fee (PKR)": r.exam_fee || 0,
      "Arrears (PKR)": r.arrears || 0,
      "Discount (PKR)": r.discount || 0,
      "Total Amount (PKR)": r.total_amount || 0,
      "Amount Paid (PKR)": r.amount_paid || 0,
      "Balance Due (PKR)": (r.total_amount || 0) - (r.amount_paid || 0),
      "Payment Status": (r.status || 'pending').toUpperCase(),
      "Payment Date": r.payment_date || "N/A",
    }));

    // Summary Row
    const summaryRow = {
      "S.No": "TOTAL",
      "Challan No": `${filteredRecords.length} Vouchers`,
      "Student Name": "-",
      "Student ID": "-",
      "Class": "-",
      "Section": "-",
      "Fee Month": "-",
      "Tuition Fee (PKR)": filteredRecords.reduce((s, r) => s + (r.tuition_fee || 0), 0),
      "Lab Fee (PKR)": filteredRecords.reduce((s, r) => s + (r.lab_fee || 0), 0),
      "Exam Fee (PKR)": filteredRecords.reduce((s, r) => s + (r.exam_fee || 0), 0),
      "Arrears (PKR)": totalArrears,
      "Discount (PKR)": totalDiscounts,
      "Total Amount (PKR)": totalPayable,
      "Amount Paid (PKR)": totalPaid,
      "Balance Due (PKR)": pendingBalance,
      "Payment Status": "-",
      "Payment Date": "-",
    };

    const worksheet = XLSX.utils.json_to_sheet([...dataRows, summaryRow]);
    
    // Auto column widths
    const columnWidths = [
      { wch: 6 }, { wch: 15 }, { wch: 24 }, { wch: 14 }, { wch: 10 }, { wch: 8 },
      { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 14 }
    ];
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fee Ledger Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(blob, `PIISS_Fee_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({ title: "Excel Report Exported!", description: `Downloaded ${filteredRecords.length} fee records into formatted Excel file.` });
  };

  // 2. WORD DOCUMENT EXPORT (.docx)
  const exportToWord = async () => {
    const tableHeaderCells = [
      "Challan #", "Student Name", "Class", "Month", "Tuition", "Arrears", "Total (Rs)", "Paid", "Status"
    ].map(text => 
      new DocxTableCell({
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18 })], alignment: AlignmentType.CENTER })],
        shading: { fill: "0F172A" },
        width: { size: 100 / 9, type: WidthType.PERCENTAGE }
      })
    );

    const tableRows = [
      new DocxTableRow({ children: tableHeaderCells }),
      ...filteredRecords.map(r => new DocxTableRow({
        children: [
          r.challan_number || `CH-${r.id}`,
          r.student_name,
          `${r.class_name} ${r.section || 'A'}`,
          r.month_year,
          `Rs. ${Number(r.tuition_fee || 0).toLocaleString()}`,
          `Rs. ${Number(r.arrears || 0).toLocaleString()}`,
          `Rs. ${Number(r.total_amount || 0).toLocaleString()}`,
          `Rs. ${Number(r.amount_paid || 0).toLocaleString()}`,
          (r.status || 'pending').toUpperCase()
        ].map(val => new DocxTableCell({
          children: [new Paragraph({ children: [new TextRun({ text: String(val), size: 17 })], alignment: AlignmentType.CENTER })],
          width: { size: 100 / 9, type: WidthType.PERCENTAGE }
        }))
      }))
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header Title
          new Paragraph({
            text: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ bold: true, size: 28, color: "0F172A" })]
          }),
          new Paragraph({
            text: "Official Institutional Fee & Ledger Financial Report",
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ italic: true, size: 20, color: "475569" })]
          }),
          new Paragraph({ text: "" }),

          // Metadata Info Summary
          new Paragraph({
            children: [
              new TextRun({ text: `Report Date: ${new Date().toLocaleDateString()} | Total Records: ${filteredRecords.length}`, bold: true, size: 18 }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Total Receivable: Rs. ${totalPayable.toLocaleString()} | Collected: Rs. ${totalPaid.toLocaleString()} | Outstanding Balance: Rs. ${pendingBalance.toLocaleString()}`, color: "0369A1", bold: true, size: 18 }),
            ]
          }),
          new Paragraph({ text: "" }),

          // Main Table
          new DocxTable({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Official Signature Lines
          new Paragraph({
            children: [
              new TextRun({ text: "_________________________                  _________________________", bold: true }),
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "   Prepared By Accountant                             Verified By Principal / Director   ", bold: true, size: 18 }),
            ],
            alignment: AlignmentType.CENTER
          }),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `PIISS_Official_Fee_Report_${new Date().toISOString().split('T')[0]}.docx`);
    toast({ title: "Word Document Created!", description: "Official institutional Word report downloaded with letterhead and signature block." });
  };

  // 3. CSV EXPORT (.csv)
  const exportToCSV = () => {
    const headers = ["Challan No", "Student Name", "Student ID", "Class", "Section", "Fee Month", "Tuition Fee", "Lab Fee", "Exam Fee", "Arrears", "Discount", "Total Payable", "Amount Paid", "Status", "Payment Date"];
    const rows = filteredRecords.map(r => [
      `"${r.challan_number || ''}"`,
      `"${r.student_name.replace(/"/g, '""')}"`,
      `"${r.student_id || ''}"`,
      `"${r.class_name}"`,
      `"${r.section || 'A'}"`,
      `"${r.month_year}"`,
      r.tuition_fee || 0,
      r.lab_fee || 0,
      r.exam_fee || 0,
      r.arrears || 0,
      r.discount || 0,
      r.total_amount || 0,
      r.amount_paid || 0,
      `"${r.status || 'pending'}"`,
      `"${r.payment_date || ''}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PIISS_Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "CSV Exported!", description: `Downloaded CSV directory with ${filteredRecords.length} fee records.` });
  };

  // 4. PRINTABLE BANK VOUCHER / PDF
  const triggerPrintVouchers = () => {
    if (filteredRecords.length === 0) {
      toast({ title: "No Records", description: "No fee vouchers match your filter selection.", variant: "destructive" });
      return;
    }
    // Navigate to batch download voucher page with filter param
    window.open(`/fees/download?id=${filteredRecords[0].id}`, '_blank');
  };

  const handleExportExecute = () => {
    if (exportFormat === 'excel') exportToExcel();
    else if (exportFormat === 'word') exportToWord();
    else if (exportFormat === 'csv') exportToCSV();
    else if (exportFormat === 'print') triggerPrintVouchers();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 text-xs gap-1.5 font-bold shadow-md">
            <FileOutput className="h-4 w-4" />
            <span>Export Fee Records</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px] rounded-2xl border-border/80 p-6 bg-card">
        <DialogHeader className="space-y-1.5 pb-3 border-b border-border/50">
          <DialogTitle className="text-xl font-bold font-headline flex items-center gap-2 text-foreground">
            <Building2 className="w-5 h-5 text-emerald-600" /> Professional Fee Export Studio
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Export structured fee ledgers, official Word reports with signature blocks, Excel spreadsheets, or printable bank vouchers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Format Selection Cards */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Export Format</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setExportFormat('excel')}
                className={`p-3 rounded-xl border transition-all text-left space-y-1.5 ${
                  exportFormat === 'excel' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm' 
                    : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div className="text-xs font-bold text-foreground">Excel (.xlsx)</div>
                <div className="text-[10px] text-muted-foreground">Formated ledger &amp; totals</div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('word')}
                className={`p-3 rounded-xl border transition-all text-left space-y-1.5 ${
                  exportFormat === 'word' 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-sm' 
                    : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60'
                }`}
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="text-xs font-bold text-foreground">Word (.docx)</div>
                <div className="text-[10px] text-muted-foreground">Official letterhead report</div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`p-3 rounded-xl border transition-all text-left space-y-1.5 ${
                  exportFormat === 'csv' 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm' 
                    : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60'
                }`}
              >
                <FileOutput className="w-5 h-5 text-amber-600" />
                <div className="text-xs font-bold text-foreground">CSV Data (.csv)</div>
                <div className="text-[10px] text-muted-foreground">QuickBooks / Tally format</div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('print')}
                className={`p-3 rounded-xl border transition-all text-left space-y-1.5 ${
                  exportFormat === 'print' 
                    ? 'bg-violet-500/10 border-violet-500 text-violet-600 dark:text-violet-400 font-bold shadow-sm' 
                    : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60'
                }`}
              >
                <Printer className="w-5 h-5 text-violet-600" />
                <div className="text-xs font-bold text-foreground">Print Vouchers</div>
                <div className="text-[10px] text-muted-foreground">3-copy bank slip (A4)</div>
              </button>
            </div>
          </div>

          {/* Filtering Parameters */}
          <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-600" /> Filter Criteria Before Export
              </Label>
              <Badge variant="outline" className="text-[10px] font-mono font-bold bg-background text-emerald-600 border-emerald-500/30">
                {filteredRecords.length} records selected
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Class Grade</Label>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="h-8 rounded-lg text-xs bg-background">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="all">All Class Grades</SelectItem>
                    {uniqueClasses.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Payment Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 rounded-lg text-xs bg-background">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid Only</SelectItem>
                    <SelectItem value="pending">Pending Only</SelectItem>
                    <SelectItem value="overdue">Overdue Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Fee Month</Label>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="h-8 rounded-lg text-xs bg-background">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="all">All Months</SelectItem>
                    {uniqueMonths.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial Summary Preview */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 bg-background rounded-xl border border-border/50 space-y-0.5">
              <div className="text-[10px] text-muted-foreground">Total Receivable</div>
              <div className="font-extrabold text-foreground text-sm font-mono">Rs. {totalPayable.toLocaleString()}</div>
            </div>
            <div className="p-2.5 bg-background rounded-xl border border-border/50 space-y-0.5">
              <div className="text-[10px] text-emerald-600 font-semibold">Amount Collected</div>
              <div className="font-extrabold text-emerald-600 text-sm font-mono">Rs. {totalPaid.toLocaleString()}</div>
            </div>
            <div className="p-2.5 bg-background rounded-xl border border-border/50 space-y-0.5">
              <div className="text-[10px] text-rose-500 font-semibold">Balance Due</div>
              <div className="font-extrabold text-rose-500 text-sm font-mono">Rs. {pendingBalance.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/50 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl text-xs h-9 font-semibold">
            Cancel
          </Button>
          <Button 
            onClick={handleExportExecute} 
            disabled={filteredRecords.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 font-bold px-5 gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Generate &amp; Download Report</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
