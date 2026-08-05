
"use client";

import Image from "next/image";
import { useState } from "react";
import { BoardStudent } from "../data/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Percent, CheckCircle } from "lucide-react";
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
import { EditBoardStudentDialog } from "./edit-board-student-dialog";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface BoardStudentCardProps {
  student: BoardStudent;
}

export function BoardStudentCard({ student }: BoardStudentCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('board_students').delete().eq('id', student.id);
      if (error) throw error;
      router.refresh();
      router.refresh();
      toast({
        title: "Board Student Removed",
        description: `The student "${student.name}" has been removed from the board results list.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const percentage = student.totalMarks > 0 ? ((student.obtainedMarks / student.totalMarks) * 100).toFixed(2) : 0;

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden group perspective-1000 bg-secondary/30 border-border/20">
        <CardHeader className="items-center text-center p-6">
          <Image
            src={student.imageUrl || "https://placehold.co/128x128.png"}
            alt={student.name}
            width={100}
            height={100}
            className="rounded-full border-4 border-primary/50 object-cover w-24 h-24 transition-transform duration-500 group-hover:scale-110"
            data-ai-hint="student portrait"
          />
        </CardHeader>
        <CardContent className="p-6 pt-0 text-center flex-grow">
          <CardTitle className="text-xl font-bold font-headline mb-1 truncate">{student.name}</CardTitle>
          <p className="text-sm text-muted-foreground mb-2">Class: {student.class}</p>
          <p className="text-xs text-muted-foreground mb-4">Roll No: {student.boardRollNo}</p>
          <div className="space-y-2">
            <Badge variant="secondary" className="text-base">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                {student.obtainedMarks} / {student.totalMarks}
            </Badge>
            <Badge className="bg-blue-400/20 text-blue-600 border-blue-400/30">
              <Percent className="h-4 w-4 mr-2" />
              <span>{percentage}%</span>
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-4 pt-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 text-blue-500" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the board result for <strong>{student.name}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
      <EditBoardStudentDialog student={student} isOpen={isEditOpen} onOpenChange={setEditOpen} />
    </>
  );
}
