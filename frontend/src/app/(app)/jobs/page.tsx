"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetJobsQuery,
  useDeleteJobMutation,
  useFavoriteJobMutation,
} from "@/store/api/slices/jobsApi";
import { DataTable, DataTableToolbar } from "@/components/data-table";
import { AppButton, AppBadge, AppText } from "@/components/shared";
import { AppSelect } from "@/components/shared/AppSelect";
import type { ColumnDef } from "@tanstack/react-table";
import type { Job } from "@/store/types/api";
import { STATUS_VARIANT } from "./constants";
import { Heart, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JobsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const { data, isLoading, isFetching, error } = useGetJobsQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  const [deleteJob] = useDeleteJobMutation();
  const [favoriteJob] = useFavoriteJobMutation();

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm("Delete this job?")) {
        await deleteJob(id);
      }
    },
    [deleteJob],
  );

  const handleToggleFavorite = useCallback(
    (job: Job) => {
      favoriteJob({ id: job.id, isFavorite: !job.isFavorite });
    },
    [favoriteJob],
  );

  const columns: ColumnDef<Job>[] = [
    {
      accessorKey: "role",
      header: "Job Title",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <AppText variant="bodySm" weight="medium">
            {row.original.role}
          </AppText>
          <AppText variant="small" color="muted">
            {row.original.company}
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
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <AppText variant="bodySm" color="muted">
          {row.original.location ?? "—"}
        </AppText>
      ),
    },
    {
      accessorKey: "matchScore",
      header: "Match",
      cell: ({ row }) => {
        const score = row.original.matchScore;
        if (score == null) return <AppText variant="bodySm" color="muted">—</AppText>;
        return (
          <AppBadge
            variant={
              score >= 80 ? "success" : score >= 60 ? "warning" : "secondary"
            }
          >
            {score}%
          </AppBadge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <AppText variant="bodySm" color="muted">
          {formatDate(row.original.createdAt)}
        </AppText>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center gap-1">
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/jobs/${job.id}`)}
              aria-label="View job"
            >
              <Eye className="size-3.5" />
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => handleToggleFavorite(job)}
              aria-label={job.isFavorite ? "Unfavorite" : "Favorite"}
            >
              <Heart
                className={cn(
                  "size-3.5",
                  job.isFavorite && "fill-red-500 text-red-500",
                )}
              />
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(job.id)}
              aria-label="Delete job"
            >
              <Trash2 className="size-3.5 text-destructive" />
            </AppButton>
          </div>
        );
      },
    },
  ];

  const jobs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <AppText variant="h2">Jobs</AppText>
        <AppText variant="bodySm" color="muted" className="mt-1">
          Manage and track your job opportunities
        </AppText>
      </div>

      <DataTable
        columns={columns}
        data={jobs}
        loading={isLoading}
        emptyMessage={
          debouncedSearch || statusFilter
            ? "No jobs match your filters."
            : "Add your first job to get started."
        }
        error={error ? "Failed to load jobs. Please try again." : undefined}
      >
        <DataTableToolbar onSearch={setSearch} searchPlaceholder="Search jobs...">
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
