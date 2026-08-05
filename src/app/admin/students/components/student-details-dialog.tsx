
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Student } from "../data/schema"
import Image from "next/image"

interface StudentDetailsDialogProps {
  student: Student;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ label, value, className }: { label: string, value: string | undefined, className?: string }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className={`text-base font-semibold ${className}`}>{value || 'N/A'}</p>
  </div>
);


export function StudentDetailsDialog({ student, isOpen, onOpenChange }: StudentDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
            <div className="flex items-center space-x-4">
                 <Image
                    src={student.profilePicture || "https://placehold.co/128x128.png"}
                    alt={student.Name}
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-primary/50 object-cover w-24 h-24"
                    data-ai-hint="student portrait"
                />
                <div>
                    <DialogTitle className="text-2xl font-bold font-headline">{student.Name}</DialogTitle>
                    <DialogDescription>
                        Student ID: {student.id}
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <DetailItem label="Full Name" value={student.Name} />
              <DetailItem label="Gender" value={student.Gender} className="capitalize" />
              <DetailItem label="Contact" value={student.Contact} />
              <DetailItem label="Address" value={student.Address} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <DetailItem label="Class" value={student.Class} />
              <DetailItem label="Section" value={student.Section} />
              <DetailItem label="Date Added" value={student.Date_Added} />
            </div>
          </div>
            
           {student.Fee_Slip_Path && (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Fee Status</h3>
                 <p className="text-sm text-muted-foreground">Fee slip uploaded.</p>
            </div>
            )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
