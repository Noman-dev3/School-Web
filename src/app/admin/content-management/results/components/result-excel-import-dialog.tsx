"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet, Download, FileUp, Loader2, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";

export function ResultExcelImportDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Student ID": "1001",
        "Roll Number": "1001",
        "Student Name": "Muhammad Ali",
        "Class": "Grade 10",
        "Session": "Mid Term 2026",
        "Max Marks Per Subject": 100,
        "English": 85,
        "Mathematics": 92,
        "Science": 88,
        "Urdu": 78,
        "Computer": 95
      },
      {
        "Student ID": "1002",
        "Roll Number": "1002",
        "Student Name": "Ayesha Khan",
        "Class": "Grade 10",
        "Session": "Mid Term 2026",
        "Max Marks Per Subject": 100,
        "English": 90,
        "Mathematics": 88,
        "Science": 94,
        "Urdu": 85,
        "Computer": 98
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths for readability
    worksheet["!cols"] = [
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 14 },
      { wch: 18 },
      { wch: 22 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results Template");
    XLSX.writeFile(workbook, "School_Academic_Results_Template.xlsx");

    toast({
      title: "Template Downloaded! 📄",
      description: "Use this Excel template to record exam marks and auto-link to students."
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select an Excel (.xlsx, .xls) or CSV file.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch all existing students for auto-linking
      const { data: dbStudents } = await supabase.from('students').select('*');
      const studentsList = dbStudents || [];

      // 2. Read the uploaded file with XLSX
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (rawRows.length === 0) {
        throw new Error("The uploaded Excel file contains no data rows.");
      }

      const metaHeaders = [
        "student id", "studentid", "id", "roll number", "rollno", "roll", "roll_number",
        "student name", "studentname", "name", "class", "grade", "session", "term",
        "max marks per subject", "maxmarks", "max_marks", "total marks", "total_marks"
      ];

      const resultsToInsert: any[] = [];
      let linkedCount = 0;

      for (const row of rawRows) {
        const rowKeys = Object.keys(row);
        
        // Extract meta fields using fuzzy key matching
        const rawId = String(row["Student ID"] || row["studentid"] || row["ID"] || row["id"] || "").trim();
        const rawRoll = String(row["Roll Number"] || row["rollno"] || row["Roll"] || row["roll_number"] || "").trim();
        const rawName = String(row["Student Name"] || row["studentname"] || row["Name"] || "").trim();
        const rawClass = String(row["Class"] || row["Grade"] || row["class"] || "").trim();
        const session = String(row["Session"] || row["Term"] || `${new Date().getFullYear()} Annual`).trim();

        if (!rawId && !rawRoll && !rawName) continue; // Skip completely empty rows

        // Auto-link to existing student in database
        let matchedStudent = studentsList.find(s => 
          (rawId && String(s.id).trim() === rawId) || 
          (rawRoll && String(s.id).trim() === rawRoll)
        );

        if (!matchedStudent && rawName && rawClass) {
          matchedStudent = studentsList.find(s => 
            s.Name.toLowerCase().trim() === rawName.toLowerCase() &&
            s.Class?.toLowerCase().trim() === rawClass.toLowerCase()
          );
        }

        if (matchedStudent) linkedCount++;

        const studentId = matchedStudent ? String(matchedStudent.id) : (rawId || rawRoll || `STU-${Math.floor(1000 + Math.random() * 9000)}`);
        const studentName = matchedStudent ? matchedStudent.Name : (rawName || "Unknown Student");
        const studentClass = matchedStudent ? matchedStudent.Class : (rawClass || "Grade 1");
        const rollNumber = matchedStudent ? String(matchedStudent.id) : (rawRoll || rawId || "0000");

        // Parse dynamic subjects & marks
        const subjectsJson: Record<string, number> = {};
        let totalObtained = 0;
        let subjectCount = 0;

        const defaultMaxMarks = Number(row["Max Marks Per Subject"] || row["max_marks"] || 100);

        rowKeys.forEach(k => {
          const cleanKey = k.toLowerCase().trim();
          if (!metaHeaders.includes(cleanKey) && row[k] !== "") {
            const markVal = Number(row[k]);
            if (!isNaN(markVal)) {
              subjectsJson[k.trim()] = markVal;
              totalObtained += markVal;
              subjectCount++;
            }
          }
        });

        const totalMaxMarks = subjectCount > 0 ? (subjectCount * defaultMaxMarks) : Number(row["total_marks"] || 100);
        if (subjectCount === 0 && Number(row["total_marks"])) {
          subjectsJson["General"] = Number(row["total_marks"]);
          totalObtained = Number(row["total_marks"]);
        }

        const percentage = totalMaxMarks > 0 ? Number(((totalObtained / totalMaxMarks) * 100).toFixed(2)) : 0;

        let grade = "F";
        if (percentage >= 80) grade = "A+";
        else if (percentage >= 70) grade = "A";
        else if (percentage >= 60) grade = "B";
        else if (percentage >= 50) grade = "C";

        // Omit string id to avoid bigint postgres type mismatch error
        resultsToInsert.push({
          student_id: studentId,
          student_name: studentName,
          roll_number: rollNumber,
          class: studentClass,
          session: session,
          subjects: subjectsJson,
          total_marks: totalObtained,
          max_marks: totalMaxMarks,
          percentage: percentage,
          grade: grade,
          date_created: new Date().toISOString()
        });
      }

      if (resultsToInsert.length === 0) {
        throw new Error("No valid result records found in file.");
      }

      const { error } = await supabase.from('results').insert(resultsToInsert);
      if (error) throw error;

      toast({
        title: "Academic Results Imported! 🎉",
        description: `Imported ${resultsToInsert.length} exam records (${linkedCount} auto-linked to students).`
      });

      if (onSuccess) onSuccess();
      setOpen(false);
      setFile(null);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Import Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs h-9 px-3.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 shadow-xs font-semibold">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Import Results (XLS / CSV)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Import Academic Results Excel
          </DialogTitle>
          <DialogDescription className="text-xs">
            Upload an Excel (.xlsx, .xls) or CSV sheet. Results will be <strong>automatically linked</strong> to existing students by Student ID or Roll Number!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="p-4 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">Need the standard format?</p>
              <p className="text-[11px] text-muted-foreground">Download the official template with pre-built student key columns.</p>
            </div>
            <Button size="sm" variant="secondary" onClick={handleDownloadTemplate} className="h-8 text-xs gap-1.5 rounded-lg shrink-0 font-semibold">
              <Download className="w-3.5 h-3.5 text-emerald-600" /> Template
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="results-file" className="text-xs font-bold">Select Excel / CSV File</Label>
            <Input
              id="results-file"
              type="file"
              accept=".xlsx, .xls, .csv"
              className="text-xs rounded-xl"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {file && (
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Ready to import: {file.name}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-9 text-xs">Cancel</Button>
          <Button disabled={!file || loading} onClick={handleImport} className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
            {loading ? "Importing & Linking..." : "Start Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
