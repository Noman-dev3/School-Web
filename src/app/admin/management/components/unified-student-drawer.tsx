"use client";

import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Student } from "../../students/data/schema";
import { FeeRecord, FeeStructure, Result } from "../../data-schemas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, BookOpen, User, CreditCard, Award, Plus, Edit, ReceiptText, Trash2, Calendar, FileText, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import html2canvas from "html2canvas";
import { AddResultModal } from "./add-result-modal";
import { EditFeeModal } from "./edit-fee-modal";
import { IssueFeeModal } from "./issue-fee-modal";
import { supabase } from "@/lib/supabase";
import { generateResultDocumentBlob } from "@/lib/docx-generator";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface UnifiedStudentDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  feeRecords: FeeRecord[];
  feeStructures: FeeStructure[];
  results: Result[];
  onDataChange: () => void;
}

export function UnifiedStudentDrawer({
  isOpen,
  onOpenChange,
  student,
  feeRecords,
  results,
  onDataChange
}: UnifiedStudentDrawerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isAddResultOpen, setIsAddResultOpen] = useState(false);
  const [isEditFeeOpen, setIsEditFeeOpen] = useState(false);
  const [isIssueFeeOpen, setIsIssueFeeOpen] = useState(false);
  const [selectedFeeToEdit, setSelectedFeeToEdit] = useState<FeeRecord | null>(null);

  const [feeFilter, setFeeFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [isDeletingFee, setIsDeletingFee] = useState<string | null>(null);
  const [feeToDuplicate, setFeeToDuplicate] = useState<FeeRecord | null>(null);

  if (!student) return null;

  let studentFees = feeRecords.filter(f => String(f.student_id) === String(student.id));
  if (feeFilter !== 'all') {
    studentFees = studentFees.filter(f => f.status === feeFilter);
  }

  const studentResults = results.filter(r => String(r.student_id) === String(student.id));

  const initials = student.Name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleDeleteFee = async (e: React.MouseEvent, feeId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this fee voucher? This action cannot be undone.")) return;
    
    setIsDeletingFee(feeId);
    try {
      const { error } = await supabase.from('fees').delete().eq('id', feeId);
      if (error) throw error;
      onDataChange();
    } catch (err) {
      console.error(err);
      alert("Failed to delete fee voucher.");
    } finally {
      setIsDeletingFee(null);
    }
  };

  const handleDownloadResult = async (res: Result) => {
    try {
      const schoolInfo = {
        schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
        tagline: "Excellence in Academic Rigor & Timeless Values",
        address: "Sector H-8/4, Educational Zone, Islamabad, Pakistan",
        phone: "+92 51 111 222 333",
        email: "info@piiss.edu.pk",
      };
      const blob = await generateResultDocumentBlob(res, schoolInfo);
      saveAs(blob, `Report_Card_${student.Name}_${res.session}.docx`);
      toast({ title: "Official DOCX Exported! 📄", description: `Downloaded Word report card for ${student.Name}.` });
    } catch (e: any) {
      toast({ title: "Export Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    try {
      const { error } = await supabase.from('results').delete().eq('id', resultId);
      if (error) throw error;
      toast({ title: "Result Deleted", description: "Academic result has been removed." });
      onDataChange();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-b from-emerald-900/10 to-transparent border-b border-border/50 shrink-0 z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/2"></div>
          
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-sm">
              ID #{student.id}
            </Badge>
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 gap-1.5 font-semibold text-xs shadow-sm shadow-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Active
            </Badge>
          </div>
          
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 rounded-2xl border border-white/20 shadow-xl shadow-black/5 bg-background">
              <AvatarImage src={student.profilePicture || undefined} alt={student.Name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-2xl rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight">{student.Name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-muted text-xs font-bold border border-border/50">
                  Class {student.Class || 'N/A'} {student.Section && `(${student.Section})`}
                </Badge>
                <span className="text-[11px] text-muted-foreground font-medium capitalize flex items-center gap-1">
                  <User className="w-3 h-3" /> {student.Gender || 'Not Provided'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-6 pt-4 shrink-0 z-10">
              <TabsList className="w-full grid grid-cols-3 rounded-2xl bg-muted/40 p-1.5 border border-border/50 backdrop-blur-md shadow-inner">
                <TabsTrigger value="profile" className="rounded-xl text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all duration-300 flex items-center gap-2 h-9">
                  <User className="w-4 h-4" /> Profile
                </TabsTrigger>
                <TabsTrigger value="fees" className="rounded-xl text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all duration-300 flex items-center gap-2 h-9">
                  <CreditCard className="w-4 h-4" /> Fees
                </TabsTrigger>
                <TabsTrigger value="results" className="rounded-xl text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all duration-300 flex items-center gap-2 h-9">
                  <Award className="w-4 h-4" /> Results ({studentResults.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 px-6">
              {/* Profile Tab */}
              <TabsContent value="profile" className="m-0 space-y-4 pt-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-muted/40 to-muted/10 rounded-2xl p-5 border border-white/10 shadow-sm space-y-4 text-sm backdrop-blur-md">
                  <h4 className="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-[11px] text-muted-foreground border-b border-border/50 pb-2">
                    <Phone className="w-4 h-4 text-emerald-600" /> Complete Student Profile Details
                  </h4>
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center group">
                      <span className="text-muted-foreground font-medium">Contact Phone:</span>
                      {student.Contact && student.Contact !== '0300 0000000' ? (
                        <a 
                          href={`https://wa.me/${student.Contact.replace(/[^\d]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1.5 transition-colors bg-emerald-500/10 px-2 py-1 rounded-lg"
                        >
                          <MessageCircle className="w-4 h-4" /> {student.Contact}
                        </a>
                      ) : (
                        <span className="font-semibold text-foreground">Not Provided</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Home Address:</span>
                      <span className="font-semibold text-foreground text-right max-w-[60%]">{student.Address && student.Address !== 'Swat Valley' ? student.Address : 'Not Provided'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Date Enrolled:</span>
                      <span className="font-semibold text-foreground font-mono bg-muted px-2 py-1 rounded-lg border border-border/50">
                        {student.Date_Added ? new Date(student.Date_Added).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not Provided'}
                      </span>
                    </div>
                  </div>
                </motion.div>
                <Button variant="outline" className="w-full gap-2 rounded-xl text-sm font-bold h-12 border-border/80 bg-background/50 backdrop-blur-sm hover:bg-muted/80 shadow-sm hover:shadow-md transition-all">
                  <Edit className="w-4 h-4 text-emerald-600" /> Edit Profile Details
                </Button>
              </TabsContent>

              {/* Fees Tab */}
              <TabsContent value="fees" className="m-0 space-y-4">
                <div className="flex justify-between items-center bg-muted/30 p-2 pl-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <h4 className="font-bold text-sm flex items-center gap-2"><ReceiptText className="w-4 h-4 text-emerald-600"/> Fee History</h4>
                  <div className="flex gap-2">
                    <select 
                      className="text-xs bg-background/80 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 outline-none font-semibold shadow-sm focus:ring-2 focus:ring-emerald-500/20"
                      value={feeFilter}
                      onChange={(e) => setFeeFilter(e.target.value as any)}
                    >
                      <option value="all">All Vouchers</option>
                      <option value="paid">Paid Only</option>
                      <option value="pending">Pending Only</option>
                      <option value="overdue">Overdue Only</option>
                    </select>
                  </div>
                </div>

                {studentFees.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-3">
                    <ReceiptText className="w-10 h-10 text-muted-foreground/30" />
                    <p className="text-sm font-semibold text-muted-foreground">No fee records found for this filter.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {studentFees.map((fee, idx) => (
                        <motion.div 
                          key={fee.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group relative overflow-hidden bg-background/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
                        >
                          {/* Top Status Bar / Ribbon */}
                          <div className={`absolute top-0 left-0 w-full h-1.5 ${
                            fee.status === 'paid' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                            fee.status === 'overdue' ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                            'bg-gradient-to-r from-amber-400 to-orange-500'
                          }`} />

                          {/* "Stamp" Watermark */}
                          <div className={`absolute -right-6 -bottom-6 text-[80px] font-black uppercase tracking-tighter -rotate-12 opacity-[0.03] pointer-events-none select-none ${
                            fee.status === 'paid' ? 'text-emerald-500' :
                            fee.status === 'overdue' ? 'text-rose-500' :
                            'text-amber-500'
                          }`}>
                            {fee.status}
                          </div>

                          <div className="p-5 flex flex-col gap-4 relative z-10">
                            {/* Header Row */}
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-lg font-mono tracking-tight text-foreground">{fee.challan_number}</p>
                                  <Badge className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border-none ${
                                    fee.status === 'paid' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                                    fee.status === 'overdue' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400' :
                                    'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                  }`}>
                                    {fee.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" /> Billing Month: <span className="text-foreground">{fee.month_year}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Total Amount</p>
                                <p className="font-black text-2xl text-foreground tracking-tight">
                                  <span className="text-muted-foreground/50 text-lg">Rs.</span> {Number(fee.total_amount).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="bg-muted/30 rounded-2xl p-4 border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 backdrop-blur-sm">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Tuition</span>
                                <span className="text-sm font-extrabold text-foreground">Rs. {Number(fee.tuition_fee || 0).toLocaleString()}</span>
                              </div>
                              {(fee.exam_fee > 0 || fee.lab_fee > 0) && (
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Exams/Labs</span>
                                  <span className="text-sm font-extrabold text-foreground">Rs. {Number((fee.exam_fee || 0) + (fee.lab_fee || 0)).toLocaleString()}</span>
                                </div>
                              )}
                              {(fee.arrears > 0) && (
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Arrears</span>
                                  <span className="text-sm font-extrabold text-rose-600">Rs. {Number(fee.arrears || 0).toLocaleString()}</span>
                                </div>
                              )}
                              {(fee.discount > 0) && (
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Discount</span>
                                  <span className="text-sm font-extrabold text-emerald-600">-Rs. {Number(fee.discount || 0).toLocaleString()}</span>
                                </div>
                              )}
                              {fee.custom_fields && fee.custom_fields.length > 0 && (
                                <div className="flex flex-col sm:col-span-4 mt-1 pt-3 border-t border-border/50">
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1"><Plus className="w-3 h-3"/> Extra Charges</span>
                                  <div className="flex flex-wrap gap-2">
                                    {fee.custom_fields.map((c: any, i: number) => (
                                      <Badge key={i} variant="secondary" className="bg-background/80 border border-white/10 text-xs font-semibold px-2.5 py-1">
                                        {c.name}: <span className="text-foreground ml-1">Rs.{c.amount}</span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center mt-1">
                              {fee.notes && (
                                <p className="text-[11px] text-muted-foreground italic flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                  <FileText className="w-3 h-3" /> {fee.notes}
                                </p>
                              )}
                              <div className="flex justify-end gap-2 w-full">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-9 text-xs rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold px-3" 
                                  disabled={isDeletingFee === fee.id} 
                                  onClick={(e) => handleDeleteFee(e, fee.id)}
                                >
                                  {isDeletingFee === fee.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}
                                  Delete
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-9 text-xs rounded-xl font-bold gap-1.5 px-3 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10" 
                                  onClick={() => { setFeeToDuplicate(fee); setIsIssueFeeOpen(true); }}
                                >
                                  <Copy className="w-3.5 h-3.5 text-emerald-600" /> Duplicate
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-9 text-xs rounded-xl font-bold gap-1.5 px-4 shadow-sm border border-border/50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors" 
                                  onClick={() => { setSelectedFeeToEdit(fee); setIsEditFeeOpen(true); }}
                                >
                                  <Edit className="w-3.5 h-3.5" /> Modify / Pay
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="results" className="m-0 space-y-4">
                <div className="flex justify-between items-center bg-muted/30 p-2 pl-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <h4 className="font-bold text-sm flex items-center gap-2"><Award className="w-4 h-4 text-blue-600"/> Academic History</h4>
                </div>
                
                {studentResults.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-3">
                    <Award className="w-10 h-10 text-muted-foreground/30" />
                    <p className="text-sm font-semibold text-muted-foreground">No academic results recorded yet.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {studentResults.map((res, idx) => (
                        <motion.div 
                          key={res.id}
                          id={`result-card-${res.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="rounded-3xl border border-white/10 shadow-sm hover:shadow-md bg-gradient-to-r from-emerald-500/5 to-teal-500/5 backdrop-blur-xl overflow-hidden relative group"
                        >
                          <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold gap-1 shadow-sm border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10" onClick={() => handleDownloadResult(res)}>
                              <FileText className="w-3 h-3 text-emerald-600" /> DOCX
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={() => handleDeleteResult(res.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <div className="p-5 flex justify-between items-center relative z-10">
                            <div>
                              <p className="font-black text-lg text-foreground tracking-tight">{res.session} Exam</p>
                              <p className="text-xs font-semibold text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" /> Grade {res.class}
                              </p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <div className="flex items-baseline gap-1">
                                <span className="font-black text-3xl text-blue-600 tracking-tighter">{res.percentage}</span>
                                <span className="font-bold text-muted-foreground text-sm">%</span>
                              </div>
                              <Badge variant="outline" className="text-[11px] font-black px-3 py-0.5 mt-1 rounded-full border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm">
                                Grade {res.grade}
                              </Badge>
                            </div>
                          </div>
                          {res.subjects && Object.keys(res.subjects).length > 0 && (
                            <div className="bg-background/80 p-4 border-t border-white/10 flex gap-2 overflow-x-auto custom-scrollbar">
                              {Object.entries(res.subjects).map(([sub, score], i) => (
                                <div key={i} className="flex flex-col items-center justify-center min-w-[70px] p-2 rounded-xl bg-muted/50 border border-border/50 shrink-0">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 truncate w-full text-center">{sub}</span>
                                  <span className="text-sm font-black text-foreground">{String(score)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>

            {/* STICKY QUICK ACTIONS BAR */}
            <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur flex justify-between gap-3 shrink-0">
              <Button 
                variant="outline"
                className="flex-1 h-12 rounded-xl font-bold gap-2 text-emerald-600 border-emerald-500/20 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm"
                onClick={() => setIsIssueFeeOpen(true)}
              >
                <ReceiptText className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Issue Fee</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex-1 h-12 rounded-xl font-bold gap-2 text-blue-600 border-blue-500/20 hover:text-blue-700 hover:bg-blue-50 transition-all shadow-sm"
                onClick={() => setIsAddResultOpen(true)}
              >
                <Award className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Add Result</span>
              </Button>
            </div>
          </Tabs>
        </div>
      </SheetContent>

      <AddResultModal 
        isOpen={isAddResultOpen} 
        onOpenChange={setIsAddResultOpen} 
        student={student} 
        onSuccess={onDataChange} 
      />

      <EditFeeModal
        isOpen={isEditFeeOpen}
        onOpenChange={setIsEditFeeOpen}
        fee={selectedFeeToEdit}
        onSuccess={onDataChange}
      />

      <IssueFeeModal
        isOpen={isIssueFeeOpen}
        onOpenChange={(open) => {
          setIsIssueFeeOpen(open);
          if (!open) setFeeToDuplicate(null);
        }}
        student={student}
        initialFeeData={feeToDuplicate}
        onSuccess={onDataChange}
      />
    </Sheet>
  );
}
