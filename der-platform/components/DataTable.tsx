import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, string | number | ReactNode>[];
  className?: string;
}

export function DataTable({ columns, rows, className }: DataTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-navy-border", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy-light border-b border-navy-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-left text-gray-400 uppercase text-xs tracking-wider px-4 py-3 font-medium whitespace-nowrap",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-navy-border/50 last:border-0 hover:bg-navy-light/40 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-white", col.className)}>
                  {row[col.key] as ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
