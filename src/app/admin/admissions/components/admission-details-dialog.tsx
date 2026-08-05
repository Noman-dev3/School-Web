"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Admission } from "../data/schema"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AdmissionDetailsDialogProps {
  admission: Admission;
}

const DetailItem = ({ label, value, className }: { label: string, value: string | undefined, className?: string }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className={cn("text-base font-semibold", className)}>{value || 'N/A'}</p>
  </div>
);


export function AdmissionDetailsDialog({ admission }: AdmissionDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center w-full cursor-pointer" >
            <Eye className="mr-2 h-4 w-4" />
            <span>View Details</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Admission Details</DialogTitle>
          <DialogDescription>
            Full details for applicant: {admission.applicantName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Applicant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <DetailItem label="Full Name" value={admission.applicantName} />
              <DetailItem label="Date of Birth" value={format(new Date(admission.dob), "PPP")} />
              <DetailItem label="Gender" value={admission.gender} className="capitalize" />
              <DetailItem label="Applying For Class" value={admission.appliedClass} className="capitalize" />
              <DetailItem label="Previous School" value={admission.previousSchool} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <DetailItem label="Parent Name" value={admission.parentName} />
              <DetailItem label="Parent Email" value={admission.parentEmail} />
              <DetailItem label="Parent Phone" value={admission.parentPhone} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Application Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <DetailItem label="Submitted At" value={format(new Date(admission.submittedAt), "PPP p")} />
              <DetailItem label="Status" value={admission.status} className="capitalize" />
            </div>
          </div>

          {admission.comments && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Comments</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">{admission.comments}</p>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
