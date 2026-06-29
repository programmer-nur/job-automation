"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useGetResumeQuery,
  useDeleteResumeMutation,
  useSetDefaultResumeMutation,
} from "@/store/api/slices/resumesApi";
import { AppButton, AppBadge, AppText, AppSpinner } from "@/components/shared";
import { ArrowLeft, Trash2, Star, ExternalLink } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGetResumeQuery(id);
  const [deleteResume] = useDeleteResumeMutation();
  const [setDefault] = useSetDefaultResumeMutation();

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
        <AppText color="destructive">Failed to load resume</AppText>
        <AppButton variant="outline" onClick={() => router.push("/resumes")}>
          Back to Resumes
        </AppButton>
      </div>
    );
  }

  const resume = data.data;

  const handleDelete = async () => {
    if (confirm("Delete this resume?")) {
      await deleteResume(id);
      router.push("/resumes");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <AppButton variant="ghost" size="sm" onClick={() => router.push("/resumes")}>
          <ArrowLeft className="size-4" />
        </AppButton>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AppText variant="h2">{resume.name}</AppText>
            {resume.isDefault && (
              <AppBadge variant="success" size="sm">
                <Star className="size-2.5 mr-1 fill-current" />
                Default
              </AppBadge>
            )}
          </div>
          {resume.targetRole && (
            <AppText variant="body" color="muted">{resume.targetRole}</AppText>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!resume.isDefault && (
            <AppButton variant="outline" size="sm" onClick={() => setDefault(id)}>
              <Star className="size-3.5 mr-1" />
              Set Default
            </AppButton>
          )}
          <AppButton variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="size-4 text-destructive" />
          </AppButton>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <AppText variant="h4">Details</AppText>
          <div className="space-y-3">
            <div className="flex justify-between">
              <AppText variant="bodySm" color="muted">Name</AppText>
              <AppText variant="bodySm">{resume.name}</AppText>
            </div>
            <div className="flex justify-between">
              <AppText variant="bodySm" color="muted">Target Role</AppText>
              <AppText variant="bodySm">{resume.targetRole ?? "Not specified"}</AppText>
            </div>
            {resume.atsScore != null && (
              <div className="flex justify-between">
                <AppText variant="bodySm" color="muted">ATS Score</AppText>
                <AppBadge
                  variant={resume.atsScore >= 80 ? "success" : resume.atsScore >= 60 ? "warning" : "secondary"}
                >
                  {resume.atsScore}
                </AppBadge>
              </div>
            )}
            <div className="flex justify-between">
              <AppText variant="bodySm" color="muted">Created</AppText>
              <AppText variant="bodySm">{formatDate(resume.createdAt)}</AppText>
            </div>
            <div className="flex justify-between">
              <AppText variant="bodySm" color="muted">Updated</AppText>
              <AppText variant="bodySm">{formatDate(resume.updatedAt)}</AppText>
            </div>
          </div>
        </div>

        {resume.storageUrl && (
          <div className="flex flex-col gap-4">
            <AppText variant="h4">File</AppText>
            <a
              href={resume.storageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary underline text-sm"
            >
              <ExternalLink className="size-4" />
              Open Resume File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
