
"use client"

import { supabase } from "@/lib/supabase";
import { resultSchema, Result } from './data/schema';
import { z } from 'zod';
import { ResultCard } from './components/result-card';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileArchive, CheckSquare, Square, Loader2, RefreshCw } from 'lucide-react';
import { downloadBatchResultsZip } from '@/lib/docx-generator';
import { getSettings } from '@/lib/data-fetching';
import { useToast } from '@/hooks/use-toast';
import { BulkImportDialog } from './components/bulk-import-dialog';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExportingBatch, setIsExportingBatch] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    async function loadResults() {
      const { data, error } = await supabase.from('results').select('*');
      if (error) {
        console.error("Error fetching results:", error);
        setResults([]);
      } else if (data) {
        const resultsArray = data.map((item: any) => ({
          ...item,
          id: String(item.id),
        }));

        const parsedResults = z.array(resultSchema).safeParse(resultsArray);
        if (parsedResults.success) {
          setResults(parsedResults.data);
        } else {
          const validResults = resultsArray
            .map(item => resultSchema.safeParse(item))
            .map(r => r.success ? r.data : null).filter(Boolean) as any;
          setResults(validResults);
        }
      } else {
        setResults([]);
      }
      setLoading(false);
    }

    loadResults();

    const channel = supabase.channel('results-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, () => loadResults())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const uniqueClasses = useMemo(() => {
    const classSet = new Set<string>();
    results.forEach(r => {
      if (r.class) classSet.add(r.class);
    });
    return Array.from(classSet).sort();
  }, [results]);

  const rankedResults = useMemo(() => {
    const groupedByClassAndSession: Record<string, Result[]> = {};
    results.forEach(r => {
      const key = `${r.class}-${r.session}`;
      if (!groupedByClassAndSession[key]) {
        groupedByClassAndSession[key] = [];
      }
      groupedByClassAndSession[key].push(r);
    });

    const ranked: Result[] = [];
    Object.values(groupedByClassAndSession).forEach(group => {
      group.sort((a, b) => b.percentage - a.percentage);
      group.forEach((r, index) => {
        ranked.push({ ...r, rank: index + 1 });
      });
    });

    return ranked;
  }, [results]);

  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return rankedResults.filter(result => {
      const matchesQuery = result.student_name.toLowerCase().includes(q) ||
        result.roll_number.toLowerCase().includes(q) ||
        result.class.toLowerCase().includes(q);
      const matchesClass = selectedClass === "ALL" || result.class === selectedClass;
      return matchesQuery && matchesClass;
    });
  }, [rankedResults, searchQuery, selectedClass]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredResults.length && filteredResults.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResults.map(r => r.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExportBatchDocx = async (targetResults: Result[], label: string) => {
    if (targetResults.length === 0) {
      toast({
        title: "No Results Selected",
        description: "Please select at least one result to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExportingBatch(true);
      setExportProgress({ current: 0, total: targetResults.length });
      
      const settings = await getSettings();
      await downloadBatchResultsZip(targetResults, {
        schoolName: "PAKISTAN ISLAMIC INTERNATIONAL SCHOOL SYSTEM",
        tagline: "Excellence in Education",
        phone: settings.contactPhone,
        email: settings.contactEmail,
        address: settings.contactAddress,
      }, (current, total) => {
        setExportProgress({ current, total });
      });

      toast({
        title: "Batch Export Complete",
        description: `Successfully exported ${targetResults.length} student result DOCX documents into a ZIP archive.`,
      });
    } catch (err) {
      console.error("Batch DOCX export failed:", err);
      toast({
        title: "Export Failed",
        description: "An error occurred during batch DOCX generation.",
        variant: "destructive",
      });
    } finally {
      setIsExportingBatch(false);
      setExportProgress(null);
    }
  };

  if (loading) {
    return (
       <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
        </div>
         <Skeleton className="h-10 w-full mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
       </div>
    );
  }

  const selectedResultsList = filteredResults.filter(r => selectedIds.has(r.id));
  const isAllSelected = filteredResults.length > 0 && selectedIds.size === filteredResults.length;

  return (
    <div className="h-full flex-1 flex-col space-y-6 p-6 md:p-8 md:flex">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-headline text-foreground">Student Results</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate official DOCX reports, view academic performance, and manage student exam records.
          </p>
        </div>

        {/* Batch Export Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => handleExportBatchDocx(selectedResultsList, "Selected")}
            disabled={selectedIds.size === 0 || isExportingBatch}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs font-semibold gap-2 text-xs h-9 px-3.5"
          >
            {isExportingBatch ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileArchive className="h-4 w-4" />
            )}
            <span>
              {isExportingBatch && exportProgress
                ? `Exporting (${exportProgress.current}/${exportProgress.total})...`
                : `Export Selected (${selectedIds.size}) DOCX`}
            </span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExportBatchDocx(filteredResults, "All Filtered")}
            disabled={filteredResults.length === 0 || isExportingBatch}
            className="rounded-xl border-border/80 hover:bg-accent font-semibold gap-2 text-xs h-9 px-3.5"
          >
            <FileArchive className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export All ({filteredResults.length}) DOCX (.zip)</span>
          </Button>

          <BulkImportDialog />
        </div>
      </div>
      
      {/* Search, Filter & Bulk Select Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-border/60">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <Input 
            type="search"
            placeholder="Search by student name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs bg-background rounded-xl text-xs h-9"
          />

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[160px] bg-background rounded-xl text-xs h-9">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Classes</SelectItem>
              {uniqueClasses.map(c => (
                <SelectItem key={c} value={c}>Class {c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSelectAll}
            disabled={filteredResults.length === 0}
            className="text-xs h-8 px-2.5 rounded-lg gap-2 text-muted-foreground hover:text-foreground"
          >
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4 text-emerald-600" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{isAllSelected ? "Deselect All" : "Select All Visible"}</span>
          </Button>

          <span className="text-xs font-mono font-medium text-muted-foreground bg-background px-2.5 py-1 rounded-md border border-border/40">
            {filteredResults.length} {filteredResults.length === 1 ? 'Result' : 'Results'}
          </span>
        </div>
      </div>

      {/* Grid Display */}
      {filteredResults.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredResults.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              isSelected={selectedIds.has(result.id)}
              onToggleSelect={() => toggleSelectOne(result.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 bg-card/50 mt-4">
          <div className="flex flex-col items-center gap-2 text-center max-w-sm">
            <RefreshCw className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <h3 className="text-lg font-bold tracking-tight text-foreground">No matching results found</h3>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search query or class filter to find student examination records.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
