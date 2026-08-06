"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Zap } from "lucide-react";

interface BatchFeeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (config: any) => Promise<void>;
}

export function BatchFeeModal({ isOpen, onOpenChange, selectedCount, onConfirm }: BatchFeeModalProps) {
  const [batchForm, setBatchForm] = useState({
    month_year: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    autoAddArrears: true,
    applySiblingDiscount: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(batchForm);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-headline">
            <Zap className="w-5 h-5 text-emerald-600" />
            Batch Fee Issuance
          </DialogTitle>
          <DialogDescription>
            You are about to issue fee vouchers for <strong className="text-emerald-600">{selectedCount} selected students</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold">Billing Period / Month</Label>
            <Input
              value={batchForm.month_year}
              onChange={(e) => setBatchForm({ ...batchForm, month_year: e.target.value })}
              className="text-xs rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between border p-3 rounded-xl bg-muted/20">
            <div>
              <p className="font-bold text-sm text-foreground">Roll Over Unpaid Arrears</p>
              <p className="text-[10px] text-muted-foreground">Auto-adds unpaid balances from previous months</p>
            </div>
            <Switch
              checked={batchForm.autoAddArrears}
              onCheckedChange={(checked) => setBatchForm({ ...batchForm, autoAddArrears: checked })}
            />
          </div>

          <div className="flex items-center justify-between border p-3 rounded-xl bg-muted/20">
            <div>
              <p className="font-bold text-sm text-foreground">Apply Sibling / Kinship Discount</p>
              <p className="text-[10px] text-muted-foreground">Auto-applies discount per class tariffs</p>
            </div>
            <Switch
              checked={batchForm.applySiblingDiscount}
              onCheckedChange={(checked) => setBatchForm({ ...batchForm, applySiblingDiscount: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-10 text-xs font-bold">Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isProcessing}
            className="rounded-xl h-10 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Confirm & Issue {selectedCount} Vouchers
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
