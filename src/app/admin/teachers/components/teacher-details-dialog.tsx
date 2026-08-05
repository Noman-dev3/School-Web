
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Teacher } from "../data/schema"
import Image from "next/image"
import { format } from 'date-fns';


interface TeacherDetailsDialogProps {
  teacher: Teacher;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ label, value, className }: { label: string, value: string | undefined | null, className?: string }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className={`text-base font-semibold ${className}`}>{value || 'N/A'}</p>
  </div>
);


export function TeacherDetailsDialog({ teacher, isOpen, onOpenChange }: TeacherDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
            <div className="flex items-center space-x-4">
                 <Image
                    src={teacher.imageUrl || "https://placehold.co/128x128.png"}
                    alt={teacher.name}
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-primary/50 object-cover w-24 h-24"
                    data-ai-hint="teacher portrait"
                />
                <div>
                    <DialogTitle className="text-2xl font-bold font-headline">{teacher.name}</DialogTitle>
                    <DialogDescription>
                        Teacher ID: {teacher.id}
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <DetailItem label="Full Name" value={teacher.name} />
              <DetailItem label="Contact" value={teacher.contact} />
              <DetailItem label="Bio" value={teacher.bio} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <DetailItem label="Department" value={teacher.department} />
              <DetailItem label="Experience" value={teacher.experience} />
              <DetailItem label="Date Joined" value={format(new Date(teacher.dateJoined), "PPP")} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

