"use client";

import {
  useGetDashboardSummaryQuery,
  useGetMonthlyAnalyticsQuery,
  useGetMatchScoresQuery,
  useGetApplicationSourcesQuery,
} from "@/store/api/slices/dashboardApi";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/AppCard";
import { AppText } from "@/components/shared/AppText";
import { AppSpinner } from "@/components/shared/AppSpinner";
import { AppBadge } from "@/components/shared/AppBadge";

function StatCard({ label, value, variant }: { label: string; value: number; variant?: "default" | "success" | "warning" | "destructive" | "info" }) {
  return (
    <AppCard className="flex flex-col gap-1">
      <AppText variant="caption">{label}</AppText>
      <AppText variant="h3" color={variant === "default" ? "default" : variant}>
        {value}
      </AppText>
    </AppCard>
  );
}

export default function DashboardPage() {
  const { data: summaryRes, isLoading: summaryLoading } = useGetDashboardSummaryQuery();
  const { data: monthlyRes, isLoading: monthlyLoading } = useGetMonthlyAnalyticsQuery();
  const { data: scoresRes, isLoading: scoresLoading } = useGetMatchScoresQuery();
  const { data: sourcesRes, isLoading: sourcesLoading } = useGetApplicationSourcesQuery();

  const summary = summaryRes?.data;
  const monthly = monthlyRes?.data ?? [];
  const scores = scoresRes?.data ?? [];
  const sources = sourcesRes?.data ?? [];

  if (summaryLoading || monthlyLoading || scoresLoading || sourcesLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <AppSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AppText variant="h2">Overview</AppText>
        <AppText variant="bodySm" color="muted" className="mt-1">
          Your job search at a glance
        </AppText>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Jobs" value={summary?.totalJobs ?? 0} variant="info" />
        <StatCard label="Applications" value={summary?.totalApplications ?? 0} variant="info" />
        <StatCard label="Active Apps" value={summary?.activeApplications ?? 0} variant="success" />
        <StatCard label="Interviews" value={summary?.interviews ?? 0} variant="warning" />
        <StatCard label="Offers" value={summary?.offers ?? 0} variant="success" />
        <StatCard label="Rejections" value={summary?.rejections ?? 0} variant="destructive" />
        <StatCard label="Pending Tasks" value={summary?.pendingTasks ?? 0} variant="warning" />
        <StatCard label="Unread" value={summary?.unreadNotifications ?? 0} variant="destructive" />
        <StatCard label="Active Resumes" value={summary?.activeResumes ?? 0} variant="default" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AppCard>
          <AppCardHeader>
            <AppText variant="h4">Monthly Activity</AppText>
          </AppCardHeader>
          <AppCardContent>
            {monthly.length === 0 ? (
              <AppText variant="bodySm" color="muted">No monthly data yet</AppText>
            ) : (
              <div className="space-y-2">
                {monthly.map((m) => (
                  <div key={m.month} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                    <AppText variant="bodySm" weight="medium">{m.month}</AppText>
                    <div className="flex gap-3">
                      <AppBadge variant="info">{m.applications} apps</AppBadge>
                      {m.interviews > 0 && <AppBadge variant="warning">{m.interviews} int</AppBadge>}
                      {m.offers > 0 && <AppBadge variant="success">{m.offers} off</AppBadge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppCardContent>
        </AppCard>

        <AppCard>
          <AppCardHeader>
            <AppText variant="h4">Match Scores</AppText>
          </AppCardHeader>
          <AppCardContent>
            {scores.length === 0 ? (
              <AppText variant="bodySm" color="muted">No match scores yet</AppText>
            ) : (
              <div className="space-y-2">
                {scores.map((s) => (
                  <div key={s.range} className="flex items-center gap-3">
                    <AppText variant="bodySm" className="w-16 shrink-0">{s.range}</AppText>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, (s.count / Math.max(...scores.map((x) => x.count))) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <AppText variant="small" color="muted" className="w-6 text-right">{s.count}</AppText>
                  </div>
                ))}
              </div>
            )}
          </AppCardContent>
        </AppCard>
      </div>

      <AppCard>
        <AppCardHeader>
          <AppText variant="h4">Application Sources</AppText>
        </AppCardHeader>
        <AppCardContent>
          {sources.length === 0 ? (
            <AppText variant="bodySm" color="muted">No source data yet</AppText>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => (
                <AppBadge key={s.source} variant="secondary" size="lg">
                  {s.source}: {s.count}
                </AppBadge>
              ))}
            </div>
          )}
        </AppCardContent>
      </AppCard>
    </div>
  );
}
