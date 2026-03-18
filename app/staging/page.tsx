"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/app-shell";

type StagingSessionItem = {
  id: string;
  verification_status?: string | null;
};

type StagingSession = {
  id: string;
  status?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  updated_at?: string | null;
  target_job_id?: string | null;
  target_asset_id?: string | null;
  target_job?: {
    id?: string;
    title?: string | null;
  } | null;
  target_asset?: {
    id?: string;
    name?: string | null;
  } | null;
  started_by?: {
    id?: string;
    email?: string | null;
  } | null;
  items?: StagingSessionItem[];
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getStatusClasses(status?: string | null) {
    const base =
      "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide";
  
    switch (status?.toLowerCase()) {
      case "ready":
        return `${base} border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300`;
      case "short":
      case "not_ready":
        return `${base} border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300`;
      case "in_progress":
        return `${base} border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300`;
      case "completed":
        return `${base} border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300`;
      case "dispatched":
        return `${base} border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-300`;
      default:
        return `${base} border-border bg-secondary/40 text-muted-foreground`;
    }
  }

function formatStatusLabel(status?: string | null) {
  if (!status) return "—";
  return status.replaceAll("_", " ");
}

function getIssueCount(items?: StagingSessionItem[]) {
  if (!items?.length) return 0;

  return items.filter((item) => {
    const status = item.verification_status?.toLowerCase();
    return status === "missing" || status === "issue";
  }).length;
}

function getSessionPriority(session: StagingSession) {
  const status = session.status?.toLowerCase();
  const issues = getIssueCount(session.items);

  if (issues > 0 || status === "short" || status === "not_ready") return 0;
  if (status === "in_progress") return 1;
  if (status === "ready") return 2;
  if (status === "completed") return 3;
  return 4;
}

export default function StagingPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<StagingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAttentionOnly, setShowAttentionOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSessions() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/staging-sessions", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load staging sessions (${response.status})`);
        }

        const data = await response.json();

        if (!active) return;

        setSessions(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        if (!active) return;

        setError(err instanceof Error ? err.message : "Failed to load staging sessions");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const totalSessions = sessions.length;
    const totalIssues = sessions.reduce(
      (sum, session) => sum + getIssueCount(session.items),
      0
    );

    const attentionCount = sessions.filter((session) => {
      const status = session.status?.toLowerCase();
      return (
        status === "short" ||
        status === "not_ready" ||
        status === "in_progress" ||
        getIssueCount(session.items) > 0
      );
    }).length;

    const readyCount = sessions.filter((session) => {
      const status = session.status?.toLowerCase();
      return status === "ready" || status === "completed";
    }).length;

    const inProgressCount = sessions.filter((session) => {
      const status = session.status?.toLowerCase();
      return status === "in_progress";
    }).length;

    return {
      totalSessions,
      totalIssues,
      attentionCount,
      readyCount,
      inProgressCount,
    };
  }, [sessions]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const priorityDiff = getSessionPriority(a) - getSessionPriority(b);
      if (priorityDiff !== 0) return priorityDiff;

      const issueDiff = getIssueCount(b.items) - getIssueCount(a.items);
      if (issueDiff !== 0) return issueDiff;

      const aDate = new Date(a.updated_at ?? a.completed_at ?? a.started_at ?? 0).getTime();
      const bDate = new Date(b.updated_at ?? b.completed_at ?? b.started_at ?? 0).getTime();

      return bDate - aDate;
    });
  }, [sessions]);

  const visibleSessions = useMemo(() => {
    if (!showAttentionOnly) return sortedSessions;

    return sortedSessions.filter((session) => {
      const status = session.status?.toLowerCase();
      return (
        status === "short" ||
        status === "not_ready" ||
        status === "in_progress" ||
        getIssueCount(session.items) > 0
      );
    });
  }, [showAttentionOnly, sortedSessions]);

  const searchedSessions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return visibleSessions;

    return visibleSessions.filter((session) => {
      const asset = session.target_asset?.name?.toLowerCase() ?? "";
      const job = session.target_job?.title?.toLowerCase() ?? "";
      const sessionId = session.id.toLowerCase();

      return (
        asset.includes(query) ||
        job.includes(query) ||
        sessionId.includes(query)
      );
    });
  }, [searchTerm, visibleSessions]);

  const hasActiveSearch = searchTerm.trim().length > 0;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <h2 className="text-3xl font-bold text-foreground">Staging</h2>
          <p className="mt-3 text-sm text-muted-foreground">
          Pre-deployment control board for asset readiness, missing items, and dispatch checks.
          </p>
        </div>

        {!loading && !error && sessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Attention
              </div>
              <div className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">
                {summary.attentionCount}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Total issues
              </div>
              <div className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">
                {summary.totalIssues}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Ready / completed
              </div>
              <div className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {summary.readyCount}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                In progress
              </div>
              <div className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">
                {summary.inProgressCount}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Total sessions
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {summary.totalSessions}
              </div>
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Staging sessions</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Prioritize blocked or incomplete sessions before dispatch.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                {searchedSessions.length} result{searchedSessions.length === 1 ? "" : "s"}
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search asset, job, or session ID"
                className="w-72 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />

              {hasActiveSearch ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-background/60"
                >
                  Clear
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setShowAttentionOnly((current) => !current)}
                className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-background/60"
              >
                {showAttentionOnly ? "Show all" : "Needs attention only"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-sm text-muted-foreground">Loading staging sessions...</div>
          ) : error ? (
            <div className="px-6 py-10 text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : searchedSessions.length === 0 ? (
            <div className="px-6 py-10 text-sm text-muted-foreground">No staging sessions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-secondary/30">
                  <tr className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Asset</th>
                    <th className="px-6 py-3 font-medium">Job</th>
                    <th className="px-6 py-3 font-medium">Issues</th>
                    <th className="px-6 py-3 font-medium">Items</th>
                    <th className="px-6 py-3 font-medium">Last updated</th>
                    <th className="px-6 py-3 font-medium">Session</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedSessions.map((session) => {
                    const issueCount = getIssueCount(session.items);

                    return (
                      <tr
                        key={session.id}
                        onClick={() => router.push(`/staging/${session.id}`)}
                        className="cursor-pointer border-b border-border transition hover:bg-background/60 last:border-b-0"
                      >
                        <td className="px-6 py-4 align-top">
                          <span className={getStatusClasses(session.status)}>
                            {formatStatusLabel(session.status)}
                          </span>
                        </td>

                        <td className="px-6 py-4 align-top text-foreground">
                          <div className="font-medium text-foreground">
                            {session.target_asset?.name ?? session.target_asset_id ?? "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4 align-top text-foreground">
                          <div className="font-medium text-foreground">
                            {session.target_job?.title ?? session.target_job_id ?? "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4 align-top">
                          <div
                            className={
                              issueCount > 0
                                ? "font-semibold text-rose-600 dark:text-rose-400"
                                : "font-semibold text-foreground"
                            }
                          >
                            {issueCount}
                          </div>
                        </td>

                        <td className="px-6 py-4 align-top text-foreground">
                          {session.items?.length ?? 0}
                        </td>

                        <td className="px-6 py-4 align-top text-foreground">
                          {formatDate(session.updated_at ?? session.completed_at ?? session.started_at)}
                        </td>

                        <td className="px-6 py-4 align-top">
                          <div className="text-xs text-muted-foreground">{session.id}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}