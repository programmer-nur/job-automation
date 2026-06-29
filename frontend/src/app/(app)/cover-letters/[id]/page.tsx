"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetCoverLetterQuery,
  useDeleteCoverLetterMutation,
  useUpdateCoverLetterMutation,
} from "@/store/api/slices/coverLettersApi";
import { AppButton, AppBadge, AppText, AppSpinner } from "@/components/shared";
import { ArrowLeft, Trash2, Edit3, Save, X, ExternalLink } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CoverLetterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGetCoverLetterQuery(id);
  const [deleteCoverLetter] = useDeleteCoverLetterMutation();
  const [updateCoverLetter] = useUpdateCoverLetterMutation();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

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
        <AppText color="destructive">Failed to load cover letter</AppText>
        <AppButton variant="outline" onClick={() => router.push("/cover-letters")}>
          Back to Cover Letters
        </AppButton>
      </div>
    );
  }

  const cl = data.data;

  const handleDelete = async () => {
    if (confirm("Delete this cover letter?")) {
      await deleteCoverLetter(id);
      router.push("/cover-letters");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCoverLetter({ id, data: { content: draft } });
    setEditing(false);
    setSaving(false);
  };

  const startEditing = () => {
    setDraft(cl.content ?? "");
    setEditing(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <AppButton variant="ghost" size="sm" onClick={() => router.push("/cover-letters")}>
          <ArrowLeft className="size-4" />
        </AppButton>
        <div className="flex-1">
          <AppText variant="h2">Cover Letter</AppText>
          <AppText variant="bodySm" color="muted">
            Created {formatDate(cl.createdAt)}
          </AppText>
        </div>
        <div className="flex items-center gap-2">
          {!editing && (
            <AppButton variant="outline" size="sm" onClick={startEditing}>
              <Edit3 className="size-3.5 mr-1" />
              Edit
            </AppButton>
          )}
          <AppButton variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="size-4 text-destructive" />
          </AppButton>
        </div>
      </div>

      {cl.jobId && (
        <div className="flex items-center gap-2">
          <AppText variant="bodySm" color="muted">For job:</AppText>
          <AppBadge variant="secondary">{cl.jobId}</AppBadge>
        </div>
      )}

      {cl.storageUrl && (
        <a
          href={cl.storageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary underline text-sm"
        >
          <ExternalLink className="size-4" />
          Open stored file
        </a>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <AppText variant="h4">Content</AppText>
        </div>
        {editing ? (
          <div className="flex flex-col gap-3">
            <textarea
              className="flex min-h-[400px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-xs"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your cover letter content..."
            />
            <div className="flex items-center gap-2">
              <AppButton size="sm" onClick={handleSave} loading={saving}>
                <Save className="size-3.5 mr-1" />
                Save
              </AppButton>
              <AppButton variant="outline" size="sm" onClick={() => setEditing(false)}>
                <X className="size-3.5 mr-1" />
                Cancel
              </AppButton>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/20 p-6">
            <AppText variant="body" className="whitespace-pre-wrap leading-relaxed">
              {cl.content || "No content"}
            </AppText>
          </div>
        )}
      </div>
    </div>
  );
}
