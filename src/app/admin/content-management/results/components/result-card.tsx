"use client";
import { useState, useRef } from "react";
import { Result } from "../data/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit, Trash2, Trophy, Percent, ImageDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { generateImageFromNode } from "@/lib/image-generator";
import { getSettings } from "@/lib/data-fetching";
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
import { ReportCardTemplate } from "@/components/report-card-template";

interface ResultCardProps {
  result: Result;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function ResultCard({ result, isSelected = false, onToggleSelect }: ResultCardProps) {
  const { toast } = useToast();
  const [isViewOpen, setViewOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [schoolDetails, setSchoolDetails] = useState({
    schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
    tagline: "Excellence in Education",
    phone: "", email: "", address: ""
  });
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('results').delete().eq('id', result.id);
      if (error) throw error;
      toast({
        title: "Result Deleted",
        description: `Result for ${result.student_name} has been removed.`,
      });
    } catch(error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloadingImage(true);
      const settings = await getSettings();
      setSchoolDetails({
        schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
        tagline: "Excellence in Education",
        phone: settings.contactPhone,
        email: settings.contactEmail,
        address: settings.contactAddress,
      });
      
      setTimeout(async () => {
          if (printRef.current) {
            await generateImageFromNode(printRef.current, `Report_Card_${result.class}_${result.student_name}.png`);
            toast({
                title: "Official Result Exported",
                description: `Downloaded PNG result card for ${result.student_name}.`,
            });
          }
          setDownloadingImage(false);
      }, 500);

    } catch (err) {
      console.error("Image download error:", err);
      toast({
        title: "Export Failed",
        description: "Could not generate PNG result document.",
        variant: "destructive",
      });
      setDownloadingImage(false);
    }
  };

  return (
    <>
    <div className="group relative">
      <Card className={`h-full transition-all duration-300 border-border/60 ${
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
        <CardHeader className="items-center text-center p-4 pt-5">
          <CardTitle className="text-base font-bold font-headline text-foreground mt-1 line-clamp-1">
            {result.student_name}
          </CardTitle>
          <p className="text-xs text-muted-foreground font-mono">Roll No: {result.roll_number}</p>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-center space-y-2.5">
          <Badge variant="outline" className="bg-muted/40 text-[11px] font-medium border-border/60">
            Class: {result.class}
          </Badge>
          <div className="flex justify-center items-center gap-4 text-xs">
            {result.rank && (
              <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                <Trophy className="h-3.5 w-3.5" />
                <span>Rank {result.rank}</span>
              </div>
            )}
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <Trophy className="h-3.5 w-3.5" />
              <span>Grade {result.grade}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
              <Percent className="h-3.5 w-3.5" />
              <span>{result.percentage}%</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-1 p-3 pt-0 border-t border-border/40 mt-2">
          <Button variant="ghost" size="sm" onClick={() => setViewOpen(true)} className="h-8 text-xs px-2 rounded-lg gap-1">
            <User className="h-3.5 w-3.5" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadImage}
            disabled={downloadingImage}
            title="Download PNG Report"
            className="h-8 text-xs px-2.5 rounded-lg border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 gap-1 font-semibold"
          >
            {downloadingImage ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImageDown className="h-3.5 w-3.5" />
            )}
            <span>PNG</span>
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
                  <AlertDialogTitle className="text-base font-bold">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs">
                    This action cannot be undone. This will permanently delete the result for <strong>{result.student_name}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="rounded-xl text-xs bg-rose-600 hover:bg-rose-500">
                    Confirm Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
    </div>
    
    <div className="absolute top-[-9999px] left-[-9999px]">
      <ReportCardTemplate ref={printRef} result={result} schoolDetails={schoolDetails} />
    </div>

    {isViewOpen && <ResultDetailsDialog result={result} isOpen={isViewOpen} onOpenChange={setViewOpen} />}
    {isEditOpen && <EditResultDialog result={result} isOpen={isEditOpen} onOpenChange={setEditOpen} />}
    </>
  );
}
