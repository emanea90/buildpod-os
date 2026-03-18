import Link from "next/link";
import { AppShell } from "../../../components/app-shell";
import { StagingSessionItemsPanel } from "../../../components/staging-session-items-panel";
import { StagingGovernancePanel } from "../../../components/staging-governance-panel";
import { getStagingSessionById } from "../../../services/staging-sessions.service";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value?: Date | string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getSessionStatusClasses(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "ready":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "short":
      return "border-rose-500/20 bg-rose-500/10 text-rose-300";
    case "in_progress":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "dispatched":
      return "border-sky-500/20 bg-sky-500/10 text-sky-300";
    case "draft":
      return "border-border bg-secondary/40 text-muted-foreground";
    default:
      return "border-border bg-secondary/40 text-muted-foreground";
  }
}

function getItemSummary(
  items:
    | Array<{
        verification_status?: string | null;
      }>
    | undefined
) {
  const summary = {
    total: items?.length ?? 0,
    verified: 0,
    missingOrIssue: 0,
    pending: 0,
  };

  if (!items?.length) return summary;

  for (const item of items) {
    const status = item.verification_status?.toLowerCase();

    if (status === "verified") {
      summary.verified += 1;
    } else if (status === "missing" || status === "issue") {
      summary.missingOrIssue += 1;
    } else {
      summary.pending += 1;
    }
  }

  return summary;
}

export default async function StagingSessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getStagingSessionById(id);

  if (!session) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <h2 className="text-3xl font-bold text-foreground">Staging session</h2>
            <p className="mt-3 text-sm text-muted-foreground">Session not found.</p>
            <div className="mt-6">
              <Link
                href="/staging"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Back to staging
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const itemSummary = getItemSummary(session.items ?? []);
  const dispatchLocked = (session.status ?? "").toLowerCase() !== "ready";
  const blockerCount = itemSummary.missingOrIssue;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-foreground">Staging session</h2>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSessionStatusClasses(
                    session.status
                  )}`}
                >
                  {session.status ?? "—"}
                </span>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{session.id}</p>
            </div>

            <Link
              href="/staging"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Back to staging
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Status</div>
              <div className="mt-2 text-sm font-medium text-foreground">{session.status ?? "—"}</div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Job</div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {session.target_job?.title ?? session.target_job_id ?? "—"}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Asset</div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {session.target_asset?.name ?? session.target_asset_id ?? "—"}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Started by</div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {session.started_by?.email ?? "—"}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Started</div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {formatDate(session.started_at)}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Completed</div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {formatDate(session.completed_at)}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Items</div>
              <div className="mt-2 text-sm font-medium text-foreground">
                {session.items?.length ?? 0}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Dispatch lock</div>
              <div
                className={`mt-2 text-sm font-medium ${
                  dispatchLocked
                    ? "text-rose-600 dark:text-rose-300"
                    : "text-emerald-600 dark:text-emerald-300"
                }`}
              >
                {dispatchLocked ? "Locked" : "Release available"}
              </div>
            </div>
          </div>

          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
              dispatchLocked
                ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {dispatchLocked
              ? blockerCount > 0
                ? `Dispatch locked. ${blockerCount} blocking item${blockerCount === 1 ? "" : "s"} must be resolved before release.`
                : "Dispatch locked. Session is not yet release-ready."
              : "Dispatch unlocked. Session is ready for signoff and release."}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Total items
            </div>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {itemSummary.total}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Verified
            </div>
            <div className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {itemSummary.verified}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Missing / issue
            </div>
            <div className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">
              {itemSummary.missingOrIssue}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Pending
            </div>
            <div className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">
              {itemSummary.pending}
            </div>
          </div>
        </div>

        <StagingGovernancePanel
          sessionId={session.id}
          status={session.status}
          releasedAt={session.released_at}
          releasedByUserId={session.released_by_user_id}
          releaseNote={session.release_note}
          items={session.items ?? []}
          events={session.events ?? []}
        />

        <StagingSessionItemsPanel
          sessionId={session.id}
          status={session.status}
          items={session.items ?? []}
          events={session.events ?? []}
        />
      </div>
    </AppShell>
  );
}