"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "./components/general-settings";
import { ClassTariffs } from "./components/class-tariffs";
import { ResultTemplates } from "./components/result-templates";
import { Building, Settings, BookOpen } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
                <p className="text-muted-foreground">
                    Manage website content, class tariffs, and result templates.
                </p>
            </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="general" className="flex items-center gap-2">
                    <Building className="h-4 w-4" /> Website Settings
                </TabsTrigger>
                <TabsTrigger value="tariffs" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Class Tariffs
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Result Templates
                </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-0">
                <GeneralSettings />
            </TabsContent>

            <TabsContent value="tariffs" className="mt-0">
                <ClassTariffs />
            </TabsContent>

            <TabsContent value="results" className="mt-0">
                <ResultTemplates />
            </TabsContent>
        </Tabs>
    </div>
  );
}
