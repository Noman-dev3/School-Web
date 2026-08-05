"use client"
import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Result } from "../data/schema"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImageDown, Loader2 } from "lucide-react"
import { getSettings } from "@/lib/data-fetching"
import { useToast } from "@/hooks/use-toast"
import { generateImageFromNode } from "@/lib/image-generator"
import { ReportCardTemplate } from "@/components/report-card-template"

interface ResultDetailsDialogProps {
  result: Result;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ label, value, className }: { label: string, value: string | number | undefined, className?: string }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className={`text-base font-semibold ${className}`}>{value ?? 'N/A'}</p>
  </div>
);

export function ResultDetailsDialog({ result, isOpen, onOpenChange }: ResultDetailsDialogProps) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [schoolDetails, setSchoolDetails] = useState({
    schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
    tagline: "Excellence in Education",
    phone: "", email: "", address: ""
  });

  const handleDownloadImage = async () => {
    try {
        setDownloading(true);
        const settings = await getSettings();
        setSchoolDetails({
            schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
            tagline: "Excellence in Education",
            phone: settings.contactPhone,
            email: settings.contactEmail,
            address: settings.contactAddress,
        });
        
        // Timeout to allow state updates and react render of hidden node
        setTimeout(async () => {
          if (printRef.current) {
            await generateImageFromNode(printRef.current, `Report_Card_${result.class}_${result.student_name}.png`);
            toast({
                title: "Official Result Exported",
                description: `Downloaded PNG result card for ${result.student_name}.`,
            });
          }
          setDownloading(false);
        }, 500);

    } catch (err) {
        console.error("Image download error:", err);
        toast({
            title: "Export Error",
            description: "Could not generate result image. Please try again.",
            variant: "destructive",
        });
        setDownloading(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] rounded-2xl">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold font-headline">Result for {result.student_name}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Roll No: {result.roll_number} | Class: {result.class}
              </DialogDescription>
            </div>
            <Button
              onClick={handleDownloadImage}
              disabled={downloading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 font-semibold shadow-xs"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageDown className="h-4 w-4" />
              )}
              <span>{downloading ? "Generating PNG..." : "Download PNG"}</span>
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Performance Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 bg-muted/30 p-4 rounded-xl border border-border/60">
              <DetailItem label="Grade" value={result.grade} />
              <DetailItem label="Percentage" value={`${result.percentage}%`} />
              <DetailItem label="Total Marks" value={result.total_marks} />
              <DetailItem label="Max Marks" value={result.max_marks} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
                 <DetailItem label="Session" value={result.session} />
                 <DetailItem label="Date Created" value={format(new Date(result.date_created), "PPP")} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Subject-wise Breakdown</h3>
             <div className="space-y-2">
                {Object.entries(result.subjects).map(([subject, marks]) => (
                    <div key={subject} className="flex justify-between items-center bg-muted/50 p-3 rounded-xl border border-border/40">
                        <p className="font-medium text-sm text-foreground">{subject}</p>
                        <Badge variant="secondary" className="font-mono text-xs font-semibold px-2.5 py-0.5">{marks as number} / 100</Badge>
                    </div>
                ))}
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    <div className="absolute top-[-9999px] left-[-9999px]">
      <ReportCardTemplate ref={printRef} result={result} schoolDetails={schoolDetails} />
    </div>
    </>
  )
}
