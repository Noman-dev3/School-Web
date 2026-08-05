
"use client"

import { useState } from 'react';
import { askAI } from '@/ai/flows/ask-ai-flow';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send, Sparkles, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { FAQ, Teacher, Event, Topper, BoardStudent } from "@/app/admin/data-schemas";

interface AISearchDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    siteData: {
        settings: Record<string, any>;
        faqs: FAQ[];
        teachers: Teacher[];
        events: Event[];
        toppers: Topper[];
        boardStudents: BoardStudent[];
    };
}

export function AISearchDialog({ isOpen, onOpenChange, siteData }: AISearchDialogProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        setAnswer("");

        try {
            const aiResponse = await askAI({
                question,
                ...siteData
            });
            setAnswer(aiResponse);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            toast({
                title: "Error",
                description: "There was an issue with the AI assistant. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Search className="h-5 w-5" />
                        Ask PIISS Assistant
                    </DialogTitle>
                    <DialogDescription>
                        Ask any question about the school, our faculty, events, or results.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                   <form onSubmit={handleSubmit} className="flex gap-4">
                        <Input
                            type="text"
                            placeholder="e.g., Who is the head of science?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="bg-secondary flex-1 h-12 text-base"
                            disabled={loading}
                        />
                        <Button type="submit" size="lg" disabled={loading || !question.trim()}>
                           {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </form>
                </div>
                 
                {loading && (
                    <Card className="mt-4 bg-secondary/50 p-6 rounded-lg">
                        <div className="flex items-start space-x-4">
                            <div className="bg-primary/20 p-2 rounded-full">
                                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    </Card>
                )}

                {answer && !loading && (
                     <Card className="mt-4 bg-secondary/50 p-6 rounded-lg animate-in fade-in-50">
                        <CardContent className="p-0">
                            <div className="flex items-start space-x-4">
                                <div className="bg-primary/20 p-2 rounded-full">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-2">Answer:</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{answer}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </DialogContent>
        </Dialog>
    );
}
