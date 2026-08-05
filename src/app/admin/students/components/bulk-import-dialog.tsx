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
        const formattedStudents = rows.map(row => ({
          id: row.id || `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          Name: row.Name || row.name || row.StudentName || "Unknown",
          Class: row.Class || row.class || "Grade 1",
          Section: row.Section || row.section || "A",
          Contact: row.Contact || row.contact || row.Phone || "",
        }))

        if (formattedStudents.length === 0) {
          toast({ title: "Empty CSV", description: "No valid rows found in the CSV.", variant: "destructive" })
          setLoading(false)
          return
        }

        const { error } = await supabase.from('students').insert(formattedStudents)

        if (error) {
          toast({ title: "Import Failed", description: error.message, variant: "destructive" })
        } else {
          toast({ title: "Import Successful", description: `Successfully imported ${formattedStudents.length} students.` })
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
        <Button variant="outline" className="gap-2 rounded-xl">
          <FileUp className="w-4 h-4" /> Bulk Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Students</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing student records. The CSV must have headers like: <strong>Name, Class, Section, Contact</strong>.
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
