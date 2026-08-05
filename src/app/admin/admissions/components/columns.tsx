"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { statuses } from "../data/data"
import { Admission } from "../data/schema"
import { format } from "date-fns"
import { cn } from "@/lib/utils"


export const columns: ColumnDef<Admission>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "applicantName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applicant" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate font-medium">
            {row.getValue("applicantName")}
          </span>
        </div>
      )
    },
  },
    {
    accessorKey: "appliedClass",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Class" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[100px] truncate font-medium capitalize">
            {row.getValue("appliedClass")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }
      
      const statusColor = {
        pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
        approved: "bg-green-500/20 text-green-700 border-green-500/30",
        rejected: "bg-red-500/20 text-red-700 border-red-500/30",
      }[status.value] || "bg-muted text-muted-foreground";


      return (
        <div className="flex w-[100px] items-center">
            <Badge className={cn("capitalize", statusColor)}>
                {status.label}
            </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted At" />
    ),
    cell: ({ row }) => {
       const date = new Date(row.getValue("submittedAt"))
       const formattedDate = format(date, "MMM d, yyyy");
       return <span>{formattedDate}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
