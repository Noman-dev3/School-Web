
"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Result } from "@/app/admin/content-management/results/data/schema";
import { format } from "date-fns";
import { FileDown, Loader2 } from "lucide-react";
import { downloadSingleResultDocx } from "@/lib/docx-generator";
import { getSettings } from "@/lib/data-fetching";
import { useToast } from "@/hooks/use-toast";

const DetailItem = ({ label, value }: { label: string; value: string | number | undefined; }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold">{value ?? 'N/A'}</p>
    </div>
);

export function ResultCard({ result }: { result: Result }) {
    const [downloading, setDownloading] = useState(false);
    const { toast } = useToast();

    const handleDownloadDocx = async () => {
        try {
            setDownloading(true);
            const settings = await getSettings();
            await downloadSingleResultDocx(result, {
                schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
                tagline: "Excellence in Education",
                phone: settings.contactPhone,
                email: settings.contactEmail,
                address: settings.contactAddress,
            });
            toast({
                title: "Official DOCX Exported",
                description: `Downloaded result card for ${result.student_name}.`,
            });
        } catch (err) {
            console.error("DOCX download error:", err);
            toast({
                title: "Export Error",
                description: "Could not generate DOCX report document. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg bg-card/80 border-border/60 animate-in fade-in-50 zoom-in-95 rounded-2xl overflow-hidden">
            <CardHeader className="text-center bg-muted/40 p-6 border-b border-border/40">
                <CardTitle className="text-2xl font-extrabold font-headline text-foreground">Result for {result.student_name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                    Session: {result.session} | Published: {format(new Date(result.date_created), "PPP")}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-muted/20 p-4 rounded-xl border border-border/40">
                    <DetailItem label="Student Name" value={result.student_name} />
                    <DetailItem label="Roll Number" value={result.roll_number} />
                    <DetailItem label="Class" value={result.class} />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-muted/20 p-4 rounded-xl border border-border/40">
                    <DetailItem label="Grade" value={result.grade} />
                    <DetailItem label="Percentage" value={`${result.percentage}%`} />
                    <DetailItem label="Total Marks" value={`${result.total_marks} / ${result.max_marks}`} />
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2 mb-4">Subject-wise Breakdown</h3>
                    <div className="space-y-2.5">
                        {Object.entries(result.subjects).map(([subject, marks]) => (
                            <div key={subject} className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border/30">
                                <p className="font-medium text-sm text-foreground">{subject}</p>
                                <Badge variant="secondary" className="font-mono font-semibold px-3 py-1 text-xs">{marks} / 100</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-end bg-card">
                <Button
                    onClick={handleDownloadDocx}
                    disabled={downloading}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2.5 font-semibold text-sm shadow-xs h-10 px-5"
                >
                    {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <FileDown className="h-4 w-4" />
                    )}
                    <span>{downloading ? "Generating DOCX..." : "Download Official DOCX Report"}</span>
                </Button>
            </CardFooter>
        </Card>
    );
}
