"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import Footer from "@/components/footer";
import { Search, FileText, Download, UploadCloud, AlertTriangle, CheckCircle2, Loader2, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { FeeRecord } from "@/app/admin/data-schemas";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { format } from "date-fns";

export default function PublicFeesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FeeRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      // Search by challan_number, student_id, or student_name
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .or(`challan_number.ilike.%${searchQuery}%,student_id.ilike.%${searchQuery}%,student_name.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
      case 'overdue': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200';
      case 'pending_approval': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Student Fee Portal</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Search for your fee voucher by Student ID, Challan Number, or Student Name to download the slip or upload a payment receipt.
          </p>
        </div>

        <Card className="border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Find Fee Voucher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Challan #, Student ID, or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="h-12 px-8">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {hasSearched && (
          <div className="mt-8 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Search Results
            </h3>
            
            {results.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground flex flex-col items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-500/50" />
                <p>No fee vouchers found matching your query. Please double check the ID or Challan Number.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {results.map((record) => (
                  <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{record.student_name}</h4>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {record.student_id || 'N/A'}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(record.status)}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-6 flex-1 text-sm">
                        <div className="flex justify-between border-b border-border/40 pb-1.5">
                          <span className="text-muted-foreground">Class:</span>
                          <span className="font-medium">{record.class_name} {record.section && `(${record.section})`}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/40 pb-1.5">
                          <span className="text-muted-foreground">Fee Month:</span>
                          <span className="font-medium">{record.month_year}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/40 pb-1.5">
                          <span className="text-muted-foreground">Challan #:</span>
                          <span className="font-mono text-xs">{record.challan_number}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-muted-foreground">Total Payable:</span>
                          <span className="font-bold text-base text-primary">Rs. {record.total_amount.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-auto">
                        <Button variant="outline" className="w-full justify-between" asChild>
                          <Link href={`/fees/download?id=${record.id}`}>
                            Download Voucher <Download className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        
                        {(record.status === 'pending' || record.status === 'overdue' || record.status === 'partial') && (
                          <Button className="w-full justify-between bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                            <Link href={`/fees/pay?id=${record.id}`}>
                              Upload Payment Slip <UploadCloud className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        )}

                        {record.status === 'pending_approval' && (
                          <div className="w-full bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 p-2 rounded-md text-xs flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800">
                            <Clock className="w-3.5 h-3.5" /> Slip submitted. Pending admin approval.
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer content={{}} />
    </div>
  );
}
