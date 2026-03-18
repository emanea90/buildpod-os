"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type StagingSessionItem = {
  id: string;
  item_type?: string | null;
  expected_quantity?: number | null;
  actual_quantity?: number | null;
  verification_status?: string | null;
  note?: string | null;
};

type Props = {
  items: StagingSessionItem[];
};

function getVerificationClasses(status?: string | null) {
  switch (status) {
    case "verified":
    case "VERIFIED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
    case "missing":
    case "MISSING":
      return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300";
    case "pending":
    case "PENDING":
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300";
    case "issue":
    case "ISSUE":
      return "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-300";
    default:
      return "border-border bg-secondary/40 text-muted-foreground";
  }
}

function getStatusPriority(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "missing":
    case "issue":
      return 0;
    case "pending":
      return 1;
    case "verified":
      return 2;
    default:
      return 3;
  }
}

export function StagingSessionItemsPanel({ items }: Props) {
  const router = useRouter();
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const priorityDiff =
        getStatusPriority(a.verification_status) -
        getStatusPriority(b.verification_status);

      if (priorityDiff !== 0) return priorityDiff;

      return a.id.localeCompare(b.id);
    });
  }, [items]);

  async function updateItem(
    item: StagingSessionItem,
    nextStatus: "verified" | "missing" | "pending"
  ) {
    try {
      setSavingItemId(item.id);
      setError(null);

      const payload =
        nextStatus === "verified"
          ? {
              id: item.id,
              verification_status: "verified",
              actual_quantity: item.expected_quantity ?? 1,
            }
          : nextStatus === "missing"
          ? {
              id: item.id,
              verification_status: "missing",
              actual_quantity: 0,
            }
          : {
              id: item.id,
              verification_status: "pending",
              actual_quantity: null,
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

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update staging item");
    } finally {
      setSavingItemId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Session items</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Verify, flag missing, or reset items before dispatch.
        </p>
      </div>

      {error ? (
        <div className="border-b border-border px-6 py-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {!sortedItems.length ? (
        <div className="px-6 py-10 text-sm text-muted-foreground">No items in this session.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Expected</th>
                <th className="px-6 py-4 font-medium">Actual</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
                <th className="px-6 py-4 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => {
                const saving = savingItemId === item.id;

                return (
                  <tr key={item.id} className="border-b border-border last:border-b-0">
                    <td className="px-6 py-4 align-top text-foreground">{item.id}</td>
                    <td className="px-6 py-4 align-top text-foreground">{item.item_type ?? "—"}</td>
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
                          onClick={() => updateItem(item, "verified")}
                          disabled={saving}
                          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Verified"}
                        </button>

                        <button
                          type="button"
                          onClick={() => updateItem(item, "missing")}
                          disabled={saving}
                          className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Missing"}
                        </button>

                        <button
                          type="button"
                          onClick={() => updateItem(item, "pending")}
                          disabled={saving}
                          className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Pending"}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-foreground">{item.note ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}