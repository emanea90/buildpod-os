"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SessionItem = {
  id: string;
  verification_status?: string | null;
  shortage_reason?: string | null;
};

type SessionEvent = {
  id: string;
  event_type: string;
  result?: string | null;
  message?: string | null;
  created_at: string | Date;
};

type Props = {
  sessionId: string;
  status?: string | null;
  releasedAt?: string | Date | null;
  releasedByUserId?: string | null;
  releaseNote?: string | null;
  items: SessionItem[];
  events: SessionEvent[];
};

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function StagingGovernancePanel({
  sessionId,
  status,
  releasedAt,
  releasedByUserId,
  releaseNote,
  items,
  events,
}: Props) {
  const router = useRouter();
  const [releaseDraftNote, setReleaseDraftNote] = useState(releaseNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedStatus = (status ?? "").toLowerCase();
  const isReady = normalizedStatus === "ready";
  const isDispatched = normalizedStatus === "dispatched";

  const governance = useMemo(() => {
    const blockingItems = items.filter((item) => {
      const itemStatus = item.verification_status?.toLowerCase();
      return itemStatus === "missing" || itemStatus === "issue";
    });

    const missingReasonCount = blockingItems.filter(
      (item) => !item.shortage_reason?.trim()
    ).length;

    return {
      blockingCount: blockingItems.length,
      missingReasonCount,
      dispatchLocked: !isReady,
      canRelease: isReady,
    };
  }, [items, isReady]);

  const governanceEvents = useMemo(() => {
    return events
      .filter(
        (event) =>
          event.result === "dispatched" ||
          (event.event_type === "staging.governance_action" &&
            event.result !== "shortage_reason_updated")
      )
      .slice(0, 5);
  }, [events]);

  async function handleRelease() {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/staging-sessions/${sessionId}/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          release_note: releaseDraftNote,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || "Failed to release session");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to release session");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Governance summary
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Release control is driven by real item state, not manual override.
            </p>
          </div>

          <div
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
              isDispatched
                ? "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-300"
                : governance.dispatchLocked
                ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
            }`}
          >
            {isDispatched
              ? "Released"
              : governance.dispatchLocked
              ? "Dispatch locked"
              : "Release available"}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Release state
            </div>
            <div className="mt-2 text-sm font-medium text-foreground">
              {(status ?? "—").replaceAll("_", " ")}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Blocking items
            </div>
            <div className="mt-2 text-sm font-medium text-foreground">
              {governance.blockingCount}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Missing reasons
            </div>
            <div
              className={`mt-2 text-sm font-medium ${
                governance.missingReasonCount > 0
                  ? "text-rose-600 dark:text-rose-300"
                  : "text-foreground"
              }`}
            >
              {governance.missingReasonCount}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Released at
            </div>
            <div className="mt-2 text-sm font-medium text-foreground">
              {formatDateTime(releasedAt)}
            </div>
          </div>
        </div>

        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            isDispatched
              ? "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
              : governance.dispatchLocked
              ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {isDispatched
            ? "This session has already been released."
            : governance.dispatchLocked
            ? "Dispatch is locked. Resolve blockers and capture shortage reasons before release."
            : "Session is ready. Authorized release may proceed."}
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
          <textarea
            value={releaseDraftNote}
            onChange={(e) => setReleaseDraftNote(e.target.value)}
            rows={3}
            placeholder="Optional release note"
            className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            disabled={!governance.canRelease || isDispatched}
          />

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleRelease}
              disabled={!governance.canRelease || saving || isDispatched}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
                governance.canRelease && !isDispatched
                  ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                  : "border border-border bg-background text-foreground hover:bg-background/60"
              }`}
            >
              {saving
                ? "Releasing..."
                : isDispatched
                ? "Released"
                : "Release / sign off"}
            </button>

            <div className="rounded-2xl border border-border bg-background/40 p-3 text-xs text-muted-foreground">
              <div>Released by: {releasedByUserId ?? "—"}</div>
              <div className="mt-1">Note: {releaseNote ?? "—"}</div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">
            Release & approvals
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Authoritative release and approval events only.
          </p>
        </div>

        <div className="px-5 py-4">
          {!governanceEvents.length ? (
            <div className="text-sm text-muted-foreground">
              No release or approval events recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {governanceEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-border bg-background/40 px-4 py-3"
                >
                  <div className="text-sm font-medium text-foreground">
                    {event.message ?? event.result ?? event.event_type}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(event.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}