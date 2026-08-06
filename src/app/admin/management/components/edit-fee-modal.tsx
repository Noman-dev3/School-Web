"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FeeRecord } from "../../data-schemas";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Save, Loader2, ReceiptText, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditFeeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fee: FeeRecord | null;
  onSuccess: () => void;
}

export function EditFeeModal({ isOpen, onOpenChange, fee, onSuccess }: EditFeeModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<FeeRecord>>({});

  const [customFields, setCustomFields] = useState<{name: string, amount: number}[]>([]);

  useEffect(() => {
    if (fee) {
      setFormData(fee);
      setCustomFields(fee.custom_fields ? fee.custom_fields.map((f: any) => ({ name: f.name, amount: f.amount })) : []);
    }
  }, [fee]);

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { name: '', amount: 0 }]);
  };

  const updateCustomField = (index: number, key: 'name' | 'amount', value: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: value };
    setCustomFields(updated);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!fee) return;
    setLoading(true);

    try {
      const formattedCustomFields = customFields.filter(f => f.name.trim() !== '').map(f => ({
        id: f.name.toLowerCase().replace(/\s+/g, '_'),
        name: f.name,
        amount: Number(f.amount)
      }));

      // Recalculate net total
      const totalCustom = formattedCustomFields.reduce((sum: number, f: any) => sum + Number(f.amount || 0), 0);
      const calculatedTotal = 
        Number(formData.tuition_fee || 0) + 
        Number(formData.lab_fee || 0) + 
        Number(formData.exam_fee || 0) + 
        Number(formData.arrears || 0) + 
        totalCustom - 
        Number(formData.discount || 0);

      // Determine status based on payment
      const netPaid = Number(formData.amount_paid || 0);
      let newStatus: FeeRecord['status'] = 'pending';
      if (netPaid >= calculatedTotal && calculatedTotal > 0) newStatus = 'paid';
      else if (netPaid > 0) newStatus = 'partial';
      if (formData.status === 'overdue' && newStatus === 'pending') newStatus = 'overdue';

      const { error } = await supabase
        .from('fees')
        .update({
          tuition_fee: Number(formData.tuition_fee || 0),
          lab_fee: Number(formData.lab_fee || 0),
          exam_fee: Number(formData.exam_fee || 0),
          arrears: Number(formData.arrears || 0),
          discount: Number(formData.discount || 0),
          custom_fields: formattedCustomFields,
          amount_paid: netPaid,
          total_amount: calculatedTotal,
          status: newStatus,
          notes: formData.notes || "",
        })
        .eq('id', fee.id);

      if (error) throw error;

      toast({ title: "Fee Record Updated", description: "The voucher details have been successfully saved." });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!fee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 rounded-2xl overflow-hidden">
        <div className="p-6 bg-muted/20 border-b border-border/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-headline text-lg">
              <ReceiptText className="w-5 h-5 text-emerald-600" />
              Edit Fee Voucher: {fee.challan_number}
            </DialogTitle>
            <DialogDescription>
              Modify fee breakdown, update arrears, or record payments for {fee.student_name}.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[60vh] p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 border-b border-border/40 pb-2">Fee Breakdown</h4>
              <div className="space-y-2">
                <Label className="text-xs">Tuition Fee</Label>
                <Input type="number" className="h-9 rounded-xl text-xs" value={formData.tuition_fee || 0} onChange={e => setFormData({ ...formData, tuition_fee: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Exam Fee</Label>
                <Input type="number" className="h-9 rounded-xl text-xs" value={formData.exam_fee || 0} onChange={e => setFormData({ ...formData, exam_fee: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Lab Fee / Other</Label>
                <Input type="number" className="h-9 rounded-xl text-xs" value={formData.lab_fee || 0} onChange={e => setFormData({ ...formData, lab_fee: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Previous Arrears</Label>
                <Input type="number" className="h-9 rounded-xl text-xs" value={formData.arrears || 0} onChange={e => setFormData({ ...formData, arrears: Number(e.target.value) })} />
              </div>

              <div className="pt-2 border-t border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-foreground">Custom Extra Fields</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField} className="h-7 text-[10px] gap-1 rounded-lg">
                    <Plus className="w-3 h-3" /> Add Field
                  </Button>
                </div>
                {customFields.map((field, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input placeholder="Field Name (e.g. Transport)" className="h-8 text-xs rounded-lg" value={field.name} onChange={(e) => updateCustomField(index, 'name', e.target.value)} />
                    <Input type="number" placeholder="Amount" className="h-8 text-xs w-24 rounded-lg" value={field.amount} onChange={(e) => updateCustomField(index, 'amount', Number(e.target.value))} />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-500 rounded-lg" onClick={() => removeCustomField(index)}>X</Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <Label className="text-xs text-rose-600 font-bold">Discount (Subtracts)</Label>
                <Input type="number" className="h-9 rounded-xl text-xs border-rose-200 focus-visible:ring-rose-500" value={formData.discount || 0} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 border-b border-border/40 pb-2">Payment Status</h4>
              
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Net Total</p>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  Rs. {Number(
                    (formData.tuition_fee || 0) + (formData.exam_fee || 0) + (formData.lab_fee || 0) + (formData.arrears || 0) + customFields.reduce((s, f) => s + Number(f.amount || 0), 0) - (formData.discount || 0)
                  ).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold">Amount Paid (Received)</Label>
                <Input type="number" className="h-10 rounded-xl font-bold font-mono text-base border-emerald-500/50 focus-visible:ring-emerald-500" value={formData.amount_paid || 0} onChange={e => setFormData({ ...formData, amount_paid: Number(e.target.value) })} />
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs">Admin Notes / Remarks</Label>
                <Input className="h-9 rounded-xl text-xs" value={formData.notes || ""} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="E.g. Discount approved by principal" />
              </div>
            </div>

          </div>
        </ScrollArea>

        <div className="p-4 bg-muted/20 border-t border-border/40 flex justify-end gap-2">
          <Button variant="outline" className="rounded-xl font-bold" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={loading} className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Update Voucher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
