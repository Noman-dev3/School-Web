"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FeeRecord } from "@/app/admin/data-schemas";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default function DownloadVoucherPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [record, setRecord] = useState<FeeRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.push('/fees');
      return;
    }

    const fetchRecord = async () => {
      try {
        const { data, error } = await supabase
          .from('fees')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setRecord(data);
      } catch (error) {
        console.error("Error loading voucher", error);
        router.push('/fees');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!record) return null;

  const due_date = new Date(record.created_at || Date.now());
  due_date.setDate(10); // Example due date 10th of the month

  // Reusable component for a single copy (Bank, School, Student)
  const VoucherCopy = ({ copyType }: { copyType: string }) => (
    <div className="w-[30%] border border-black/20 p-4 bg-white relative print:break-inside-avoid">
      <div className="text-center mb-4 pb-4 border-b-2 border-black/20">
        <h2 className="font-bold text-lg leading-tight">Pakistan Islamic International School</h2>
        <p className="text-[10px] text-gray-600 mt-1">Swari, Buner | 0333-1234567</p>
        <div className="bg-black text-white text-xs font-bold py-1 px-3 rounded-full inline-block mt-3 uppercase tracking-wider">
          {copyType} Copy
        </div>
      </div>

      <div className="space-y-1.5 text-[11px] mb-4">
        <div className="flex justify-between font-mono">
          <span className="text-gray-500">Challan No:</span>
          <span className="font-bold">{record.challan_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Fee Month:</span>
          <span className="font-bold">{record.month_year}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Due Date:</span>
          <span className="font-bold text-rose-600">{format(due_date, 'dd MMM, yyyy')}</span>
        </div>
      </div>

      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1.5 text-[11px] mb-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Student Name:</span>
          <span className="font-bold">{record.student_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Student ID:</span>
          <span className="font-bold font-mono">{record.student_id || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Class:</span>
          <span className="font-bold">{record.class_name} {record.section}</span>
        </div>
      </div>

      <div className="mb-4">
        <table className="w-full text-[11px]">
          <thead className="border-y border-black/20 bg-gray-50/50">
            <tr>
              <th className="py-1.5 text-left font-semibold text-gray-600">Fee Details</th>
              <th className="py-1.5 text-right font-semibold text-gray-600">Amount (Rs)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {record.tuition_fee > 0 && (
              <tr><td className="py-1.5 font-medium">Tuition Fee</td><td className="py-1.5 text-right font-mono">{record.tuition_fee}</td></tr>
            )}
            {record.exam_fee > 0 && (
              <tr><td className="py-1.5 font-medium">Exam Fee</td><td className="py-1.5 text-right font-mono">{record.exam_fee}</td></tr>
            )}
            {record.lab_fee > 0 && (
              <tr><td className="py-1.5 font-medium">Lab/IT Charges</td><td className="py-1.5 text-right font-mono">{record.lab_fee}</td></tr>
            )}
            
            {/* Custom Fields (Late Fee, Transport, etc) */}
            {record.custom_fields && record.custom_fields.map((cf, idx) => (
               <tr key={idx}><td className="py-1.5 font-medium">{cf.name}</td><td className="py-1.5 text-right font-mono">{cf.amount}</td></tr>
            ))}

            {record.arrears > 0 && (
              <tr><td className="py-1.5 font-medium text-amber-600">Previous Arrears</td><td className="py-1.5 text-right font-mono text-amber-600">{record.arrears}</td></tr>
            )}
            {record.discount > 0 && (
              <tr><td className="py-1.5 font-medium text-emerald-600">Discount/Waiver</td><td className="py-1.5 text-right font-mono text-emerald-600">-{record.discount}</td></tr>
            )}
          </tbody>
          <tfoot className="border-t-2 border-black/20">
            <tr>
              <td className="py-2 font-bold text-sm">TOTAL PAYABLE</td>
              <td className="py-2 text-right font-mono font-bold text-sm">Rs {record.total_amount}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-[10px] text-center text-gray-500 pt-3 border-t border-black/20">
        Generated by PIISS Automated Fee System
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-200/50 print:bg-white font-sans">
      <div className="print:hidden p-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10">
        <Button variant="ghost" asChild>
          <Link href="/fees"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
        </Button>
        <div className="font-bold text-primary">Fee Voucher Preview</div>
        <Button onClick={() => window.print()} className="bg-primary text-primary-foreground">
          <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
        </Button>
      </div>

      <div className="p-4 md:p-8 flex justify-center overflow-auto print:p-0 print:overflow-visible">
        {/* Landscape A4 Page Container */}
        <div className="bg-white w-[297mm] h-[210mm] shadow-xl print:shadow-none print:w-full print:h-full relative flex gap-4 p-4 mx-auto my-0">
          
          <VoucherCopy copyType="School" />
          <div className="border-l-2 border-dashed border-gray-300 h-full"></div>
          <VoucherCopy copyType="Bank" />
          <div className="border-l-2 border-dashed border-gray-300 h-full"></div>
          <VoucherCopy copyType="Student" />

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 0; }
          body { background: white; }
        }
      `}} />
    </div>
  );
}
