"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetApplicationQuery,
  useDeleteApplicationMutation,
  useUpdateApplicationStatusMutation,
  useScheduleFollowUpMutation,
  useAddApplicationNotesMutation,
} from "@/store/api/slices/applicationsApi";
import { AppButton, AppBadge, AppText, AppSpinner, AppInput } from "@/components/shared";
import { STATUS_VARIANT } from "../constants";
import { ArrowLeft, Trash2, Calendar, Edit3, Save, X } from "lucide-react";
import type { JobStatus } from "@/store/types/api";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_LIST: JobStatus[] = [
  "NEW", "REVIEWING", "READY_TO_APPLY", "APPLIED",
  "FOLLOW_UP", "INTERVIEW", "OFFER", "REJECTED", "CLOSED",
];

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGetApplicationQuery(id);
  const [deleteApplication] = useDeleteApplicationMutation();
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [scheduleFollowUp] = useScheduleFollowUpMutation();
  const [addNotes] = useAddApplicationNotesMutation();

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [followUpDraft, setFollowUpDraft] = useState("");
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
        <AppText color="destructive">Failed to load application</AppText>
        <AppButton variant="outline" onClick={() => router.push("/applications")}>
          Back to Applications
        </AppButton>
      </div>
    );
  }

  const app = data.data;

  const handleDelete = async () => {
    if (confirm("Delete this application?")) {
      await deleteApplication(id);
      router.push("/applications");
    }
  };

  const handleStatusChange = (status: JobStatus) => {
    updateStatus({ id, status });
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await addNotes({ id, notes: notesDraft });
    setEditingNotes(false);
    setSaving(false);
  };

  const handleScheduleFollowUp = async () => {
    if (!followUpDraft) return;
    setSaving(true);
    await scheduleFollowUp({ id, followUpDate: new Date(followUpDraft).toISOString() });
    setFollowUpDraft("");
    setSaving(false);
  };

  const startEditing = () => {
    setNotesDraft(app.notes ?? "");
    setEditingNotes(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <AppButton variant="ghost" size="sm" onClick={() => router.push("/applications")}>
          <ArrowLeft className="size-4" />
        </AppButton>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AppText variant="h2">{app.job.title}</AppText>
            {app.job.location && (
              <AppText variant="bodySm" color="muted">· {app.job.location}</AppText>
            )}
          </div>
          <AppText variant="body" color="muted">
            {app.job.company}
          </AppText>
        </div>
        <AppButton variant="ghost" size="sm" onClick={handleDelete} aria-label="Delete">
          <Trash2 className="size-4 text-destructive" />
        </AppButton>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_LIST.map((status) => (
          <AppButton
            key={status}
            variant={app.status === status ? "primary" : "outline"}
            size="sm"
            onClick={() => handleStatusChange(status)}
          >
            {status.replace(/_/g, " ")}
          </AppButton>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <AppText variant="h4">Details</AppText>
          <div className="space-y-3">
            <div className="flex justify-between">
              <AppText variant="bodySm" color="muted">Status</AppText>
              <AppBadge variant={STATUS_VARIANT[app.status]}>
                {app.status.replace(/_/g, " ")}
              </AppBadge>
            </div>
            <div className="flex justify-between">
              <AppText variant="bodySm" color="muted">Applied</AppText>
              <AppText variant="bodySm">{formatDate(app.appliedAt)}</AppText>
            </div>
            <div className="flex justify-between">
              <AppText variant="bodySm" color="muted">Created</AppText>
              <AppText variant="bodySm">{formatDate(app.createdAt)}</AppText>
            </div>
            <div className="flex justify-between">
              <AppText variant="bodySm" color="muted">Updated</AppText>
              <AppText variant="bodySm">{formatDate(app.updatedAt)}</AppText>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <AppText variant="h4">Follow-up</AppText>
            <Calendar className="size-4 text-muted-foreground" />
          </div>
          <AppText variant="bodySm" color="muted">
            {app.followUpDate ? (
              <>Scheduled: {formatDate(app.followUpDate)}</>
            ) : (
              "No follow-up scheduled"
            )}
          </AppText>
          <div className="flex items-center gap-2">
            <AppInput
              type="datetime-local"
              value={followUpDraft}
              onChange={(e) => setFollowUpDraft(e.target.value)}
              className="flex-1"
              placeholder="Select date..."
            />
            <AppButton
              size="sm"
              onClick={handleScheduleFollowUp}
              disabled={!followUpDraft || saving}
            >
              Set
            </AppButton>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <AppText variant="h4">Notes</AppText>
          {!editingNotes && (
            <AppButton variant="ghost" size="sm" onClick={startEditing}>
              <Edit3 className="size-3.5 mr-1" />
              Edit
            </AppButton>
          )}
        </div>
        {editingNotes ? (
          <div className="flex flex-col gap-3">
            <textarea
              className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs"
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Add notes about this application..."
            />
            <div className="flex items-center gap-2">
              <AppButton size="sm" onClick={handleSaveNotes} loading={saving}>
                <Save className="size-3.5 mr-1" />
                Save
              </AppButton>
              <AppButton variant="outline" size="sm" onClick={() => setEditingNotes(false)}>
                <X className="size-3.5 mr-1" />
                Cancel
              </AppButton>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/20 p-4">
            <AppText variant="bodySm" className="whitespace-pre-wrap">
              {app.notes || "No notes added yet."}
            </AppText>
          </div>
        )}
      </div>
    </div>
  );
}
