"use client"

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save, Copy, GripVertical, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface ResultTemplate {
  id: string;
  class_name: string;
  subjects: { name: string; maxMarks: number }[];
}

export function ResultTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ResultTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase.from('result_templates').select('*').order('class_name');
    if (!error && data) {
      setTemplates(data as ResultTemplate[]);
    }
    setLoading(false);
  };

  const handleTemplateChange = (index: number, field: string, value: string) => {
    const newTemplates = [...templates];
    newTemplates[index] = { ...newTemplates[index], [field]: value };
    setTemplates(newTemplates);
  };

  const addSubject = (templateIndex: number) => {
    const newTemplates = [...templates];
    const subjects = newTemplates[templateIndex].subjects || [];
    newTemplates[templateIndex].subjects = [...subjects, { name: "", maxMarks: 100 }];
    setTemplates(newTemplates);
  };

  const removeSubject = (templateIndex: number, subjectIndex: number) => {
    const newTemplates = [...templates];
    newTemplates[templateIndex].subjects.splice(subjectIndex, 1);
    setTemplates(newTemplates);
  };

  const handleSubjectChange = (templateIndex: number, subjectIndex: number, key: string, value: string | number) => {
    const newTemplates = [...templates];
    const subject = newTemplates[templateIndex].subjects[subjectIndex];
    if (key === 'name') {
      subject.name = value as string;
    } else {
      subject.maxMarks = Number(value) || 0;
    }
    setTemplates(newTemplates);
  };

  const addNewTemplate = () => {
    setTemplates([{
      id: "", 
      class_name: "New Class",
      subjects: [{ name: "English", maxMarks: 100 }, { name: "Urdu", maxMarks: 100 }, { name: "Maths", maxMarks: 100 }]
    }, ...templates]);
  };

  const cloneTemplate = (index: number) => {
    const original = templates[index];
    setTemplates([{
      id: "",
      class_name: `${original.class_name} (Copy)`,
      subjects: JSON.parse(JSON.stringify(original.subjects)) // Deep copy
    }, ...templates]);
    toast({
      title: "Template Cloned",
      description: "Don't forget to rename the class and save!",
    });
  };

  const deleteTemplate = async (index: number, id: string) => {
    if (!confirm("Are you sure you want to delete this result template?")) return;
    
    if (id) {
        await supabase.from('result_templates').delete().eq('id', id);
    }
    const newTemplates = [...templates];
    newTemplates.splice(index, 1);
    setTemplates(newTemplates);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToUpsert = templates.map(t => {
        const obj: any = {
          class_name: t.class_name,
          subjects: t.subjects || []
        };
        if (t.id) obj.id = t.id;
        return obj;
      });

      const { error } = await supabase.from('result_templates').upsert(dataToUpsert, { onConflict: 'class_name' });
      if (error) throw error;
      toast({
        title: "Templates Saved",
        description: "Result templates have been successfully updated.",
      });
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error saving templates",
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-white/20 shadow-sm backdrop-blur-md">
        <div>
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">Result Templates</h3>
          <p className="text-sm text-muted-foreground mt-1">Design default subject lists for each class to automate result entries.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={addNewTemplate} className="flex-1 md:flex-none border-emerald-500/30 hover:bg-emerald-500/10 transition-all rounded-xl">
              <Plus className="mr-2 h-4 w-4 text-emerald-600" /> New Template
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 rounded-xl transition-all">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save All Changes
            </Button>
        </div>
      </div>

      {/* Grid of Templates */}
      <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {templates.map((template, templateIdx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              key={template.id || templateIdx} // Using idx for new ones until they get an ID
              className="group relative overflow-hidden bg-background/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-border/50 bg-gradient-to-b from-muted/30 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <Input 
                      value={template.class_name} 
                      onChange={(e) => handleTemplateChange(templateIdx, 'class_name', e.target.value)} 
                      placeholder="e.g. Class 1"
                      className="text-lg font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg" onClick={() => cloneTemplate(templateIdx)} title="Duplicate Template">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg" onClick={() => deleteTemplate(templateIdx, template.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Subjects ({template.subjects?.length || 0})
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => addSubject(templateIdx)} className="h-7 px-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg">
                        <Plus className="mr-1 h-3 w-3" /> Add Subject
                    </Button>
                </div>
              </div>

              {/* Card Body - Subjects List */}
              <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {(!template.subjects || template.subjects.length === 0) && (
                    <div className="text-center p-6 text-sm text-muted-foreground/70 italic border-2 border-dashed border-border/50 rounded-xl">
                      No subjects added yet.
                    </div>
                )}
                
                <AnimatePresence>
                  {template.subjects?.map((subject, subjectIdx) => (
                    <motion.div 
                      key={subjectIdx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="group/item flex items-center gap-2 p-2 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/20 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab active:cursor-grabbing opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      
                      <Input 
                        placeholder="Subject Name" 
                        value={subject.name} 
                        onChange={(e) => handleSubjectChange(templateIdx, subjectIdx, 'name', e.target.value)}
                        className="h-9 flex-1 bg-background/50 border-border/50 focus:bg-background rounded-lg text-sm"
                      />
                      
                      <div className="relative">
                        <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">Max:</span>
                        <Input 
                          type="number" 
                          value={subject.maxMarks} 
                          onChange={(e) => handleSubjectChange(templateIdx, subjectIdx, 'maxMarks', e.target.value)}
                          className="h-9 w-[80px] pl-10 pr-2 bg-background/50 border-border/50 focus:bg-background rounded-lg text-sm"
                        />
                      </div>
                      
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all" onClick={() => removeSubject(templateIdx, subjectIdx)}>
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
