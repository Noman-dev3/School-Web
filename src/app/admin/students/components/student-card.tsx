"use client";

import { useState } from "react";
import { Student } from "../data/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit, Trash2, Eye, Phone, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
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
import { StudentDetailsDialog } from "./student-details-dialog";
import { EditStudentDialog } from "./edit-student-dialog";
import { supabase } from "@/lib/supabase";

interface StudentCardProps {
  student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
  const { toast } = useToast();
  const [isViewOpen, setViewOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('students').delete().eq('id', student.id);
      if (error) throw error;
      toast({
        title: "Student Removed",
        description: `Student ${student.Name} was removed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const initials = student.Name
    ? student.Name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <>
      <Card className="rounded-2xl border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg flex flex-col justify-between group">
        {/* Top Bar: ID Badge & Gender */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-[10px] font-mono bg-muted/40 border-border/60 text-muted-foreground">
            ID #{student.id}
          </Badge>
          {student.Gender && (
            <Badge variant="secondary" className="text-[10px] capitalize px-2 py-0.5">
              {student.Gender}
            </Badge>
          )}
        </div>

        {/* Center Profile & Info */}
        <div className="flex flex-col items-center text-center my-3">
          <Avatar className="h-16 w-16 rounded-2xl border-2 border-primary/20 shadow-xs group-hover:scale-105 transition-transform duration-300">
            <AvatarImage src={student.profilePicture || undefined} alt={student.Name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-base rounded-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h3 className="text-sm font-bold font-headline text-foreground mt-2.5 truncate w-full">
            {student.Name}
          </h3>

          <div className="mt-1.5 flex items-center justify-center gap-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold">
              Class {student.Class || 'N/A'} {student.Section ? `(${student.Section})` : ''}
            </Badge>
          </div>
        </div>

        {/* Footer Meta & Actions */}
        <div className="space-y-2.5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 truncate max-w-[130px]" title={student.Contact || 'No contact'}>
              <Phone className="h-3 w-3 shrink-0 text-muted-foreground/70" />
              <span className="truncate">{student.Contact || 'N/A'}</span>
            </span>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Active</span>
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewOpen(true)}
              className="rounded-xl h-8 text-xs gap-1 flex-1 font-medium border-border/80 hover:bg-muted"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span>View</span>
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setEditOpen(true)}
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Edit Student"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                  title="Delete Student"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Student Record</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{student.Name}</strong>? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white">
                    Delete Student
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>

      {isViewOpen && <StudentDetailsDialog student={student} isOpen={isViewOpen} onOpenChange={setViewOpen} />}
      {isEditOpen && <EditStudentDialog student={student} isOpen={isEditOpen} onOpenChange={setEditOpen} />}
    </>
  );
}
