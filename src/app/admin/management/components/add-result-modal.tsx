"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, Plus, Loader2 } from "lucide-react";
import { Student } from "../../students/data/schema";
import { Result } from "../../data-schemas";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AddResultModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
  onSuccess: () => void;
}

export function AddResultModal({ isOpen, onOpenChange, student, onSuccess }: AddResultModalProps) {
  const [session, setSession] = useState("Mid Term 2026");
  const [subjects, setSubjects] = useState<{name: string, max: number, obtained: number}[]>([
    { name: 'English', max: 100, obtained: 0 },
    { name: 'Math', max: 100, obtained: 0 },
    { name: 'Science', max: 100, obtained: 0 },
  ]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen && student.Class) {
      const fetchTemplate = async () => {
        const { data, error } = await supabase
          .from('result_templates')
          .select('subjects')
          .eq('class_name', student.Class)
          .maybeSingle();

        if (data && data.subjects && data.subjects.length > 0) {
           const templatedSubjects = data.subjects.map((s: any) => ({
             name: s.name,
             max: s.maxMarks || 100,
             obtained: 0
           }));
           setSubjects(templatedSubjects);
        } else {
           // Reset to default if no template
           setSubjects([
            { name: 'English', max: 100, obtained: 0 },
            { name: 'Math', max: 100, obtained: 0 },
            { name: 'Science', max: 100, obtained: 0 },
          ]);
        }
      };
      fetchTemplate();
    }
  }, [isOpen, student.Class]);

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: '', max: 100, obtained: 0 }]);
  };

  const updateSubject = (index: number, key: 'name'|'max'|'obtained', value: any) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [key]: value };
    setSubjects(updated);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const validSubjects = subjects.filter(s => s.name.trim() !== '');
      if (validSubjects.length === 0) throw new Error("Please add at least one subject.");

      const totalMax = validSubjects.reduce((sum, s) => sum + Number(s.max), 0);
      const totalObtained = validSubjects.reduce((sum, s) => sum + Number(s.obtained), 0);
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      
      let grade = "F";
      if (percentage >= 80) grade = "A+";
      else if (percentage >= 70) grade = "A";
      else if (percentage >= 60) grade = "B";
      else if (percentage >= 50) grade = "C";

      const subjectsJson = validSubjects.reduce((acc: any, s) => {
        acc[s.name] = Number(s.obtained);
        return acc;
      }, {});

      const newResult: Result = {
        id: `res-${Date.now()}`,
        class: student.Class || "N/A",
        date_created: new Date().toISOString(),
        grade,
        max_marks: totalMax,
        percentage: Number(percentage.toFixed(2)),
        roll_number: student.id,
        session: session,
        student_id: String(student.id),
        student_name: student.Name,
        subjects: subjectsJson,
        total_marks: totalObtained,
      };

      const { error } = await supabase.from('results').insert([newResult]);
      if (error) throw error;

      toast({ title: "Result Added", description: `Added ${session} result for ${student.Name}.` });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentTotalMax = subjects.reduce((sum, s) => sum + Number(s.max || 0), 0);
  const currentTotalObtained = subjects.reduce((sum, s) => sum + Number(s.obtained || 0), 0);
  const currentPercentage = currentTotalMax > 0 ? (currentTotalObtained / currentTotalMax) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden">
        <div className="p-6 bg-muted/20 border-b border-border/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-headline">
              <Award className="w-5 h-5 text-emerald-600" />
              Add Academic Result
            </DialogTitle>
            <DialogDescription>
              Record detailed exam results for <strong className="text-emerald-600">{student.Name}</strong>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold">Exam Session / Term</Label>
            <Input
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="text-xs rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold">Subject Results</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSubject} className="h-7 text-[10px] gap-1 rounded-lg">
                <Plus className="w-3 h-3" /> Add Subject
              </Button>
            </div>
            
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-muted-foreground uppercase px-1">
              <div className="col-span-6">Subject</div>
              <div className="col-span-3 text-center">Max Marks</div>
              <div className="col-span-3 text-center">Obtained</div>
            </div>

            {subjects.map((sub, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input placeholder="Subject Name" className="h-8 text-xs rounded-lg" value={sub.name} onChange={(e) => updateSubject(index, 'name', e.target.value)} />
                </div>
                <div className="col-span-3">
                  <Input type="number" placeholder="Max" className="h-8 text-xs rounded-lg text-center" value={sub.max} onChange={(e) => updateSubject(index, 'max', Number(e.target.value))} />
                </div>
                <div className="col-span-3">
                  <Input type="number" placeholder="Obtained" className="h-8 text-xs rounded-lg text-center" value={sub.obtained} onChange={(e) => updateSubject(index, 'obtained', Number(e.target.value))} />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-500 rounded-lg" onClick={() => removeSubject(index)}>X</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Score</p>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {currentTotalObtained} <span className="text-sm text-muted-foreground">/ {currentTotalMax}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Percentage</p>
              <p className="text-xl font-extrabold text-foreground font-mono">
                {currentPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/20 border-t border-border/40 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-10 text-xs font-bold">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={isProcessing}
            className="rounded-xl h-10 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Save Detailed Result
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
