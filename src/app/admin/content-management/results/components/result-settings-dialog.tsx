"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Loader2, Image as ImageIcon, Sliders } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSettings } from "@/lib/data-fetching";

export function ResultSettingsDialog({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    defaultSessionName: "Mid Term Examination 2026",
    schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
    tagline: "Excellence in Academic Rigor & Timeless Values",
    logoUrl: "",
    passingPercentage: 50,
    signatureTitle: "Principal & Examination Board"
  });

  useEffect(() => {
    if (open) {
      const loadConfig = async () => {
        try {
          const settings = await getSettings();
          setFormData({
            defaultSessionName: settings.defaultSessionName || "Mid Term Examination 2026",
            schoolName: settings.schoolName || "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
            tagline: settings.tagline || "Excellence in Academic Rigor & Timeless Values",
            logoUrl: settings.logoUrl || "",
            passingPercentage: settings.passingPercentage || 50,
            signatureTitle: settings.signatureTitle || "Principal & Examination Board"
          });
        } catch (e) {
          console.error("Failed to load settings:", e);
        }
      };
      loadConfig();
    }
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Upsert into Supabase settings table
      const { data: existing } = await supabase.from('settings').select('id').limit(1).maybeSingle();

      const payload = {
        defaultSessionName: formData.defaultSessionName,
        schoolName: formData.schoolName,
        tagline: formData.tagline,
        logoUrl: formData.logoUrl,
        passingPercentage: Number(formData.passingPercentage),
        signatureTitle: formData.signatureTitle,
      };

      let error;
      if (existing?.id) {
        const res = await supabase.from('settings').update(payload).eq('id', existing.id);
        error = res.error;
      } else {
        const res = await supabase.from('settings').insert([{ id: 'default', ...payload }]);
        error = res.error;
      }

      if (error) throw error;

      toast({
        title: "Result Template Settings Saved! 🎨",
        description: "Examination name, logo, and signature titles updated across report cards."
      });

      if (onSaved) onSaved();
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Error Saving Settings", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs h-9 px-3.5 border-border/80 text-foreground hover:bg-muted/40 font-semibold shadow-xs">
          <Settings className="w-4 h-4 text-emerald-600" /> Result & Exam Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <Sliders className="w-5 h-5 text-emerald-600" />
            Result & Exam Template Settings
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure examination titles, school branding logo, and signature titles for report cards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs">
          <div className="space-y-1.5">
            <Label className="font-bold">Default Examination Name / Term</Label>
            <Input
              value={formData.defaultSessionName}
              onChange={(e) => setFormData({ ...formData, defaultSessionName: e.target.value })}
              placeholder="e.g. Mid Term Examination 2026"
              className="h-9 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold">Official School Name</Label>
            <Input
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              placeholder="School Name"
              className="h-9 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold">Tagline / Motto</Label>
            <Input
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="Tagline..."
              className="h-9 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> School Logo Image URL
            </Label>
            <Input
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://... logo.png"
              className="h-9 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-bold">Passing Percentage (%)</Label>
              <Input
                type="number"
                value={formData.passingPercentage}
                onChange={(e) => setFormData({ ...formData, passingPercentage: Number(e.target.value) })}
                className="h-9 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold">Signature Title</Label>
              <Input
                value={formData.signatureTitle}
                onChange={(e) => setFormData({ ...formData, signatureTitle: e.target.value })}
                placeholder="Principal & Exam Board"
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-9 text-xs">Cancel</Button>
          <Button disabled={loading} onClick={handleSave} className="rounded-xl h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
