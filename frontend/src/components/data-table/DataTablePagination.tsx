"use client";

import { type Table } from "@tanstack/react-table";
import { AppButton } from "@/components/shared";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  className?: string;
}

export function DataTablePagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <p className="text-sm text-muted-foreground">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </p>
      <div className="flex items-center gap-2">
        <AppButton
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </AppButton>
        <AppButton
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </AppButton>
      </div>
    </div>
  );
}
