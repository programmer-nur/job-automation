"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetApplicationsQuery,
  useDeleteApplicationMutation,
  useUpdateApplicationStatusMutation,
} from "@/store/api/slices/applicationsApi";
import { DataTable, DataTableToolbar } from "@/components/data-table";
import { AppButton, AppBadge, AppText } from "@/components/shared";
import { AppSelect } from "@/components/shared/AppSelect";
import type { ColumnDef } from "@tanstack/react-table";
import type { Application, JobStatus } from "@/store/types/api";
import { STATUS_VARIANT } from "./constants";
import { Eye, Trash2 } from "lucide-react";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "READY_TO_APPLY", label: "Ready to Apply" },
  { value: "APPLIED", label: "Applied" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CLOSED", label: "Closed" },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { data, isLoading, isFetching, error } = useGetApplicationsQuery({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });

  const [deleteApplication] = useDeleteApplicationMutation();
  const [updateStatus] = useUpdateApplicationStatusMutation();

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm("Delete this application?")) {
        await deleteApplication(id);
      }
    },
    [deleteApplication],
  );

  const handleQuickStatus = useCallback(
    (id: string, status: JobStatus) => {
      updateStatus({ id, status });
    },
    [updateStatus],
  );

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "job",
      header: "Position",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <AppText variant="bodySm" weight="medium">
            {row.original.job.title}
          </AppText>
          <AppText variant="small" color="muted">
            {row.original.job.company}
          </AppText>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <AppBadge variant={STATUS_VARIANT[row.original.status]}>
          {row.original.status.replace(/_/g, " ")}
        </AppBadge>
      ),
    },
    {
      accessorKey: "appliedAt",
      header: "Applied",
      cell: ({ row }) => (
        <AppText variant="bodySm" color="muted">
          {formatDate(row.original.appliedAt)}
        </AppText>
      ),
    },
    {
      accessorKey: "followUpDate",
      header: "Follow Up",
      cell: ({ row }) => (
        <AppText variant="bodySm" color="muted">
          {formatDate(row.original.followUpDate)}
        </AppText>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.original.notes;
        return (
          <AppText variant="bodySm" color="muted" className="max-w-[200px] truncate">
            {notes ?? "—"}
          </AppText>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex items-center gap-1">
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/applications/${app.id}`)}
              aria-label="View application"
            >
              <Eye className="size-3.5" />
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(app.id)}
              aria-label="Delete application"
            >
              <Trash2 className="size-3.5 text-destructive" />
            </AppButton>
          </div>
        );
      },
    },
  ];

  const applications = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <AppText variant="h2">Applications</AppText>
        <AppText variant="bodySm" color="muted" className="mt-1">
          Track every application you have submitted
        </AppText>
      </div>

      <DataTable
        columns={columns}
        data={applications}
        loading={isLoading}
        emptyMessage={
          statusFilter
            ? "No applications match this status."
            : "Submit your first application to get started."
        }
        error={error ? "Failed to load applications. Please try again." : undefined}
      >
        <DataTableToolbar>
          <AppSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          />
        </DataTableToolbar>
      </DataTable>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <AppText variant="bodySm" color="muted">
            Showing {(page - 1) * meta.limit + 1}–{Math.min(page * meta.limit, meta.total)} of{" "}
            {meta.total}
          </AppText>
          <div className="flex items-center gap-2">
            <AppButton
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </AppButton>
            <AppButton
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </AppButton>
          </div>
        </div>
      )}
    </div>
  );
}
