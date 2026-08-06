"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Student } from "../../students/data/schema";
import { FeeRecord } from "../../data-schemas";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Save, Loader2, Plus, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IssueFeeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  initialFeeData?: FeeRecord | null;
  onSuccess: () => void;
}

export function IssueFeeModal({ isOpen, onOpenChange, student, initialFeeData, onSuccess }: IssueFeeModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    month_year: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
    tuition_fee: 0,
    exam_fee: 0,
    lab_fee: 0,
    arrears: 0,
    discount: 0,
    notes: ''
  });

  const [customFields, setCustomFields] = useState<{name: string, amount: number}[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialFeeData) {
        setFormData({
          month_year: initialFeeData.month_year || `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
          tuition_fee: Number(initialFeeData.tuition_fee || 0),
          exam_fee: Number(initialFeeData.exam_fee || 0),
          lab_fee: Number(initialFeeData.lab_fee || 0),
          arrears: Number(initialFeeData.arrears || 0),
          discount: Number(initialFeeData.discount || 0),
          notes: initialFeeData.notes ? `${initialFeeData.notes}` : "Copied voucher",
        });
        setCustomFields(
          initialFeeData.custom_fields
            ? initialFeeData.custom_fields.map(f => ({ name: f.name, amount: Number(f.amount) }))
            : []
        );
      } else {
        setFormData({
          month_year: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
          tuition_fee: 0,
          exam_fee: 0,
          lab_fee: 0,
          arrears: 0,
          discount: 0,
          notes: ''
        });
        setCustomFields([]);
      }
    }
  }, [isOpen, initialFeeData]);

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
    if (!student) return;
    setLoading(true);

    try {
      const customTotal = customFields.reduce((sum, f) => sum + Number(f.amount || 0), 0);
      const calculatedTotal = 
        Number(formData.tuition_fee) + 
        Number(formData.lab_fee) + 
        Number(formData.exam_fee) + 
        Number(formData.arrears) + 
        customTotal - 
        Number(formData.discount);

      const yearStr = new Date().getFullYear();
      const challanNumber = `CHS-${yearStr}-${Math.floor(10000 + Math.random() * 90000)}`;

      const formattedCustomFields = customFields.map((f, idx) => ({
        id: `field-${Date.now()}-${idx}`,
        name: f.name || `Field ${idx + 1}`,
        amount: Number(f.amount)
      }));

      const { error } = await supabase
        .from('fees')
        .insert([{
          id: `fee-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          challan_number: challanNumber,
          student_id: student.id,
          student_name: student.Name,
          class_name: student.Class,
          section: student.Section,
          month_year: formData.month_year,
          tuition_fee: Number(formData.tuition_fee),
          lab_fee: Number(formData.lab_fee),
          exam_fee: Number(formData.exam_fee),
          arrears: Number(formData.arrears),
          discount: Number(formData.discount),
          custom_fields: formattedCustomFields,
          total_amount: calculatedTotal,
          amount_paid: 0,
          status: 'pending',
          notes: formData.notes,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({ 
        title: initialFeeData ? "Voucher Duplicated! 🎉" : "Challan Issued", 
        description: initialFeeData ? `Duplicated voucher for ${formData.month_year}.` : "The new fee voucher has been successfully created." 
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden">
        <div className="p-6 bg-muted/20 border-b border-border/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-headline">
              {initialFeeData ? <Copy className="w-5 h-5 text-emerald-600" /> : <Save className="w-5 h-5 text-emerald-600" />}
              {initialFeeData ? "Duplicate Fee Voucher" : "Issue New Fee Voucher"}
            </DialogTitle>
            <DialogDescription>
              {initialFeeData ? "Review and tweak details to issue a copied voucher for " : "Create a customized fee challan for "}
              <strong className="text-emerald-600">{student?.Name}</strong>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-4 text-xs">
            <div className="space-y-1">
              <Label className="font-bold">Billing Month & Year</Label>
              <Input 
                value={formData.month_year} 
                onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
                placeholder="e.g. October 2026"
                className="h-9 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-bold">Tuition Fee (Rs.)</Label>
                <Input 
                  type="number"
                  value={formData.tuition_fee} 
                  onChange={(e) => setFormData({ ...formData, tuition_fee: Number(e.target.value) })}
                  className="h-9 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Lab Fee (Rs.)</Label>
                <Input 
                  type="number"
                  value={formData.lab_fee} 
                  onChange={(e) => setFormData({ ...formData, lab_fee: Number(e.target.value) })}
                  className="h-9 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Exam Fee (Rs.)</Label>
                <Input 
                  type="number"
                  value={formData.exam_fee} 
                  onChange={(e) => setFormData({ ...formData, exam_fee: Number(e.target.value) })}
                  className="h-9 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Carried Arrears (Rs.)</Label>
                <Input 
                  type="number"
                  value={formData.arrears} 
                  onChange={(e) => setFormData({ ...formData, arrears: Number(e.target.value) })}
                  className="h-9 rounded-xl font-mono text-rose-500 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-bold text-emerald-600">Discount Amount (Rs.)</Label>
              <Input 
                type="number"
                value={formData.discount} 
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                className="h-9 rounded-xl font-mono"
              />
            </div>

            {/* Custom Dynamic Fields */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-xs">Extra Custom Charges</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField} className="h-7 text-[10px] gap-1 rounded-lg">
                  <Plus className="w-3 h-3" /> Add Charge
                </Button>
              </div>

              {customFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input 
                    placeholder="Charge Name (e.g. Sports)"
                    value={field.name}
                    onChange={(e) => updateCustomField(idx, 'name', e.target.value)}
                    className="h-8 text-xs rounded-lg flex-1"
                  />
                  <Input 
                    type="number"
                    placeholder="Amount"
                    value={field.amount}
                    onChange={(e) => updateCustomField(idx, 'amount', Number(e.target.value))}
                    className="h-8 text-xs rounded-lg w-24 text-right font-mono"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomField(idx)} className="h-8 w-8 text-rose-500 rounded-lg">X</Button>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-border/40">
              <Label className="font-bold">Notes / Comments</Label>
              <Input 
                value={formData.notes} 
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                className="h-9 rounded-xl"
              />
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex justify-between items-center font-mono">
              <span className="font-bold">Calculated Net Total:</span>
              <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                Rs. {Number(
                  formData.tuition_fee + 
                  formData.exam_fee + 
                  formData.lab_fee + 
                  formData.arrears + 
                  customFields.reduce((s, f) => s + Number(f.amount || 0), 0) - 
                  formData.discount
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 bg-muted/20 border-t border-border/40 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-9 text-xs">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : initialFeeData ? <Copy className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {initialFeeData ? "Confirm & Issue Duplicate" : "Issue Fee Voucher"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
