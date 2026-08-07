"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FeeRecord } from "@/app/admin/data-schemas";
import { Loader2, Printer, ArrowLeft, Building2, ShieldCheck, QrCode } from "lucide-react";
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
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!record) return null;

  const dueDate = new Date(record.created_at || Date.now());
  dueDate.setDate(10); // 10th of every month due date

  const lateAmount = Math.round(Number(record.total_amount) + 300); // Rs 300 late fee penalty

  // Reusable 3-Copy Slip Component (Bank Copy, School Copy, Student Copy)
  const VoucherCopy = ({ copyType }: { copyType: string }) => (
    <div className="w-[31%] border-2 border-slate-800 p-3 bg-white relative flex flex-col justify-between print:break-inside-avoid shadow-xs text-slate-900">
      
      {/* Top Header */}
      <div>
        <div className="text-center pb-2.5 border-b-2 border-slate-800">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <h2 className="font-extrabold text-xs tracking-tight uppercase font-headline">PAKISTAN ISLAMIC INT. SCHOOL</h2>
          </div>
          <p className="text-[9px] text-slate-600 font-medium">Main Campus, Swat / Buner | Ph: +92 300 1234567</p>
          
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200 text-[9px] font-bold">
            <span className="bg-slate-900 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">{copyType} COPY</span>
            <span className="text-emerald-700 font-mono">{record.month_year}</span>
          </div>
        </div>

        {/* Bank Details Block */}
        <div className="bg-slate-100/80 p-2 rounded-lg border border-slate-300 space-y-1 text-[10px] my-2">
          <div className="flex justify-between font-mono">
            <span className="text-slate-500 font-semibold">Challan #:</span>
            <span className="font-bold text-slate-900">{record.challan_number || `CH-${record.id}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">HBL A/C #:</span>
            <span className="font-bold font-mono">0042-79015421-03</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Meezan A/C #:</span>
            <span className="font-bold font-mono">0201-01048829-11</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-semibold">Due Date:</span>
            <span className="font-extrabold text-rose-600 font-mono">{format(dueDate, 'dd MMM, yyyy')}</span>
          </div>
        </div>

        {/* Student Information Block */}
        <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-200/80 space-y-1 text-[10px] my-2">
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Student Name:</span>
            <span className="font-extrabold text-slate-900">{record.student_name}</span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-slate-500 font-semibold">Student ID / Roll:</span>
            <span className="font-bold">{record.student_id || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Class Grade &amp; Sec:</span>
            <span className="font-bold text-emerald-800">{record.class_name} ({record.section || 'A'})</span>
          </div>
        </div>

        {/* Line Item Charges Table */}
        <div className="my-2">
          <table className="w-full text-[10px]">
            <thead className="border-y-2 border-slate-800 bg-slate-100">
              <tr>
                <th className="py-1 text-left font-bold text-slate-800">Particulars</th>
                <th className="py-1 text-right font-bold text-slate-800">Amount (Rs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Number(record.tuition_fee) > 0 && (
                <tr><td className="py-1 font-medium">Monthly Tuition Fee</td><td className="py-1 text-right font-mono font-bold">{Number(record.tuition_fee).toLocaleString()}</td></tr>
              )}
              {Number(record.exam_fee) > 0 && (
                <tr><td className="py-1 font-medium">FBISE Examination Fee</td><td className="py-1 text-right font-mono">{Number(record.exam_fee).toLocaleString()}</td></tr>
              )}
              {Number(record.lab_fee) > 0 && (
                <tr><td className="py-1 font-medium">STEM / Science Lab Fee</td><td className="py-1 text-right font-mono">{Number(record.lab_fee).toLocaleString()}</td></tr>
              )}
              
              {/* Dynamic Custom Fields */}
              {record.custom_fields && record.custom_fields.map((cf, idx) => (
                <tr key={idx}><td className="py-1 font-medium">{cf.name}</td><td className="py-1 text-right font-mono">{Number(cf.amount).toLocaleString()}</td></tr>
              ))}

              {Number(record.arrears) > 0 && (
                <tr><td className="py-1 font-bold text-amber-700">Carried Arrears Dues</td><td className="py-1 text-right font-mono font-bold text-amber-700">{Number(record.arrears).toLocaleString()}</td></tr>
              )}
              {Number(record.discount) > 0 && (
                <tr><td className="py-1 font-bold text-emerald-700">Concession / Discount</td><td className="py-1 text-right font-mono font-bold text-emerald-700">-{Number(record.discount).toLocaleString()}</td></tr>
              )}
            </tbody>
            <tfoot className="border-t-2 border-slate-800 bg-slate-50">
              <tr>
                <td className="py-1.5 font-black text-xs uppercase">Payable By Due Date</td>
                <td className="py-1.5 text-right font-mono font-black text-xs">Rs. {Number(record.total_amount).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-[9px] text-rose-600">Payable After Due Date (+Rs 300)</td>
                <td className="py-1 text-right font-mono font-bold text-[9px] text-rose-600">Rs. {lateAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer Signature & Verification */}
      <div className="pt-2 border-t border-slate-300 text-[8px] text-slate-500 space-y-1">
        <div className="flex justify-between items-end pt-3">
          <div className="text-center">
            <p className="border-t border-slate-400 px-2 pt-0.5">Bank Officer Stamp</p>
          </div>
          <div className="text-center">
            <p className="border-t border-slate-400 px-2 pt-0.5">Authorized Signatory</p>
          </div>
        </div>
        <p className="text-center font-mono text-[7px] text-slate-400 pt-1">Computer Generated Voucher • PIISS Swat Financial Portal</p>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-slate-200/60 print:bg-white font-sans text-slate-900">
      {/* Top Action Bar */}
      <div className="print:hidden p-4 bg-white border-b border-slate-200 shadow-xs flex items-center justify-between sticky top-0 z-20">
        <Button variant="ghost" size="sm" asChild className="rounded-xl font-semibold">
          <Link href="/admin/fees"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Fee Management</Link>
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Challan #{record.challan_number || record.id}</span>
          <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 font-bold px-4 gap-1.5 shadow-sm">
            <Printer className="w-4 h-4" /> Print / Save Bank PDF
          </Button>
        </div>
      </div>

      {/* Printable Landscape A4 Sheet */}
      <div className="p-4 md:p-8 flex justify-center overflow-auto print:p-0 print:overflow-visible">
        <div className="bg-white w-[297mm] h-[210mm] shadow-2xl print:shadow-none print:w-full print:h-full relative flex gap-3 p-4 mx-auto my-0 rounded-xl print:rounded-none">
          
          <VoucherCopy copyType="School" />
          <div className="border-l-2 border-dashed border-slate-300 h-full my-1"></div>
          <VoucherCopy copyType="Bank" />
          <div className="border-l-2 border-dashed border-slate-300 h-full my-1"></div>
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
