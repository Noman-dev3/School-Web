"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import Footer from "@/components/footer";
import { UploadCloud, CheckCircle2, ArrowLeft, Loader2, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { FeeRecord } from "@/app/admin/data-schemas";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function UploadSlipPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<FeeRecord | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) {
      router.push('/fees');
      return;
    }

    const fetchRecord = async () => {
      try {
        const { data, error } = await supabase
          .from('fees')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setRecord(data);
      } catch (error) {
        toast({ title: "Error loading voucher", variant: "destructive" });
        router.push('/fees');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, router, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !record) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${record.challan_number}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      const receiptUrl = publicUrlData.publicUrl;

      // Update fee record status to pending_approval
      const { error: updateError } = await supabase
        .from('fees')
        .update({ 
          status: 'pending_approval',
          receipt_url: receiptUrl,
          payment_date: new Date().toISOString()
        })
        .eq('id', record.id);

      if (updateError) throw updateError;

      setSuccess(true);
      toast({
        title: "Success!",
        description: "Your payment slip has been uploaded and is pending admin approval.",
      });

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 container max-w-2xl mx-auto py-24 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Upload Successful!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Thank you. Your payment slip for Challan #{record?.challan_number} has been submitted successfully and is awaiting admin approval.
          </p>
          <Button asChild size="lg">
            <Link href="/fees">Return to Fee Portal</Link>
          </Button>
        </main>
        <Footer content={{}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <Header />
      
      <main className="flex-1 container max-w-2xl mx-auto py-12 px-4">
        <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground">
          <Link href="/fees"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Search</Link>
        </Button>

        <Card className="border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl">Upload Payment Slip</CardTitle>
            <CardDescription>
              Upload a clear photo or screenshot of your paid bank slip for <strong>{record?.student_name}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1">Challan Number</p>
                <p className="font-mono font-bold">{record?.challan_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Fee Month</p>
                <p className="font-medium">{record?.month_year}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Total Payable</p>
                <p className="font-bold text-primary">Rs. {record?.total_amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <p className="font-medium capitalize text-amber-600">{record?.status}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Select Image File (Max 5MB)</label>
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:bg-primary/5 transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                  {file ? (
                    <>
                      <FileImage className="w-10 h-10 text-primary" />
                      <div>
                        <p className="font-medium text-primary">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <p className="text-xs text-primary/70 mt-2">Click or drag to replace file</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-muted-foreground" />
                      <p className="font-medium">Click to browse or drag and drop</p>
                      <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700" 
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <UploadCloud className="w-5 h-5 mr-2" />}
              {uploading ? "Uploading Slip..." : "Submit Payment Slip"}
            </Button>
          </CardFooter>
        </Card>
      </main>

      <Footer content={{}} />
    </div>
  );
}
