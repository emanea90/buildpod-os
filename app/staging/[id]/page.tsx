import Link from "next/link";
import { AppShell } from "../../../components/app-shell";
import { StagingSessionItemsPanel } from "../../../components/staging-session-items-panel";
import { getAllStagingSessions } from "../../../services/staging-sessions.service";

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
  switch (status) {
    case "completed":
    case "COMPLETED":
    case "ready":
    case "READY":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "in_progress":
    case "IN_PROGRESS":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "not_ready":
    case "NOT_READY":
    case "short":
    case "SHORT":
      return "border-rose-500/20 bg-rose-500/10 text-rose-300";
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
  const sessions = await getAllStagingSessions("");
  const session = sessions.find((entry) => entry.id === id) ?? null;

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

        <StagingSessionItemsPanel items={session.items ?? []} />
      </div>
    </AppShell>
  );
}