"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FeeRecord } from "@/app/admin/data-schemas";

interface ManagementFeeChartProps {
  feeRecords: FeeRecord[];
}

export function ManagementFeeChart({ feeRecords }: ManagementFeeChartProps) {
  const chartData = React.useMemo(() => {
    const classMap: Record<string, { class: string; paid: number; pending: number }> = {};

    feeRecords.forEach((record) => {
      const className = record.class_name || "Unassigned";
      if (!classMap[className]) {
        classMap[className] = { class: className, paid: 0, pending: 0 };
      }
      const paid = Number(record.amount_paid || 0);
      const total = Number(record.total_amount || 0);
      const pending = Math.max(0, total - paid);

      classMap[className].paid += paid;
      classMap[className].pending += pending;
    });

    return Object.values(classMap).sort((a, b) =>
      a.class.localeCompare(b.class, undefined, { numeric: true })
    );
  }, [feeRecords]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground italic">
        No fee records available to visualize.
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis 
            dataKey="class" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground" 
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground"
            tickFormatter={(val) => `Rs.${val > 999 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(15, 23, 42, 0.9)", 
              borderColor: "rgba(255, 255, 255, 0.1)", 
              borderRadius: "12px",
              backdropFilter: "blur(12px)",
              fontSize: "12px",
              color: "#fff"
            }} 
            formatter={(value: any) => [`Rs. ${Number(value || 0).toLocaleString()}`, ""]}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Bar dataKey="paid" name="Paid Amount" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" name="Pending Arrears" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
