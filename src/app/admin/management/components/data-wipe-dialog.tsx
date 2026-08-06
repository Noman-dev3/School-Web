"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DataWipeDialogProps {
  onSuccess: () => void;
}

export function DataWipeDialog({ onSuccess }: DataWipeDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const CONFIRMATION_PHRASE = "ERASE ALL DATA";

  const handleWipe = async () => {
    if (confirmationText !== CONFIRMATION_PHRASE) {
      toast({ title: "Verification Failed", description: "You must type the exact confirmation phrase.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      // Step 1: Wipe results
      const { error: errResults } = await supabase.from('results').delete().not('id', 'is', null);
      if (errResults) throw errResults;

      // Step 2: Wipe fees
      const { error: errFees } = await supabase.from('fees').delete().not('id', 'is', null);
      if (errFees) throw errFees;

      // Step 3: Wipe students
      const { error: errStudents } = await supabase.from('students').delete().not('id', 'is', null);
      if (errStudents) throw errStudents;

      toast({ title: "Data Erased", description: "All student, fee, and result data has been permanently deleted." })
      setOpen(false)
      setConfirmationText("")
      onSuccess()
    } catch (err: any) {
      toast({ title: "Error Erasing Data", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setConfirmationText(""); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs gap-1.5 border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 font-bold">
          <Trash2 className="w-3.5 h-3.5" /> Danger: Erase All
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border-rose-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" /> Danger Zone: Factory Reset
          </DialogTitle>
          <DialogDescription className="text-rose-900/70 dark:text-rose-200/70 pt-2">
            This action is <strong>irreversible</strong>. It will permanently delete all students, fee vouchers, and academic results from the database. Use this to remove mock data for a fresh start.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <p className="text-xs font-bold text-foreground">
              To confirm, type <span className="font-mono text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-md">{CONFIRMATION_PHRASE}</span> below:
            </p>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={CONFIRMATION_PHRASE}
              className="text-center font-mono font-bold tracking-widest text-rose-600 border-rose-200 focus-visible:ring-rose-500 rounded-xl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl font-bold h-10">Cancel</Button>
          <Button 
            disabled={confirmationText !== CONFIRMATION_PHRASE || loading} 
            onClick={handleWipe} 
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold h-10"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {loading ? "Erasing..." : "Permanently Erase All Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
