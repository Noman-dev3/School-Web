import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function AdBanner() {
  return (
    <section className="py-8 bg-secondary/30">
      <div className="container mx-auto">
        <Card className="flex flex-col sm:flex-row items-center justify-between p-6 bg-background/50 border-dashed">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <Sparkles className="h-8 w-8 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">Advertise With Us</h3>
                    <p className="text-sm text-muted-foreground">Reach hundreds of local parents and students.</p>
                </div>
            </div>
            <Button asChild>
                <Link href="/#contact">Contact For Details</Link>
            </Button>
        </Card>
      </div>
    </section>
  );
}
