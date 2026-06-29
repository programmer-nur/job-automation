"use client";

import { useRouter } from "next/navigation";
import {
  useGetCoverLettersQuery,
  useDeleteCoverLetterMutation,
} from "@/store/api/slices/coverLettersApi";
import {
  AppButton, AppText, AppCard, AppCardHeader,
  AppCardContent, AppCardFooter, AppSpinner,
} from "@/components/shared";
import { Eye, Trash2, Plus, Mail } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CoverLettersPage() {
  const router = useRouter();
  const { data, isLoading, error } = useGetCoverLettersQuery();
  const [deleteCoverLetter] = useDeleteCoverLetterMutation();

  const coverLetters = data?.data ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this cover letter?")) return;
    await deleteCoverLetter(id);
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
          <AppText variant="h2">Cover Letters</AppText>
          <AppText variant="bodySm" color="muted" className="mt-1">
            AI-generated cover letters for your applications
          </AppText>
        </div>
        <AppButton>
          <Plus className="size-4 mr-1.5" />
          Generate
        </AppButton>
      </div>

      {error && (
        <AppText color="destructive">Failed to load cover letters. Please try again.</AppText>
      )}

      {!isLoading && coverLetters.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Mail className="size-12 text-muted-foreground/40 mb-4" />
          <AppText variant="h4" color="muted">No cover letters yet</AppText>
          <AppText variant="bodySm" color="muted" className="mt-1">
            Generate your first cover letter for an application.
          </AppText>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coverLetters.map((cl) => (
          <AppCard key={cl.id} className="flex flex-col">
            <AppCardHeader>
              <AppText variant="h4" weight="semibold" className="truncate">
                {cl.jobId ? `Cover Letter` : "Cover Letter"}
              </AppText>
              <AppText variant="small" color="muted">{formatDate(cl.createdAt)}</AppText>
            </AppCardHeader>
            <AppCardContent className="flex-1">
              <AppText
                variant="bodySm"
                color="muted"
                className="line-clamp-4 whitespace-pre-wrap"
              >
                {cl.content ?? "No content"}
              </AppText>
            </AppCardContent>
            <AppCardFooter className="border-t pt-3">
              <div className="flex items-center gap-1 w-full">
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/cover-letters/${cl.id}`)}
                >
                  <Eye className="size-3.5 mr-1" />
                  View
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => handleDelete(cl.id)}
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
