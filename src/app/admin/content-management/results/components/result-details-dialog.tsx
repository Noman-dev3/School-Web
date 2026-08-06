"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Result } from "../data/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Trash2, Award, Percent, Calendar } from "lucide-react";
import { getSettings } from "@/lib/data-fetching";
import { generateResultDocumentBlob } from "@/lib/docx-generator";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

interface ResultDetailsDialogProps {
  result: Result;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
}

export function ResultDetailsDialog({ result, isOpen, onOpenChange, onDeleteSuccess }: ResultDetailsDialogProps) {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const { toast } = useToast();

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      const settings = await getSettings();
      const schoolInfo = {
        schoolName: settings.schoolName || "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
        tagline: settings.tagline || "Excellence in Academic Rigor & Timeless Values",
        address: settings.contactAddress || "Sector H-8/4, Educational Zone, Islamabad, Pakistan",
        phone: settings.contactPhone || "+92 51 111 222 333",
        email: settings.contactEmail || "info@piiss.edu.pk",
        logoUrl: settings.logoUrl || undefined
      };

      const blob = await generateResultDocumentBlob(result, schoolInfo);
      const safeName = result.student_name.replace(/[^a-zA-Z0-9]/g, "_");
      const safeClass = result.class.replace(/[^a-zA-Z0-9]/g, "_");
      saveAs(blob, `Report_Card_${safeClass}_${safeName}.docx`);

      toast({
        title: "Official DOCX Report Downloaded! 📄",
        description: `Exported Word report card for ${result.student_name}.`,
      });
    } catch (err: any) {
      console.error("DOCX download error:", err);
      toast({
        title: "Export Error",
        description: err.message || "Could not generate DOCX report card.",
        variant: "destructive",
      });
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('results').delete().eq('id', result.id);
      if (error) throw error;
      toast({
        title: "Result Deleted",
        description: `Result record for ${result.student_name} has been removed.`,
      });
      onOpenChange(false);
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (error: any) {
      toast({
        title: "Delete Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const gradeColor = 
    result.grade === "A+" || result.grade === "A" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" :
    result.grade === "B" || result.grade === "C" ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30" :
    "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-muted/20 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-xl font-bold font-headline">{result.student_name}</DialogTitle>
                <Badge className={`text-xs font-bold ${gradeColor}`}>
                  Grade {result.grade}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Roll No: <strong className="text-foreground">{result.roll_number}</strong></span>
                <span>•</span>
                <span>Class: <strong className="text-foreground">{result.class}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {result.session || "Annual Exam"}</span>
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownloadDocx}
                disabled={downloadingDocx}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold text-xs h-9 px-4 shadow-sm"
              >
                {downloadingDocx ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                <span>Export Official DOCX</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-bold">Delete Result Record?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs">
                      Are you sure you want to delete the result for <strong>{result.student_name}</strong>? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl text-xs font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="rounded-xl text-xs bg-rose-600 hover:bg-rose-500 font-bold">
                      Delete Result
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Performance Card */}
          <div className="bg-muted/30 p-4 rounded-2xl border border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Percentage</p>
              <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{result.percentage}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Obtained Marks</p>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{result.total_marks}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Maximum Marks</p>
              <p className="text-xl font-extrabold text-foreground font-mono">{result.max_marks}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Grade Outcome</p>
              <p className="text-xl font-extrabold text-foreground font-mono">{result.grade}</p>
            </div>
          </div>

          {/* Subject Wise breakdown with progress bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" /> Subject-wise Performance Breakdown
            </h4>
            <div className="space-y-2.5">
              {Object.entries(result.subjects).map(([subject, marks]) => {
                const numMarks = Number(marks || 0);
                const pct = Math.min(100, Math.max(0, numMarks));
                const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500";

                return (
                  <div key={subject} className="bg-muted/40 p-3 rounded-xl border border-border/40 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">{subject}</span>
                      <span className="font-mono font-extrabold text-foreground">{numMarks} <span className="text-[10px] text-muted-foreground font-normal">/ 100</span></span>
                    </div>
                    <div className="w-full bg-muted/80 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/40 flex justify-between items-center">
            <span>Date Created: {result.date_created ? format(new Date(result.date_created), "PPP") : "N/A"}</span>
            <span>Session: {result.session || "N/A"}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
