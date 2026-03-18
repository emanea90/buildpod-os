"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type StagingSessionItem = {
  id: string;
  item_type?: string | null;
  referenced_item_id?: string | null;
  expected_quantity?: number | null;
  actual_quantity?: number | null;
  verification_status?: string | null;
  note?: string | null;
  shortage_reason?: string | null;
};

type StagingSessionEvent = {
  id: string;
  event_type: string;
  result?: string | null;
  scanned_value?: string | null;
  message?: string | null;
  created_at: string | Date;
  staging_item?: {
    id: string;
    referenced_item_id?: string | null;
    item_type?: string | null;
  } | null;
};

type Props = {
  sessionId: string;
  status?: string | null;
  items: StagingSessionItem[];
  events: StagingSessionEvent[];
};

type BannerState = {
  type: "success" | "info" | "error";
  message: string;
} | null;

const SHORTAGE_REASONS = [
  "not in warehouse",
  "damaged",
  "wrong asset",
  "awaiting supervisor decision",
  "unavailable at dispatch time",
];

function getVerificationClasses(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "verified":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
    case "missing":
    case "issue":
      return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300";
    case "pending":
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300";
    default:
      return "border-border bg-secondary/40 text-muted-foreground";
  }
}

function getHistoryClasses(result?: string | null) {
  switch ((result ?? "").toLowerCase()) {
    case "verified":
      return "text-emerald-600 dark:text-emerald-300";
    case "already_verified":
      return "text-blue-600 dark:text-blue-300";
    case "unmatched":
    case "invalid":
    case "manual_status_change":
      return "text-rose-600 dark:text-rose-300";
    case "note_edited":
    case "shortage_reason_updated":
      return "text-amber-600 dark:text-amber-300";
    default:
      return "text-muted-foreground";
  }
}

