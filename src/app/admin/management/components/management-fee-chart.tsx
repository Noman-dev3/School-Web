"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FeeRecord } from "@/app/admin/data-schemas";

interface ManagementFeeChartProps {
  feeRecords: FeeRecord[];
}

export function calculateStudentPendingArrears(vouchers: FeeRecord[]): number {
  if (!vouchers || vouchers.length === 0) return 0;

  const unpaid = vouchers.filter(v => v.status !== 'paid');
  if (unpaid.length === 0) return 0;

  const sorted = [...unpaid].sort((a, b) => 
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  const newest = sorted[0];
  if (Number(newest.arrears || 0) > 0) {
    return Math.max(0, Number(newest.total_amount || 0) - Number(newest.amount_paid || 0));
  }

  return sorted.reduce((sum, r) => sum + Math.max(0, Number(r.total_amount || 0) - Number(r.amount_paid || 0)), 0);
}

export function ManagementFeeChart({ feeRecords }: ManagementFeeChartProps) {
  const chartData = React.useMemo(() => {
    const classMap: Record<string, { class: string; paid: number; studentVouchers: Record<string, FeeRecord[]> }> = {};

    feeRecords.forEach((record) => {
      const className = record.class_name || "Unassigned";
      if (!classMap[className]) {
        classMap[className] = { class: className, paid: 0, studentVouchers: {} };
      }

      classMap[className].paid += Number(record.amount_paid || 0);

      const stId = String(record.student_id || record.student_name || "unknown");
      if (!classMap[className].studentVouchers[stId]) {
        classMap[className].studentVouchers[stId] = [];
      }
      classMap[className].studentVouchers[stId].push(record);
    });

    return Object.values(classMap).map((clsData) => {
      let pendingSum = 0;
      Object.values(clsData.studentVouchers).forEach((vouchers) => {
        pendingSum += calculateStudentPendingArrears(vouchers);
      });

      return {
        class: clsData.class,
        paid: clsData.paid,
        pending: pendingSum,
      };
    }).sort((a, b) => a.class.localeCompare(b.class, undefined, { numeric: true }));
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
