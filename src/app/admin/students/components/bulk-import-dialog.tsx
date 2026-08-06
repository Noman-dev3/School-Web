"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileUp, Loader2, Database } from "lucide-react"
import { parseExcelFile, executeDualImport, ImportFileSummary } from "@/lib/excel-importer"

export function BulkImportDialog() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<ImportFileSummary | null>(null)
  const { toast } = useToast()

  const handleProcessFile = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please upload an Excel or CSV file.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const buffer = await file.arrayBuffer();
      // The excel-importer automatically detects headers and formats Dual Import data
      const parsedSummary = parseExcelFile(buffer, file.name);
      
      if (parsedSummary.totalStudents === 0) {
        toast({ title: "No Students Found", description: "Could not detect valid student or fee data.", variant: "destructive" })
      } else {
        setSummary(parsedSummary);
      }
    } catch (err: any) {
      toast({ title: "Processing Error", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!summary) return;
    setLoading(true);

    try {
      const result = await executeDualImport([summary]);
      
      toast({
        title: "Import Successful! 🚀",
        description: `Imported ${result.createdStudentsCount} Students, ${result.createdTariffsCount} Class Tariffs, and ${result.createdVouchersCount} Fee Vouchers.`,
      });
      
      setOpen(false)
      setFile(null)
      setSummary(null)
      // If we had a callback to refresh data, we'd call it here, but window.location.reload() works as a hard reset, 
      // or we can just let the user click "Sync Data" on the dashboard.
    } catch (err: any) {
      toast({ title: "Import Failed", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setFile(null); setSummary(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Database className="w-4 h-4" /> Smart Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Smart Import (Students & Fees)</DialogTitle>
          <DialogDescription>
            Upload a Fee Register Excel file. The system will automatically extract students, build class tariffs, and generate fee vouchers in one go.
          </DialogDescription>
        </DialogHeader>
        
        {summary ? (
          <div className="grid gap-4 py-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl text-center space-y-2">
              <div className="flex justify-center gap-6">
                <div>
                  <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{summary.totalStudents}</p>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Students Detected</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">Rs. {summary.standardTuition.toLocaleString()}</p>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Standard {summary.detectedClass} Tuition</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t border-emerald-500/20 mt-3">
                Detected <strong>{summary.totalDiscountedStudents}</strong> students with custom sibling/kinship discounts.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" disabled={loading} onClick={() => setSummary(null)} className="rounded-xl font-bold">Cancel</Button>
              <Button disabled={loading} onClick={handleConfirmImport} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {loading ? "Importing Data..." : "Confirm & Import Database"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="excel-file" className="text-right font-bold text-xs">
                Select File
              </Label>
              <Input
                id="excel-file"
                type="file"
                accept=".csv,.xls,.xlsx"
                className="col-span-3 rounded-xl"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <DialogFooter>
              <Button disabled={!file || loading} onClick={handleProcessFile} className="gap-2 rounded-xl font-bold bg-foreground text-background">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                Analyze Excel Data
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