function formatDateTime(value?: string | Date) {
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

export function StagingSessionItemsPanel({
  sessionId,
  status,
  items,
  events,
}: Props) {
  const router = useRouter();
  const scanInputRef = useRef<HTMLInputElement | null>(null);

  const [scanValue, setScanValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [savingNoteItemId, setSavingNoteItemId] = useState<string | null>(null);
  const [savingShortageReasonItemId, setSavingShortageReasonItemId] =
    useState<string | null>(null);
  const [banner, setBanner] = useState<BannerState>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [editingShortageReasons, setEditingShortageReasons] = useState<
    Record<string, string>
  >({});

  const isDispatched = (status ?? "").toLowerCase() === "dispatched";

  useEffect(() => {
    scanInputRef.current?.focus();
  }, []);

  const itemTypes = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.item_type).filter(Boolean))
    ) as string[];
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const itemStatus = item.verification_status?.toLowerCase() ?? "";

      if (statusFilter !== "all" && itemStatus !== statusFilter) {
        return false;
      }

      if (typeFilter !== "all" && item.item_type !== typeFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        item.id,
        item.referenced_item_id ?? "",
        item.item_type ?? "",
        item.note ?? "",
        item.shortage_reason ?? "",
        item.verification_status ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [items, searchTerm, statusFilter, typeFilter]);

  const bulkEligibleItemIds = useMemo(() => {
    return filteredItems
      .filter((item) => {
        const itemStatus = item.verification_status?.toLowerCase();
        return (
          itemStatus !== "verified" &&
          itemStatus !== "missing" &&
          itemStatus !== "issue"
        );
      })
      .map((item) => item.id);
  }, [filteredItems]);

  function refocusScanner() {
    requestAnimationFrame(() => {
      scanInputRef.current?.focus();
      scanInputRef.current?.select();
    });
  }

  async function refreshAfterMutation() {
    router.refresh();
    refocusScanner();
  }

  async function handleScanSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDispatched) {
      setBanner({
        type: "error",
        message:
          "This session has already been released and cannot be modified.",
      });
      return;
    }

    const value = scanValue.trim();

    if (!value) {
      refocusScanner();
      return;
    }

    try {
      const response = await fetch(`/api/staging-sessions/${sessionId}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scanned_value: value,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json?.ok) {
        throw new Error(json?.message || "Failed to process scan");
      }

      if (json.result === "verified") {
        setBanner({ type: "success", message: json.message });
      } else if (json.result === "already_verified") {
        setBanner({ type: "info", message: json.message });
      } else if (json.result === "unmatched" || json.result === "invalid") {
        setBanner({ type: "error", message: json.message });
      } else {
        setBanner(null);
      }

      setScanValue("");
      await refreshAfterMutation();
    } catch (error) {
      setBanner({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to process scan",
      });
      refocusScanner();
    }
  }

  async function updateManualStatus(
    item: StagingSessionItem,
    nextStatus: "verified" | "missing" | "pending"
  ) {
    try {
      setSavingItemId(item.id);
      setBanner(null);

      const payload =
        nextStatus === "verified"
          ? {
              id: item.id,
              verification_status: "verified",
              actual_quantity: item.expected_quantity ?? 1,
              shortage_reason: null,
              action_source: "manual_status_change",
            }
          : nextStatus === "missing"
          ? {
              id: item.id,
              verification_status: "missing",
              actual_quantity: 0,
              action_source: "manual_status_change",
            }
          : {
              id: item.id,
              verification_status: "pending",
              actual_quantity: null,
              action_source: "manual_status_change",
            };

      const response = await fetch("/api/staging-items", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || "Failed to update staging item");
      }

      setBanner({
        type: "success",
        message: `Item ${item.id} updated.`,
      });

      await refreshAfterMutation();
    } catch (error) {
      setBanner({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update staging item",
      });
      refocusScanner();
    } finally {
      setSavingItemId(null);
    }
  }

  async function saveNote(item: StagingSessionItem) {
    try {
      setSavingNoteItemId(item.id);
      setBanner(null);

      const response = await fetch("/api/staging-items", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
          note: editingNotes[item.id] ?? "",
          action_source: "note_edited",
        }),
      });

      const json = await response.json();

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || "Failed to save note");
      }

      setBanner({
        type: "success",
        message: `Note saved for ${item.id}.`,
      });

      await refreshAfterMutation();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save note",
      });
      refocusScanner();
    } finally {
      setSavingNoteItemId(null);
    }
  }

  async function saveShortageReason(item: StagingSessionItem) {
    try {
      setSavingShortageReasonItemId(item.id);
      setBanner(null);

      const response = await fetch("/api/staging-items", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
          shortage_reason: editingShortageReasons[item.id] ?? "",
        }),
      });

      const json = await response.json();

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || "Failed to save shortage reason");
      }

      setBanner({
        type: "success",
        message: `Shortage reason saved for ${item.id}.`,
      });

      await refreshAfterMutation();
    } catch (error) {
      setBanner({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to save shortage reason",
      });
      refocusScanner();
    } finally {
      setSavingShortageReasonItemId(null);
    }
  }

  async function handleBulkVerify() {
    if (isDispatched) {
      setBanner({
        type: "error",
        message:
          "This session has already been released and cannot be modified.",
      });
      return;
    }

    if (bulkEligibleItemIds.length === 0) {
      return;
    }

    try {
      setBanner(null);

      const response = await fetch(
        `/api/staging-sessions/${sessionId}/bulk-verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item_ids: bulkEligibleItemIds,
          }),
        }
      );

      const json = await response.json();

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || "Failed to bulk verify items");
      }

      setBanner({
        type: "success",
        message: `Bulk verified ${json.data.updated_count} item(s).`,
      });

      await refreshAfterMutation();
    } catch (error) {
      setBanner({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to bulk verify items",
      });
      refocusScanner();
    }
  }

  const blockingItems = items.filter((item) => {
    const itemStatus = item.verification_status?.toLowerCase();
    return itemStatus === "missing" || itemStatus === "issue";
  });

  const missingReasons = blockingItems.filter(
    (item) => !item.shortage_reason?.trim()
  ).length;

  const guidance: string[] = [];

  if ((status ?? "").toLowerCase() === "dispatched") {
    guidance.push("This session has already been released.");
  } else if (blockingItems.length > 0) {
    guidance.push(
      `${blockingItems.length} blocking item${
        blockingItems.length === 1 ? "" : "s"
      } detected.`
    );
  } else if ((status ?? "").toLowerCase() === "ready") {
    guidance.push("No blockers detected. Release is permitted.");
  } else {
    guidance.push("Session is not yet ready for release.");
  }

  if (missingReasons > 0) {
    guidance.push(
      `${missingReasons} blocking item${
        missingReasons === 1 ? "" : "s"
      } still missing shortage reasons.`
    );
  }

  guidance.push(
    "Use this panel for guidance only. Governance controls above remain authoritative."
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="border-b border-border px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Session items
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Problem rows stay in place while you work. Search and filter
                  without leaving the session.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search item, reference, note, or status"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground sm:w-72"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="missing">Missing</option>
                  <option value="issue">Issue</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                >
                  <option value="all">All types</option>
                  {itemTypes.map((itemType) => (
                    <option key={itemType} value={itemType}>
                      {itemType}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!filteredItems.length ? (
            <div className="px-6 py-10 text-sm text-muted-foreground">
              No items match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-secondary/30">
                  <tr className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Item</th>
                    <th className="px-6 py-4 font-medium">Reference</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Expected</th>
                    <th className="px-6 py-4 font-medium">Actual</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                    <th className="px-6 py-4 font-medium">Shortage reason</th>
                    <th className="px-6 py-4 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const saving = savingItemId === item.id;
                    const savingNote = savingNoteItemId === item.id;
                    const savingShortageReason =
                      savingShortageReasonItemId === item.id;
                    const isBlocking =
                      item.verification_status?.toLowerCase() === "missing" ||
                      item.verification_status?.toLowerCase() === "issue";

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-6 py-4 align-top text-foreground">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 align-top text-foreground">
                          {item.referenced_item_id ?? "—"}
                        </td>
                        <td className="px-6 py-4 align-top text-foreground">
                          {item.item_type ?? "—"}
                        </td>
                        <td className="px-6 py-4 align-top text-foreground">
                          {item.expected_quantity ?? "—"}
                        </td>
                        <td className="px-6 py-4 align-top text-foreground">
                          {item.actual_quantity ?? "—"}
                        </td>
                        <td className="px-6 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getVerificationClasses(
                              item.verification_status
                            )}`}
                          >
                            {item.verification_status ?? "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => updateManualStatus(item, "verified")}
                              disabled={saving || isDispatched}
                              className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 disabled:opacity-50"
                            >
                              {saving ? "Saving..." : "Verify"}
                            </button>

                            <button
                              type="button"
                              onClick={() => updateManualStatus(item, "missing")}
                              disabled={saving || isDispatched}
                              className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 disabled:opacity-50"
                            >
                              {saving ? "Saving..." : "Missing"}
                            </button>

                            <button
                              type="button"
                              onClick={() => updateManualStatus(item, "pending")}
                              disabled={saving || isDispatched}
                              className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 disabled:opacity-50"
                            >
                              {saving ? "Saving..." : "Pending"}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          {isBlocking ? (
                            <div className="space-y-2">
                              <select
                                value={
                                  editingShortageReasons[item.id] ??
                                  item.shortage_reason ??
                                  ""
                                }
                                onChange={(e) =>
                                  setEditingShortageReasons((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="w-full min-w-[220px] rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                disabled={isDispatched}
                              >
                                <option value="">Select reason</option>
                                {SHORTAGE_REASONS.map((reason) => (
                                  <option key={reason} value={reason}>
                                    {reason}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => saveShortageReason(item)}
                                disabled={savingShortageReason || isDispatched}
                                className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-background/60 disabled:opacity-50"
                              >
                                {savingShortageReason
                                  ? "Saving..."
                                  : "Save reason"}
                              </button>
                              {!item.shortage_reason?.trim() ? (
                                <div className="text-xs text-rose-600 dark:text-rose-300">
                                  Blocking items should capture a shortage
                                  reason.
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {item.shortage_reason ?? "—"}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="space-y-2">
                            <textarea
                              value={editingNotes[item.id] ?? item.note ?? ""}
                              onChange={(e) =>
                                setEditingNotes((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              rows={2}
                              className="w-full min-w-[220px] rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                              placeholder="Add note"
                              disabled={isDispatched}
                            />
                            <button
                              type="button"
                              onClick={() => saveNote(item)}
                              disabled={savingNote || isDispatched}
                              className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-background/60 disabled:opacity-50"
                            >
                              {savingNote ? "Saving..." : "Save note"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Scanner workflow
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Scan items to verify them. If scanner hardware fails, use manual
                fallback from the item rows above.
              </p>
            </div>

            <div className="grid min-w-[260px] gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/40 p-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Session status
                </div>
                <div className="mt-2 text-sm font-medium text-foreground">
                  {status ?? "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/40 p-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Bulk verify eligible
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {bulkEligibleItemIds.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleBulkVerify}
                    disabled={bulkEligibleItemIds.length === 0 || isDispatched}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-background/60 disabled:opacity-50"
                  >
                    Bulk verify
                  </button>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleScanSubmit}
            className="mt-4 flex flex-col gap-2 sm:flex-row"
          >
            <input
              ref={scanInputRef}
              type="text"
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              placeholder="Scan barcode / QR value"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              disabled={isDispatched}
            />
            <button
              type="submit"
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background/60 disabled:opacity-50"
              disabled={isDispatched}
            >
              Submit scan
            </button>
          </form>

          <div className="mt-2 rounded-2xl border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
            Scanner not responding or label damaged? Use Verify / Missing /
            Pending above.
          </div>

          {banner ? (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                banner.type === "success"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : banner.type === "info"
                  ? "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                  : "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
              }`}
            >
              {banner.message}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <h3 className="text-base font-semibold text-foreground">Staging AI</h3>

          <div className="mt-3 space-y-3">
            {guidance.map((line, index) => (
              <div
                key={`${line}-${index}`}
                className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm text-foreground"
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Recent activity
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Append-only session activity and scan history.
            </p>
          </div>

          <div className="max-h-[370px] overflow-y-auto px-5 py-4">
            {!events.length ? (
              <div className="text-sm text-muted-foreground">
                No scan or staging activity recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-border bg-background/40 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div
                          className={`text-sm font-medium ${getHistoryClasses(
                            event.result
                          )}`}
                        >
                          {event.message ?? event.event_type}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.staging_item?.referenced_item_id ??
                            event.staging_item?.id ??
                            event.scanned_value ??
                            "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.result ?? event.event_type}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(event.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}