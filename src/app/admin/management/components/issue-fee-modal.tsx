"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Student } from "../../students/data/schema";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Save, Loader2, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IssueFeeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSuccess: () => void;
}

export function IssueFeeModal({ isOpen, onOpenChange, student, onSuccess }: IssueFeeModalProps) {
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

      const challanNumber = `CHS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      const formattedCustomFields = customFields.filter(f => f.name.trim() !== '').map(f => ({
        id: f.name.toLowerCase().replace(/\s+/g, '_'),
        name: f.name,
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

      toast({ title: "Challan Issued", description: "The new fee voucher has been successfully created." });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Issue Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-2xl overflow-hidden">
        <div className="p-6 bg-muted/20 border-b border-border/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-headline text-lg">
              <Plus className="w-5 h-5 text-emerald-600" />
              Issue New Challan
            </DialogTitle>
            <DialogDescription>
              Create a new fee voucher for {student.Name}.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[60vh] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs">Month / Year (e.g., September 2026)</Label>
              <Input className="h-9 rounded-xl text-xs" value={formData.month_year} onChange={e => setFormData({ ...formData, month_year: e.target.value })} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Tuition Fee</Label>
              <Input type="number" className="h-9 rounded-xl text-xs" value={formData.tuition_fee} onChange={e => setFormData({ ...formData, tuition_fee: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Exam Fee</Label>
              <Input type="number" className="h-9 rounded-xl text-xs" value={formData.exam_fee} onChange={e => setFormData({ ...formData, exam_fee: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Lab Fee / Other</Label>
              <Input type="number" className="h-9 rounded-xl text-xs" value={formData.lab_fee} onChange={e => setFormData({ ...formData, lab_fee: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Arrears</Label>
              <Input type="number" className="h-9 rounded-xl text-xs" value={formData.arrears} onChange={e => setFormData({ ...formData, arrears: Number(e.target.value) })} />
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-border/40 space-y-3">
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

            <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/40">
              <Label className="text-xs text-rose-600 font-bold">Discount (Subtracts)</Label>
              <Input type="number" className="h-9 rounded-xl text-xs border-rose-200 focus-visible:ring-rose-500" value={formData.discount} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
            </div>

            <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/40">
              <div className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Net Total to Pay:</span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  Rs. {Number(formData.tuition_fee + formData.exam_fee + formData.lab_fee + formData.arrears + customFields.reduce((s, f) => s + Number(f.amount || 0), 0) - formData.discount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 bg-muted/20 border-t border-border/40 flex justify-end gap-2">
          <Button variant="outline" className="rounded-xl font-bold" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={loading} className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Issue Voucher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
