"use client";

import { useState } from "react";
import { Result } from "../data/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit, Trash2, Trophy, Percent, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getSettings } from "@/lib/data-fetching";
import { generateResultDocumentBlob } from "@/lib/docx-generator";
import { saveAs } from "file-saver";
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
import { ResultDetailsDialog } from "./result-details-dialog";
import { EditResultDialog } from "./edit-result-dialog";
import { supabase } from "@/lib/supabase";

interface ResultCardProps {
  result: Result;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDeleteSuccess?: () => void;
}

export function ResultCard({ result, isSelected = false, onToggleSelect, onDeleteSuccess }: ResultCardProps) {
  const { toast } = useToast();
  const [isViewOpen, setViewOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('results').delete().eq('id', result.id);
      if (error) throw error;
      toast({
        title: "Result Deleted",
        description: `Result for ${result.student_name} has been permanently deleted.`,
      });
      if (onDeleteSuccess) onDeleteSuccess();
    } catch(error) {
      toast({
        title: "Error Deleting Result",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocx = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
        description: `Downloaded Word report card for ${result.student_name}.`,
      });
    } catch (err: any) {
      console.error("DOCX download error:", err);
      toast({
        title: "Export Failed",
        description: err.message || "Could not generate DOCX report card.",
        variant: "destructive",
      });
    } finally {
      setDownloadingDocx(false);
    }
  };

  const gradeColor = 
    result.grade === "A+" || result.grade === "A" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
    result.grade === "B" || result.grade === "C" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" :
    "bg-rose-500/10 text-rose-600 border-rose-500/30";

  return (
    <>
    <div className="group relative">
      <Card className={`h-full transition-all duration-300 border-border/80 ${
        isSelected ? 'ring-2 ring-emerald-500 bg-emerald-500/5 shadow-md' : 'bg-card hover:border-primary/40 shadow-xs'
      }`}>
        {onToggleSelect && (
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              className="h-4 w-4 rounded-md border-border/80 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
          </div>
        )}
        <CardHeader className="items-center text-center p-4 pt-5 space-y-1">
          <CardTitle className="text-base font-bold font-headline text-foreground line-clamp-1">
            {result.student_name}
          </CardTitle>
          <p className="text-xs text-muted-foreground font-mono">Roll No: {result.roll_number}</p>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-muted/40 text-[11px] font-medium border-border/60">
              {result.class}
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-semibold">
              {result.session || "Annual Exam"}
            </Badge>
          </div>

          <div className="flex justify-center items-center gap-2 text-xs">
            {result.rank && (
              <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Trophy className="h-3.5 w-3.5" />
                <span>Rank {result.rank}</span>
              </div>
            )}
            <div className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border ${gradeColor}`}>
              <span>Grade {result.grade}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
              <Percent className="h-3.5 w-3.5" />
              <span>{result.percentage}%</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-1 p-3 pt-0 border-t border-border/40 mt-2">
          <Button variant="ghost" size="sm" onClick={() => setViewOpen(true)} className="h-8 text-xs px-2.5 rounded-lg gap-1 font-semibold">
            <User className="h-3.5 w-3.5" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
            title="Download Official DOCX Report"
            className="h-8 text-xs px-2.5 rounded-lg border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 gap-1 font-bold"
          >
            {downloadingDocx ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span>DOCX</span>
          </Button>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditOpen(true)}>
              <Edit className="h-3.5 w-3.5 text-blue-500" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-500 hover:bg-rose-500/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base font-bold">Delete Result Record?</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs">
                    This will permanently delete the result for <strong>{result.student_name}</strong> from the database.
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
        </CardFooter>
      </Card>
    </div>

    {isViewOpen && <ResultDetailsDialog result={result} isOpen={isViewOpen} onOpenChange={setViewOpen} onDeleteSuccess={onDeleteSuccess} />}
    {isEditOpen && <EditResultDialog result={result} isOpen={isEditOpen} onOpenChange={setEditOpen} />}
    </>
  );
}
