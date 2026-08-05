

"use client"
import { BackToTopButton } from "@/components/back-to-top-button";
import Footer from "@/components/footer";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { Search, Trophy } from "lucide-react";
import { ResultCard } from "@/components/result-card";
import { supabase } from "@/lib/supabase";
import { Result, resultSchema } from "@/app/admin/content-management/results/data/schema";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { getSettings } from "@/lib/data-fetching";

async function getAllResults(): Promise<Result[]> {
    try {
        const { data, error } = await supabase.from('results').select('*');
        if (!error && data) {
            const itemsArray = data.map((item: any) => ({
                ...item,
                id: String(item.id),
            }));
            const parsedItems = z.array(resultSchema).safeParse(itemsArray);
            if (parsedItems.success) {
                return parsedItems.data;
            }
        }
        return [];
    } catch (error) {
        console.error("Error fetching results:", error);
        return [];
    }
}

export default function ResultsPage() {
    const [allResults, setAllResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState({ name: "", rollNumber: "", studentClass: "" });
    const [foundResults, setFoundResults] = useState<Result[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [noResultsFound, setNoResultsFound] = useState(false);

    const [positionClass, setPositionClass] = useState<string>("");
    const [positionHolders, setPositionHolders] = useState<Result[]>([]);
    const [isFetchingPositions, setIsFetchingPositions] = useState(false);

    const [footerContent, setFooterContent] = useState({});

    useEffect(() => {
        getAllResults().then(data => {
            setAllResults(data);
            setLoading(false);
        });
        getSettings().then(settings => {
            setFooterContent({
                facebookUrl: settings.facebookUrl,
                instagramUrl: settings.instagramUrl,
                linkedinUrl: settings.linkedinUrl,
                twitterUrl: settings.twitterUrl,
            });
        });
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setNoResultsFound(false);

        setTimeout(() => {
            const results = allResults.filter(r =>
                (!searchQuery.name || r.student_name.toLowerCase().includes(searchQuery.name.toLowerCase().trim())) &&
                (!searchQuery.rollNumber || r.roll_number.toLowerCase().includes(searchQuery.rollNumber.toLowerCase().trim())) &&
                (!searchQuery.studentClass || r.class.toLowerCase().includes(searchQuery.studentClass.toLowerCase().trim()))
            );
            setFoundResults(results);
            if (results.length === 0) {
                setNoResultsFound(true);
            }
            setIsSearching(false);
        }, 500);
    };

    const handlePositionSearch = () => {
        if (!positionClass) return;
        setIsFetchingPositions(true);
        
        const classResults = allResults.filter(r => r.class === positionClass);

        if (classResults.length > 0) {
            const sorted = classResults.sort((a, b) => b.percentage - a.percentage);
            setPositionHolders(sorted.slice(0, 3));
        } else {
            setPositionHolders([]);
        }
        
        setIsFetchingPositions(false);
    };

    const uniqueClasses = useMemo(() => {
        const classSet = new Set<string>();
        allResults.forEach(r => classSet.add(r.class));
        return Array.from(classSet).sort();
    }, [allResults]);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 py-12 md:py-24 lg:py-32">
                <div className="container mx-auto px-4 space-y-12">
                    <Card className="max-w-4xl mx-auto bg-secondary/30 border-border/20">
                        <CardHeader className="text-center">
                            <CardTitle className="text-4xl font-bold font-headline">Find Student Result</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter any details to find a student&apos;s academic result.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Student Name</Label>
                                        <Input id="name" value={searchQuery.name} onChange={e => setSearchQuery({...searchQuery, name: e.target.value})} className="bg-background"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rollNumber">Roll Number</Label>
                                        <Input id="rollNumber" value={searchQuery.rollNumber} onChange={e => setSearchQuery({...searchQuery, rollNumber: e.target.value})} className="bg-background"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="studentClass">Class</Label>
                                        <Input id="studentClass" value={searchQuery.studentClass} onChange={e => setSearchQuery({...searchQuery, studentClass: e.target.value})} className="bg-background"/>
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading || isSearching} className="w-full">
                                    <Search className="mr-2 h-4 w-4" /> 
                                    {isSearching ? "Searching..." : "Find Result"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-8">
                        {isSearching ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Skeleton className="w-full h-80" />
                                <Skeleton className="w-full h-80" />
                            </div>
                        ) : foundResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                {foundResults.map(result => <ResultCard key={result.id} result={result} />)}
                            </div>
                        ) : noResultsFound && (
                            <Alert variant="destructive" className="max-w-2xl mx-auto">
                                <AlertTitle>Result Not Found</AlertTitle>
                                <AlertDescription>
                                    We could not find any results matching the details provided. Please check the information and try again.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                     <Card className="max-w-4xl mx-auto bg-secondary/30 border-border/20">
                        <CardHeader className="text-center">
                            <CardTitle className="text-4xl font-bold font-headline">Class Position Holders</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                View the top performers in each class.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Select onValueChange={setPositionClass} value={positionClass}>
                                    <SelectTrigger className="flex-1 bg-background">
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uniqueClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Drawer>
                                    <DrawerTrigger asChild>
                                        <Button onClick={handlePositionSearch} disabled={!positionClass || isFetchingPositions} className="w-full sm:w-auto">
                                            <Trophy className="mr-2 h-4 w-4" />
                                            {isFetchingPositions ? "Fetching..." : "View Toppers"}
                                        </Button>
                                    </DrawerTrigger>
                                    <DrawerContent>
                                        <div className="mx-auto w-full max-w-2xl">
                                            <DrawerHeader>
                                                <DrawerTitle>Top Performers for {positionClass}</DrawerTitle>
                                                <DrawerDescription>Ranking is based on overall percentage.</DrawerDescription>
                                            </DrawerHeader>
                                            <div className="p-4 pb-0">
                                                {positionHolders.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {positionHolders.map((topper, index) => (
                                                            <div key={topper.id} className="flex items-center gap-4 rounded-lg border p-4">
                                                                <div className="text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                                                    {index + 1}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold">{topper.student_name}</p>
                                                                    <p className="text-sm text-muted-foreground">Roll No: {topper.roll_number}</p>
                                                                </div>
                                                                <div className="text-lg font-bold text-right">
                                                                    <p>{topper.percentage}%</p>
                                                                    <p className="text-sm font-medium text-muted-foreground">{topper.grade} Grade</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-muted-foreground py-8">No position holder data available for this class.</p>
                                                )}
                                            </div>
                                        </div>
                                    </DrawerContent>
                                </Drawer>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>
            <Footer content={footerContent} />
            <BackToTopButton />
        </div>
    );
}
