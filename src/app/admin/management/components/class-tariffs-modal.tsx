"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeeStructure } from "../../data-schemas";
import { Settings2, Plus, Edit3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClassTariffsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  feeStructures: FeeStructure[];
}

export function ClassTariffsModal({ isOpen, onOpenChange, feeStructures }: ClassTariffsModalProps) {
  // In a full implementation, we would add the Edit/Add form here.
  // For the dashboard consolidation, we provide the viewer first.

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-2xl p-0 overflow-hidden">
        <div className="p-6 bg-muted/20 border-b border-border/40 flex justify-between items-center">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-headline">
              <Settings2 className="w-5 h-5 text-emerald-600" />
              Class Tariffs & Sibling Matrix
            </DialogTitle>
            <DialogDescription>
              Manage global fee structures applied automatically during batch issuance.
            </DialogDescription>
          </DialogHeader>
          <Button size="sm" className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Tariff
          </Button>
        </div>

        <ScrollArea className="max-h-[60vh] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {feeStructures.map((struct) => (
              <Card key={struct.id} className="rounded-2xl border-border/60 bg-card p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground font-headline">{struct.class_name}</h3>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]">
                    {struct.kinship_discount_percent}% Sibling Off
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground border-t border-b border-border/40 py-2">
                  <div className="flex justify-between">
                    <span>Tuition Fee:</span>
                    <span className="font-bold text-foreground">Rs. {Number(struct.tuition_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lab / Computer Charges:</span>
                    <span className="font-semibold text-foreground">Rs. {Number(struct.lab_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exam Fee:</span>
                    <span className="font-semibold text-foreground">Rs. {Number(struct.exam_fee).toLocaleString()}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs h-8 rounded-xl font-semibold gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" /> Edit Tariff
                </Button>
              </Card>
            ))}
            {feeStructures.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground text-xs italic border border-dashed rounded-2xl">
                No class tariffs defined yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
