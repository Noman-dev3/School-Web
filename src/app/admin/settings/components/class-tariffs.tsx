"use client"

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save, BadgeDollarSign, GripVertical, HandCoins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface FeeStructure {
  id: string;
  class_name: string;
  tuition_fee: number;
  custom_fields: { id: string; name: string; amount: number }[];
}

export function ClassTariffs() {
  const { toast } = useToast();
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    const { data, error } = await supabase.from('fee_structures').select('*').order('class_name');
    if (!error && data) {
      setStructures(data as FeeStructure[]);
    }
    setLoading(false);
  };

  const handleStructureChange = (index: number, field: string, value: string | number) => {
    const newStructs = [...structures];
    newStructs[index] = { ...newStructs[index], [field]: value };
    setStructures(newStructs);
  };

  const addCustomField = (structIndex: number) => {
    const newStructs = [...structures];
    const customFields = newStructs[structIndex].custom_fields || [];
    newStructs[structIndex].custom_fields = [...customFields, { id: `field_${Date.now()}`, name: "", amount: 0 }];
    setStructures(newStructs);
  };

  const removeCustomField = (structIndex: number, fieldIndex: number) => {
    const newStructs = [...structures];
    newStructs[structIndex].custom_fields.splice(fieldIndex, 1);
    setStructures(newStructs);
  };

  const handleCustomFieldChange = (structIndex: number, fieldIndex: number, key: string, value: string | number) => {
    const newStructs = [...structures];
    const field = newStructs[structIndex].custom_fields[fieldIndex];
    if (key === 'name') {
      field.name = value as string;
      field.id = (value as string).toLowerCase().replace(/\s+/g, '_');
    } else {
      field.amount = Number(value) || 0;
    }
    setStructures(newStructs);
  };

  const addNewClass = () => {
    const newId = `struct-${Date.now()}`;
    setStructures([{
      id: newId,
      class_name: "New Class",
      tuition_fee: 0,
      custom_fields: []
    }, ...structures]);
  };

  const deleteClass = async (index: number, id: string) => {
    if (!confirm("Are you sure you want to delete this class tariff?")) return;
    
    if (id) {
        await supabase.from('fee_structures').delete().eq('id', id);
    }
    const newStructs = [...structures];
    newStructs.splice(index, 1);
    setStructures(newStructs);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('fee_structures').upsert(
        structures.map(s => ({
          id: s.id,
          class_name: s.class_name,
          tuition_fee: s.tuition_fee,
          custom_fields: s.custom_fields || [],
          admission_fee: 0,
          exam_fee: 0,
          lab_fee: 0,
          is_public: true,
          kinship_enabled: true,
          kinship_discount_percent: 25
        }))
      );
      if (error) throw error;
      toast({
        title: "Tariffs Saved",
        description: "Class tariffs have been successfully updated.",
      });
      fetchStructures();
    } catch (error) {
      toast({
        title: "Error saving tariffs",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-white/20 shadow-sm backdrop-blur-md">
        <div>
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Class Tariffs</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage standard tuition fees and class-wide recurring custom charges.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={addNewClass} className="flex-1 md:flex-none border-emerald-500/30 hover:bg-emerald-500/10 transition-all rounded-xl">
              <Plus className="mr-2 h-4 w-4 text-emerald-600" /> Add Class
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 rounded-xl transition-all">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Tariffs
            </Button>
        </div>
      </div>

      {/* Grid of Classes */}
      <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {structures.map((struct, structIdx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              key={struct.id || structIdx}
              className="group relative overflow-hidden bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-border/50 bg-gradient-to-b from-muted/30 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <Input 
                      value={struct.class_name} 
                      onChange={(e) => handleStructureChange(structIdx, 'class_name', e.target.value)} 
                      placeholder="e.g. Class 1"
                      className="text-lg font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg" onClick={() => deleteClass(structIdx, struct.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="relative group/tuition mb-2">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="p-1.5 bg-emerald-600/10 rounded-lg">
                        <BadgeDollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 block leading-none mb-1">Standard Tuition</span>
                        <Input 
                          type="number" 
                          value={struct.tuition_fee} 
                          onChange={(e) => handleStructureChange(structIdx, 'tuition_fee', Number(e.target.value))}
                          className="h-6 border-none bg-transparent p-0 text-lg font-bold focus-visible:ring-0 shadow-none"
                        />
                      </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <HandCoins className="w-3 h-3" /> Extra Charges ({struct.custom_fields?.length || 0})
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => addCustomField(structIdx)} className="h-7 px-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg">
                        <Plus className="mr-1 h-3 w-3" /> Add Charge
                    </Button>
                </div>
              </div>

              {/* Card Body - Custom Fields */}
              <div className="p-3 space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                {(!struct.custom_fields || struct.custom_fields.length === 0) && (
                    <div className="text-center p-6 text-sm text-muted-foreground/70 italic border-2 border-dashed border-border/50 rounded-xl">
                      No extra standard charges.
                    </div>
                )}
                
                <AnimatePresence>
                  {struct.custom_fields?.map((field, fieldIdx) => (
                    <motion.div 
                      key={fieldIdx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="group/item flex items-center gap-2 p-2 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/20 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab active:cursor-grabbing opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      
                      <Input 
                        placeholder="Charge Name" 
                        value={field.name} 
                        onChange={(e) => handleCustomFieldChange(structIdx, fieldIdx, 'name', e.target.value)}
                        className="h-9 flex-1 bg-background/50 border-border/50 focus:bg-background rounded-lg text-sm"
                      />
                      
                      <div className="relative">
                        <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">Rs.</span>
                        <Input 
                          type="number" 
                          value={field.amount} 
                          onChange={(e) => handleCustomFieldChange(structIdx, fieldIdx, 'amount', e.target.value)}
                          className="h-9 w-[90px] pl-7 pr-2 bg-background/50 border-border/50 focus:bg-background rounded-lg text-sm"
                        />
                      </div>
                      
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all" onClick={() => removeCustomField(structIdx, fieldIdx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
