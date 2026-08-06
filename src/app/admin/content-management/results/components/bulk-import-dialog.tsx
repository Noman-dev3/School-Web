"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileUp, Loader2 } from "lucide-react"
import Papa from "papaparse"
import { supabase } from "@/lib/supabase"

export function BulkImportDialog() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleImport = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please upload a CSV file.", variant: "destructive" })
      return
    }

    setLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[]
        const formattedResults = rows.map(row => {
          // Calculate percentage and grade
          const maxMarks = Number(row.max_marks || 100);
          const totalMarks = Number(row.total_marks || 0);
          let percentage = 0;
          if (maxMarks > 0) {
              percentage = Number(((totalMarks / maxMarks) * 100).toFixed(2));
          }

          let grade = "F";
          if (percentage >= 90) grade = "A+";
          else if (percentage >= 80) grade = "A";
          else if (percentage >= 70) grade = "B";
          else if (percentage >= 60) grade = "C";
          else if (percentage >= 50) grade = "D";

          return {
            id: row.id || `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            student_id: row.student_id || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
            student_name: row.student_name || row.Name || row.StudentName || "Unknown",
            roll_number: row.roll_number || row.RollNo || "0000",
            class: row.class || row.Class || "Grade 1",
            session: row.session || row.Session || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            subjects: row.subjects ? JSON.parse(row.subjects) : { "General": totalMarks },
            total_marks: totalMarks,
            max_marks: maxMarks,
            percentage: percentage,
            grade: grade,
            date_created: new Date().toISOString()
          };
        })

        if (formattedResults.length === 0) {
          toast({ title: "Empty CSV", description: "No valid rows found in the CSV.", variant: "destructive" })
          setLoading(false)
          return
        }

        const payload = formattedResults.map(({ id, ...rest }) => rest);
        const { error } = await supabase.from('results').insert(payload)

        if (error) {
          toast({ title: "Import Failed", description: error.message, variant: "destructive" })
        } else {
          toast({ title: "Import Successful", description: `Successfully imported ${formattedResults.length} results.` })
          setOpen(false)
          setFile(null)
        }
        setLoading(false)
      },
      error: (error) => {
        toast({ title: "CSV Parsing Error", description: error.message, variant: "destructive" })
        setLoading(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl text-xs h-9 px-3.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 shadow-xs font-semibold">
          <FileUp className="w-4 h-4 text-emerald-600" /> Bulk Import Results CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Results</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing result records. The CSV must have headers like: <strong>student_name, roll_number, class, total_marks, max_marks</strong>. <br/>
            Optional: <strong>subjects</strong> (JSON string).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="csv-file" className="text-right">
              CSV File
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              className="col-span-3"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!file || loading} onClick={handleImport} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {loading ? "Importing..." : "Start Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
