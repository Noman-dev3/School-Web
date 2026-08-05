
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart"
import { Student } from "../students/data/schema"

interface StudentsByClassChartProps {
    students: Student[];
}

const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function StudentsByClassChart({ students }: StudentsByClassChartProps) {
  const chartData = React.useMemo(() => {
    const classCounts = students.reduce((acc, student) => {
        const className = student.Class || "N/A";
        acc[className] = (acc[className] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(classCounts)
        .map(([className, count]) => ({ class: className, students: count }))
        .sort((a,b) => a.class.localeCompare(b.class, undefined, {numeric: true}));

  }, [students]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[300px]">
        <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
            }}
        >
            <CartesianGrid vertical={false} />
            <XAxis
            dataKey="class"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 10)}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="students" fill="var(--color-students)" radius={4} />
        </BarChart>
    </ChartContainer>
  )
}
