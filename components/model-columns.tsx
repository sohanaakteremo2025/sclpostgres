// app/[model]/_components/model-columns.tsx
"use client";
import type { DataTableRowAction } from "@/types/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, Ellipsis, Text, User } from "lucide-react";
import * as React from "react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";

interface GetModelColumnsProps {
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<any> | null>>;
}

export function getModelColumns(
  model: string,
  { setRowAction }: GetModelColumnsProps
): ColumnDef<any>[] {
  // Base columns that most models will have
  const baseColumns: ColumnDef<any>[] = [
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
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
  ];

  // Model-specific columns
  let specificColumns: ColumnDef<any>[] = [];

  switch (model) {
    case "students":
      specificColumns = [
        {
          id: "name",
          accessorKey: "name",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
          ),
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{row.getValue("name")}</span>
            </div>
          ),
          meta: {
            label: "Name",
            placeholder: "Search names...",
            variant: "text",
            icon: Text,
          },
          enableColumnFilter: true,
        },
        {
          id: "email",
          accessorKey: "email",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
          ),
          cell: ({ row }) => (
            <span className="text-muted-foreground">{row.getValue("email")}</span>
          ),
          meta: {
            label: "Email",
            placeholder: "Search emails...",
            variant: "text",
            icon: Text,
          },
          enableColumnFilter: true,
        },
        {
          id: "class",
          accessorFn: (row) => row.class?.name,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Class" />
          ),
          cell: ({ row }) => {
            const className = row.original.class?.name;
            return className ? (
              <Badge variant="outline">{className}</Badge>
            ) : null;
          },
          enableColumnFilter: true,
        },
        {
          id: "section",
          accessorFn: (row) => row.section?.name,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Section" />
          ),
          cell: ({ row }) => {
            const sectionName = row.original.section?.name;
            return sectionName ? (
              <Badge variant="secondary">{sectionName}</Badge>
            ) : null;
          },
          enableColumnFilter: true,
        },
        {
          id: "status",
          accessorKey: "status",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
          ),
          cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
              <Badge 
                variant={status === "active" ? "default" : "secondary"}
              >
                {status}
              </Badge>
            );
          },
          meta: {
            label: "Status",
            variant: "multiSelect",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
          enableColumnFilter: true,
        },
      ];
      break;

    case "classes":
      specificColumns = [
        {
          id: "name",
          accessorKey: "name",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Class Name" />
          ),
          cell: ({ row }) => (
            <span className="font-medium">{row.getValue("name")}</span>
          ),
          meta: {
            label: "Class Name",
            placeholder: "Search classes...",
            variant: "text",
            icon: Text,
          },
          enableColumnFilter: true,
        },
        {
          id: "grade",
          accessorKey: "grade",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Grade" />
          ),
          cell: ({ row }) => (
            <Badge variant="outline">{row.getValue("grade")}</Badge>
          ),
        },
        {
          id: "studentCount",
          accessorFn: (row) => row.students?.length || 0,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Students" />
          ),
          cell: ({ row }) => (
            <span className="text-muted-foreground">
              {row.original.students?.length || 0}
            </span>
          ),
        },
      ];
      break;

    case "sections":
      specificColumns = [
        {
          id: "name",
          accessorKey: "name",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Section Name" />
          ),
          cell: ({ row }) => (
            <span className="font-medium">{row.getValue("name")}</span>
          ),
          meta: {
            label: "Section Name",
            placeholder: "Search sections...",
            variant: "text",
            icon: Text,
          },
          enableColumnFilter: true,
        },
        {
          id: "class",
          accessorFn: (row) => row.class?.name,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Class" />
          ),
          cell: ({ row }) => {
            const className = row.original.class?.name;
            return className ? (
              <Badge variant="outline">{className}</Badge>
            ) : null;
          },
        },
        {
          id: "capacity",
          accessorKey: "capacity",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Capacity" />
          ),
          cell: ({ row }) => (
            <span>{row.getValue("capacity")}</span>
          ),
        },
        {
          id: "studentCount",
          accessorFn: (row) => row.students?.length || 0,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Students" />
          ),
          cell: ({ row }) => (
            <span className="text-muted-foreground">
              {row.original.students?.length || 0}
            </span>
          ),
        },
      ];
      break;

    default:
      // Generic columns for unknown models
      specificColumns = [
        {
          id: "name",
          accessorKey: "name",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
          ),
          cell: ({ row }) => (
            <span className="font-medium">{row.getValue("name")}</span>
          ),
          meta: {
            label: "Name",
            placeholder: "Search...",
            variant: "text",
            icon: Text,
          },
          enableColumnFilter: true,
        },
      ];
  }

  // Common columns that most models have
  const commonColumns: ColumnDef<any>[] = [
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<Date>()),
      meta: {
        label: "Created At",
        variant: "dateRange",
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "update" })}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "delete" })}
              >
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];

  return [...baseColumns, ...specificColumns, ...commonColumns];
}