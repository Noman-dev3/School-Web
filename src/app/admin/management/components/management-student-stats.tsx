"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Student } from "@/app/admin/students/data/schema";
import { Result } from "@/app/admin/data-schemas";

interface ManagementStudentStatsProps {
  students: Student[];
  results: Result[];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export function ManagementStudentStats({ students, results }: ManagementStudentStatsProps) {
  const classDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const cls = s.Class || "Unassigned";
      counts[cls] = (counts[cls] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [students]);

  const resultsSummary = React.useMemo(() => {
    let passCount = 0;
    let failCount = 0;
    results.forEach((r) => {
      const pct = Number(r.percentage || 0);
      if (pct >= 40 || r.grade !== 'F') passCount++;
      else failCount++;
    });
    return { passCount, failCount, total: results.length };
  }, [results]);

  if (students.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground italic">
        No student distribution data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
      <div className="h-[220px] w-full md:w-1/2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center mb-1">
          Class Enrollment Share
        </p>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={classDistribution}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {classDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "rgba(15, 23, 42, 0.9)", 
                borderColor: "rgba(255, 255, 255, 0.1)", 
                borderRadius: "12px",
                fontSize: "12px"
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 space-y-3 p-3 rounded-xl bg-muted/20 border border-border/40">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Academic Overview
        </p>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-semibold">Exam Cards Published:</span>
          <span className="font-mono font-bold text-foreground">{resultsSummary.total}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-semibold">Passing Rate:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {resultsSummary.total > 0
              ? `${Math.round((resultsSummary.passCount / resultsSummary.total) * 100)}%`
              : "100%"}
          </span>
        </div>

        <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ 
              width: resultsSummary.total > 0 
                ? `${Math.round((resultsSummary.passCount / resultsSummary.total) * 100)}%` 
                : "100%" 
            }} 
          />
          <div 
            className="bg-rose-500 h-full transition-all duration-500" 
            style={{ 
              width: resultsSummary.total > 0 
                ? `${100 - Math.round((resultsSummary.passCount / resultsSummary.total) * 100)}%` 
                : "0%" 
            }} 
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {resultsSummary.passCount} Passed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {resultsSummary.failCount} Needs Imp.
          </span>
        </div>
      </div>
    </div>
  );
}
