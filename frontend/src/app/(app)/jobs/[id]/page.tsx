"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useGetJobQuery,
  useDeleteJobMutation,
  useFavoriteJobMutation,
  useUpdateJobStatusMutation,
} from "@/store/api/slices/jobsApi";
import { AppButton, AppBadge, AppText, AppSpinner } from "@/components/shared";
import { STATUS_VARIANT } from "../constants";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGetJobQuery(id);
  const [deleteJob] = useDeleteJobMutation();
  const [favoriteJob] = useFavoriteJobMutation();
  const [updateStatus] = useUpdateJobStatusMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <AppSpinner size="lg" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex flex-col items-center gap-4 py-32">
        <AppText color="destructive">Failed to load job</AppText>
        <AppButton variant="outline" onClick={() => router.push("/jobs")}>
          Back to Jobs
        </AppButton>
      </div>
    );
  }

  const job = data.data;

  const handleDelete = async () => {
    if (confirm("Delete this job?")) {
      await deleteJob(id);
      router.push("/jobs");
    }
  };

  const handleToggleFavorite = () => {
    favoriteJob({ id, isFavorite: !job.isFavorite });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <AppButton variant="ghost" size="sm" onClick={() => router.push("/jobs")}>
          <ArrowLeft className="size-4" />
        </AppButton>
        <div className="flex-1">
          <AppText variant="h2">{job.role}</AppText>
          <AppText variant="body" color="muted">
            {job.company}
          </AppText>
        </div>
        <div className="flex items-center gap-2">
          <AppButton
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            aria-label={job.isFavorite ? "Unfavorite" : "Favorite"}
          >
            <Heart
              className={cn(
                "size-4",
                job.isFavorite && "fill-red-500 text-red-500",
              )}
            />
          </AppButton>
          <AppButton
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            aria-label="Delete job"
          >
            <Trash2 className="size-4 text-destructive" />
          </AppButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <AppBadge variant={STATUS_VARIANT[job.status]}>
          {job.status.replace(/_/g, " ")}
        </AppBadge>
        {job.matchScore != null && (
          <AppBadge
            variant={
              job.matchScore >= 80
                ? "success"
                : job.matchScore >= 60
                  ? "warning"
                  : "secondary"
            }
          >
            {job.matchScore}% Match
          </AppBadge>
        )}
        <AppBadge
          variant={
            job.priority === "HIGH"
              ? "warning"
              : job.priority === "MEDIUM"
                ? "info"
                : "secondary"
          }
        >
          {job.priority}
        </AppBadge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <AppText variant="h4">Details</AppText>
          <div className="space-y-2">
            {job.location && (
              <div className="flex justify-between">
                <AppText variant="bodySm" color="muted">Location</AppText>
                <AppText variant="bodySm">{job.location}</AppText>
              </div>
            )}
            {job.salaryMin != null && job.salaryMax != null && (
              <div className="flex justify-between">
                <AppText variant="bodySm" color="muted">Salary</AppText>
                <AppText variant="bodySm">{job.salaryMin}–{job.salaryMax} {job.currency}</AppText>
              </div>
            )}
            {job.source && (
              <div className="flex justify-between">
                <AppText variant="bodySm" color="muted">Source</AppText>
                <AppText variant="bodySm">{job.source}</AppText>
              </div>
            )}
            {job.jobUrl && (
              <div className="flex justify-between">
                <AppText variant="bodySm" color="muted">URL</AppText>
                <AppText variant="bodySm">
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Open posting
                  </a>
                </AppText>
              </div>
            )}
            <div className="flex justify-between">
              <AppText variant="bodySm" color="muted">Created</AppText>
              <AppText variant="bodySm">{formatDate(job.createdAt)}</AppText>
            </div>
            <div className="flex justify-between">
              <AppText variant="bodySm" color="muted">Updated</AppText>
              <AppText variant="bodySm">{formatDate(job.updatedAt)}</AppText>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AppText variant="h4">Status</AppText>
          <div className="flex flex-wrap gap-2">
            {["NEW", "REVIEWING", "READY_TO_APPLY", "APPLIED", "FOLLOW_UP", "INTERVIEW", "OFFER", "REJECTED", "CLOSED"].map(
              (status) => (
                <AppButton
                  key={status}
                  variant={job.status === status ? "primary" : "outline"}
                  size="sm"
                  onClick={() => updateStatus({ id, status })}
                >
                  {status.replace(/_/g, " ")}
                </AppButton>
              ),
            )}
          </div>
        </div>
      </div>

      {job.description && (
        <div className="flex flex-col gap-3">
          <AppText variant="h4">Description</AppText>
          <div className="rounded-lg border bg-muted/20 p-4">
            <AppText variant="bodySm" className="whitespace-pre-wrap">
              {job.description}
            </AppText>
          </div>
        </div>
      )}
    </div>
  );
}
