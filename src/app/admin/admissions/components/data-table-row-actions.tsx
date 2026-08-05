
"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { Check, X, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { admissionSchema } from "../data/schema"
import { useToast } from "@/hooks/use-toast"
import { AdmissionDetailsDialog } from "./admission-details-dialog";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/actions/send-email";
import { useRouter } from "next/navigation";
import { format } from "date-fns";


interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const admission = admissionSchema.parse(row.original)
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.from('admissions').update({ status }).eq('id', admission.id);
      if (error) throw error;

      if (status === 'approved') {
        // 1. Insert into students table without string ID (PostgreSQL bigint sequence)
        const studentPayload = {
          Name: admission.applicantName,
          Class: admission.appliedClass,
          Section: 'A',
          Contact: admission.parentPhone || '',
          Gender: admission.gender ? (admission.gender.charAt(0).toUpperCase() + admission.gender.slice(1)) : 'Male',
          Address: 'Swat, KP',
          Date_Added: new Date().toISOString().split('T')[0],
          Fee_Slip_Path: '',
          profilePicture: ''
        };

        const { data: createdStudent, error: studentError } = await supabase
          .from('students')
          .insert([studentPayload])
          .select('*')
          .single();

        if (studentError) {
          console.error("Failed to create student:", studentError);
        }

        const actualStudentId = createdStudent ? String(createdStudent.id) : `STU-${Date.now()}`;

        // 2. Fetch Fee Structure for this class
        const { data: structData } = await supabase
          .from('fee_structures')
          .select('*')
          .ilike('class_name', `%${admission.appliedClass}%`)
          .limit(1);

        const matchingStruct = structData && structData.length > 0 ? structData[0] : null;
        
        const tuitionFee = matchingStruct ? Number(matchingStruct.tuition_fee) : 5000;
        const labFee = matchingStruct ? Number(matchingStruct.lab_fee) : 1000;
        const examFee = matchingStruct ? Number(matchingStruct.exam_fee) : 1500;
        const admissionFee = matchingStruct ? Number(matchingStruct.admission_fee) : 5000;

        const challanNo = `CHS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const monthYear = format(new Date(), 'MMMM yyyy');
        const totalFee = tuitionFee + labFee + examFee + admissionFee;

        const feeRecord = {
          id: `fee-${Date.now()}`,
          challan_number: challanNo,
          student_id: actualStudentId,
          student_name: admission.applicantName,
          class_name: admission.appliedClass,
          section: 'A',
          month_year: monthYear,
          tuition_fee: tuitionFee,
          lab_fee: labFee,
          exam_fee: examFee,
          arrears: 0,
          discount: 0,
          custom_fields: [{ id: `cf-adm-${Date.now()}`, name: "Admission Fee", amount: admissionFee }],
          total_amount: totalFee,
          amount_paid: 0,
          status: 'pending',
          created_at: new Date().toISOString()
        };

        const { error: feeError } = await supabase.from('fees').insert([feeRecord]);
        if (feeError) console.error("Failed to create fee voucher:", feeError);
      }

      router.refresh();

      const subject = status === 'approved' 
        ? "Congratulations! Your Admission to PIISS is Approved" 
        : "Update on Your Admission Application to PIISS";
        
      const body = status === 'approved'
        ? `<p>Dear ${admission.applicantName},</p><p>We are delighted to inform you that your admission to Pakistan Islamic International School System (PIISS) has been approved. Welcome to our community!</p><p>Further details regarding orientation and class commencement will be shared with you shortly. <strong>Your first Fee Voucher has been generated.</strong> You can download it from our website fee portal.</p><p>Best regards,<br/>PIISS Admissions Office</p>`
        : `<p>Dear ${admission.applicantName},</p><p>Thank you for your interest in Pakistan Islamic International School System (PIISS). After careful consideration, we regret to inform you that we are unable to offer you a place at this time.</p><p>We wish you the best in your academic future.</p><p>Sincerely,<br/>PIISS Admissions Office</p>`;

      await sendEmail({ 
        to: admission.parentEmail, 
        subject, 
        html: body, 
        fromName: "PIISS Admissions Office", 
        fromEmail: "noreply@piiss.edu.pk" 
      });

      toast({ 
        title: `Admission ${status.charAt(0).toUpperCase() + status.slice(1)}`, 
        description: `Student record and fee voucher created. Email sent to ${admission.parentEmail}.` 
      });

    } catch (error) {
      console.error("Error updating admission status:", error);
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }


  const handleDelete = async () => {
    try {
        const { error } = await supabase.from('admissions').delete().eq('id', admission.id);
        if (error) throw error;
        router.refresh();
        toast({ title: "Admission Deleted", description: "The application has been removed." });
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <AdmissionDetailsDialog admission={admission} />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleStatusUpdate('approved')}>
          <Check className="mr-2 h-4 w-4 text-green-500" />
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate('rejected')}>
           <X className="mr-2 h-4 w-4 text-red-500" />
          Reject
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
