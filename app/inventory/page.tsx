"use client";

import { AppShell } from "../../components/app-shell";
import { Search, TriangleAlert, Plus, Minus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type InventoryItem = {
  id: string;
  sku: string | null;
  part_number: string | null;
  name: string;
  inventory_type: string;
  reorder_threshold: number | null;
  inventory_balances: {
    id: string;
    location_id: string;
    quantity_available: number;
    quantity_on_hand: number;
    location: {
      name: string;
      code: string | null;
    };
  }[];
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadInventory() {
    setLoading(true);
    const res = await fetch("/api/inventory");
    const json = await res.json();
    setItems(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return items;

    return items.filter((item) => {
      const balance = item.inventory_balances[0];
      const locationName = balance?.location?.name?.toLowerCase() ?? "";
      const locationCode = balance?.location?.code?.toLowerCase() ?? "";

      return (
        item.name.toLowerCase().includes(q) ||
        (item.sku ?? "").toLowerCase().includes(q) ||
        (item.part_number ?? "").toLowerCase().includes(q) ||
        item.inventory_type.toLowerCase().includes(q) ||
        locationName.includes(q) ||
        locationCode.includes(q)
      );
    });
  }, [items, search]);

  async function adjustItem(item: InventoryItem, delta: number) {
    const balance = item.inventory_balances[0];
    if (!balance) return;

    const nextQuantity = Math.max(0, balance.quantity_on_hand + delta);

    await fetch("/api/inventory", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inventory_item_id: item.id,
        location_id: balance.location_id,
        quantity_on_hand: nextQuantity,
      }),
    });

    await loadInventory();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Inventory
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tools, consumables, stock visibility, and warehouse control
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search item, SKU, part number, location, or code"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <div className="text-sm font-semibold text-foreground">
                ATLAS inventory prompts
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Low-stock highlighting is active. Search supports location codes.
                Scanner and camera-based intake will plug into this module next.
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="grid grid-cols-7 gap-4 border-b border-border px-6 py-4 text-sm font-semibold text-foreground">
            <div>Item</div>
            <div>Type</div>
            <div>SKU / Part</div>
            <div>Available</div>
            <div>Location</div>
            <div>Stock State</div>
            <div>Adjust</div>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Loading inventory...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              No inventory found.
            </div>
          ) : (
            filteredItems.map((item) => {
              const balance = item.inventory_balances[0];
              const available = balance?.quantity_available ?? 0;
              const threshold = item.reorder_threshold ?? 0;
              const low = available <= threshold;

              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-7 gap-4 border-b border-border px-6 py-5 text-sm last:border-b-0 ${
                    low ? "bg-red-50/60 dark:bg-red-950/10" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.id}
                    </div>
                  </div>

                  <div className="capitalize text-foreground">
                    {item.inventory_type}
                  </div>

                  <div className="text-foreground">
                    <div>{item.sku ?? "—"}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.part_number ?? "—"}
                    </div>
                  </div>

                  <div className={`font-semibold ${low ? "text-red-700 dark:text-red-300" : "text-foreground"}`}>
                    {available}
                  </div>

                  <div className="text-foreground">
                    <div>{balance?.location?.name ?? "—"}</div>
                    <div className="mt-1 text-xs text-accent">
                      {balance?.location?.code ?? "—"}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        low
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                      }`}
                    >
                      {low ? "Low Stock" : "Healthy"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustItem(item, -1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:border-accent hover:text-accent"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => adjustItem(item, 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:border-accent hover:text-accent"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}