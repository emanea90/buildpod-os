"use client";

import { AppShell } from "../../components/app-shell";
import {
  Search,
  TriangleAlert,
  Plus,
  Minus,
  PackagePlus,
  Archive,
} from "lucide-react";
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

type InventoryTransaction = {
  id: string;
  transaction_type: string;
  quantity_delta: number;
  quantity_after: number;
  note: string | null;
  created_at: string;
  inventory_item: {
    name: string;
  };
  location: {
    name: string;
    code: string | null;
  };
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    part_number: "",
    inventory_type: "consumable",
    unit_of_measure: "box",
    reorder_threshold: 2,
    reorder_quantity: 5,
    quantity_on_hand: 0,
    location_id: "location-warehouse-001",
  });

  async function loadInventory() {
    setLoading(true);

    const [inventoryRes, transactionRes] = await Promise.all([
      fetch("/api/inventory"),
      fetch("/api/inventory/transactions"),
    ]);

    const inventoryJson = await inventoryRes.json();
    const transactionJson = await transactionRes.json();

    setItems(inventoryJson.data ?? []);
    setTransactions(transactionJson.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const lowStockCount = items.filter((item) => {
    const balance = item.inventory_balances[0];
    const available = balance?.quantity_available ?? 0;
    const threshold = item.reorder_threshold ?? 0;
    return available <= threshold;
  }).length;

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

  async function createItem(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        sku: form.sku || null,
        part_number: form.part_number || null,
        inventory_type: form.inventory_type,
        unit_of_measure: form.unit_of_measure,
        reorder_threshold: Number(form.reorder_threshold),
        reorder_quantity: Number(form.reorder_quantity),
        quantity_on_hand: Number(form.quantity_on_hand),
        location_id: form.location_id,
      }),
    });

    setForm({
      name: "",
      sku: "",
      part_number: "",
      inventory_type: "consumable",
      unit_of_measure: "box",
      reorder_threshold: 2,
      reorder_quantity: 5,
      quantity_on_hand: 0,
      location_id: "location-warehouse-001",
    });

    await loadInventory();
  }

  async function deactivateItem(itemId: string) {
    await fetch("/api/inventory", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inventory_item_id: itemId,
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
                Low-stock highlighting is active. Search supports location
                codes. Scanner and camera-based intake will plug into this
                module next.
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <form
            onSubmit={createItem}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <PackagePlus className="h-5 w-5 text-accent" />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Quick add inventory item
                </div>
                <div className="text-xs text-muted-foreground">
                  Add consumables, parts, tooling, or materials
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Item name"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                required
              />
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="SKU"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
              <input
                value={form.part_number}
                onChange={(e) =>
                  setForm({ ...form, part_number: e.target.value })
                }
                placeholder="Part number"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
              <select
                value={form.inventory_type}
                onChange={(e) =>
                  setForm({ ...form, inventory_type: e.target.value })
                }
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="consumable">Consumable</option>
                <option value="material">Material</option>
                <option value="part">Part</option>
                <option value="tooling">Tooling</option>
              </select>
              <input
                value={form.unit_of_measure}
                onChange={(e) =>
                  setForm({ ...form, unit_of_measure: e.target.value })
                }
                placeholder="Unit of measure"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
              <input
                type="number"
                value={form.quantity_on_hand}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity_on_hand: Number(e.target.value),
                  })
                }
                placeholder="Starting quantity"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
              <input
                type="number"
                value={form.reorder_threshold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reorder_threshold: Number(e.target.value),
                  })
                }
                placeholder="Reorder threshold"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
              <input
                type="number"
                value={form.reorder_quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reorder_quantity: Number(e.target.value),
                  })
                }
                placeholder="Reorder quantity"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              <PackagePlus className="h-4 w-4" />
              Add Item
            </button>
          </form>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold text-foreground">
              Inventory signals
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Low stock items
              </div>
              <div className="mt-2 text-3xl font-bold text-foreground">
                {lowStockCount}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Items at or below reorder threshold
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="grid grid-cols-8 gap-4 border-b border-border px-6 py-4 text-sm font-semibold text-foreground">
            <div>Item</div>
            <div>Type</div>
            <div>SKU / Part</div>
            <div>Available</div>
            <div>Location</div>
            <div>Stock State</div>
            <div>Adjust</div>
            <div>Archive</div>
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
                  className={`grid grid-cols-8 gap-4 border-b border-border px-6 py-5 text-sm last:border-b-0 ${
                    low ? "bg-red-50/60 dark:bg-red-950/10" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {item.name}
                    </div>
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

                  <div
                    className={`font-semibold ${
                      low ? "text-red-700 dark:text-red-300" : "text-foreground"
                    }`}
                  >
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

                  <div>
                    <button
                      onClick={() => deactivateItem(item.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:border-red-400 hover:text-red-500"
                      title="Archive item"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">
              Recent inventory activity
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Audit trail for stock changes and future scan events
            </p>
          </div>

          <div className="divide-y divide-border">
            {transactions.length === 0 ? (
              <div className="px-6 py-6 text-sm text-muted-foreground">
                No transactions yet.
              </div>
            ) : (
              transactions.map((txn) => {
                const positive = txn.quantity_delta > 0;
                const neutral = txn.quantity_delta === 0;

                return (
                  <div
                    key={txn.id}
                    className="grid grid-cols-6 gap-4 px-6 py-4 text-sm"
                  >
                    <div className="font-medium text-foreground">
                      {txn.inventory_item.name}
                    </div>

                    <div className="capitalize text-foreground">
                      {txn.transaction_type}
                    </div>

                    <div
                      className={
                        neutral
                          ? "text-muted-foreground"
                          : positive
                            ? "font-semibold text-green-700 dark:text-green-300"
                            : "font-semibold text-red-700 dark:text-red-300"
                      }
                    >
                      {neutral
                        ? "0"
                        : positive
                          ? `+${txn.quantity_delta}`
                          : txn.quantity_delta}
                    </div>

                    <div className="text-foreground">
                      After: {txn.quantity_after}
                    </div>

                    <div className="text-foreground">
                      {txn.location.name}
                      <div className="mt-1 text-xs text-accent">
                        {txn.location.code ?? "—"}
                      </div>
                    </div>

                    <div className="text-muted-foreground">
                      {txn.note ?? "—"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}