import { prisma } from "../lib/prisma";

export async function createInventoryItem(data: {
  organization_id: string;
  sku?: string;
  part_number?: string;
  name: string;
  inventory_type: "consumable" | "material" | "part" | "tooling";
  unit_of_measure: string;
  standard_cost?: number;
  reorder_threshold?: number;
  reorder_quantity?: number;
  location_id: string;
  quantity_on_hand?: number;
}) {
  const item = await prisma.inventory_items.create({
    data: {
      organization_id: data.organization_id,
      sku: data.sku,
      part_number: data.part_number,
      name: data.name,
      inventory_type: data.inventory_type,
      unit_of_measure: data.unit_of_measure,
      standard_cost: data.standard_cost,
      reorder_threshold: data.reorder_threshold,
      reorder_quantity: data.reorder_quantity,
      active_flag: true,
    },
  });

  const quantity = data.quantity_on_hand ?? 0;

  await prisma.inventory_balances.create({
    data: {
      organization_id: data.organization_id,
      inventory_item_id: item.id,
      location_id: data.location_id,
      quantity_on_hand: quantity,
      quantity_reserved: 0,
      quantity_available: quantity,
      last_counted_at: new Date(),
    },
  });

  await prisma.inventory_transactions.create({
    data: {
      organization_id: data.organization_id,
      inventory_item_id: item.id,
      location_id: data.location_id,
      transaction_type: "receive",
      quantity_delta: quantity,
      quantity_after: quantity,
      note: "Initial inventory creation",
      created_by_user_id: "demo-user-001",
    },
  });

  return item;
}

export async function adjustInventoryQuantity(data: {
  inventory_item_id: string;
  location_id: string;
  quantity_on_hand: number;
}) {
  const existing = await prisma.inventory_balances.findUnique({
    where: {
      inventory_item_id_location_id: {
        inventory_item_id: data.inventory_item_id,
        location_id: data.location_id,
      },
    },
  });

  if (!existing) {
    throw new Error("Inventory balance not found");
  }

  const quantity_available = data.quantity_on_hand - existing.quantity_reserved;
  const quantity_delta = data.quantity_on_hand - existing.quantity_on_hand;

  const updated = await prisma.inventory_balances.update({
    where: {
      inventory_item_id_location_id: {
        inventory_item_id: data.inventory_item_id,
        location_id: data.location_id,
      },
    },
    data: {
      quantity_on_hand: data.quantity_on_hand,
      quantity_available,
      last_counted_at: new Date(),
    },
  });

  await prisma.inventory_transactions.create({
    data: {
      organization_id: existing.organization_id,
      inventory_item_id: data.inventory_item_id,
      location_id: data.location_id,
      transaction_type: "adjust",
      quantity_delta,
      quantity_after: data.quantity_on_hand,
      note: "Manual quantity adjustment from inventory page",
      created_by_user_id: "demo-user-001",
    },
  });

  return updated;
}

export async function deactivateInventoryItem(inventoryItemId: string) {
    return prisma.inventory_items.update({
      where: {
        id: inventoryItemId,
      },
      data: {
        active_flag: false,
      },
    });
  }