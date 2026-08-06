"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeeStructure } from "../../data-schemas";
import { Settings2, Plus, Edit3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ClassTariffs } from "@/app/admin/settings/components/class-tariffs";

interface ClassTariffsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  feeStructures: FeeStructure[];
}

export function ClassTariffsModal({ isOpen, onOpenChange, feeStructures }: ClassTariffsModalProps) {
  // Use the actual working ClassTariffs component

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl rounded-2xl p-0 overflow-hidden bg-background">
        <ScrollArea className="max-h-[80vh] p-6">
          <ClassTariffs />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
