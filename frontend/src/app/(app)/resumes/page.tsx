"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetResumesQuery,
  useDeleteResumeMutation,
  useSetDefaultResumeMutation,
} from "@/store/api/slices/resumesApi";
import {
  AppButton, AppBadge, AppText, AppCard,
  AppCardHeader, AppCardContent, AppCardFooter, AppSpinner,
} from "@/components/shared";
import { Eye, Trash2, Star, Plus, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ResumesPage() {
  const router = useRouter();
  const { data, isLoading, error } = useGetResumesQuery();
  const [deleteResume] = useDeleteResumeMutation();
  const [setDefault] = useSetDefaultResumeMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resumes = data?.data ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    setDeletingId(id);
    await deleteResume(id);
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <AppSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <AppText variant="h2">Resumes</AppText>
          <AppText variant="bodySm" color="muted" className="mt-1">
            Manage your resume versions
          </AppText>
        </div>
        <AppButton>
          <Plus className="size-4 mr-1.5" />
          Add Resume
        </AppButton>
      </div>

      {error && (
        <AppText color="destructive">Failed to load resumes. Please try again.</AppText>
      )}

      {!isLoading && resumes.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="size-12 text-muted-foreground/40 mb-4" />
          <AppText variant="h4" color="muted">No resumes yet</AppText>
          <AppText variant="bodySm" color="muted" className="mt-1">
            Upload your first resume to get started.
          </AppText>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <AppCard key={resume.id} className="flex flex-col">
            <AppCardHeader className="flex-row items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <AppText variant="h4" weight="semibold">{resume.name}</AppText>
                {resume.targetRole && (
                  <AppText variant="small" color="muted">{resume.targetRole}</AppText>
                )}
              </div>
              {resume.isDefault && (
                <AppBadge variant="success" size="sm">
                  <Star className="size-2.5 mr-1 fill-current" />
                  Default
                </AppBadge>
              )}
            </AppCardHeader>
            <AppCardContent className="flex-1">
              <div className="space-y-2">
                {resume.atsScore != null && (
                  <div className="flex justify-between">
                    <AppText variant="bodySm" color="muted">ATS Score</AppText>
                    <AppBadge
                      variant={resume.atsScore >= 80 ? "success" : resume.atsScore >= 60 ? "warning" : "secondary"}
                      size="sm"
                    >
                      {resume.atsScore}
                    </AppBadge>
                  </div>
                )}
                <div className="flex justify-between">
                  <AppText variant="bodySm" color="muted">Created</AppText>
                  <AppText variant="bodySm">{formatDate(resume.createdAt)}</AppText>
                </div>
              </div>
            </AppCardContent>
            <AppCardFooter className="border-t pt-3">
              <div className="flex items-center gap-1 w-full">
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/resumes/${resume.id}`)}
                >
                  <Eye className="size-3.5 mr-1" />
                  View
                </AppButton>
                {!resume.isDefault && (
                  <AppButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setDefault(resume.id)}
                  >
                    <Star className="size-3.5 mr-1" />
                    Set Default
                  </AppButton>
                )}
                <AppButton
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => handleDelete(resume.id)}
                  disabled={deletingId === resume.id}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </AppButton>
              </div>
            </AppCardFooter>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
