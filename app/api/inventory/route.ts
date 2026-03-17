import { NextResponse } from "next/server";
import { getInventoryOverview } from "@/services/inventory.service";
import {
  adjustInventoryQuantity,
  createInventoryItem,
  deactivateInventoryItem,
} from "@/services/inventory-mutations.service";

export async function GET() {
  try {
    const organizationId = "buildpod-org-001";
    const items = await getInventoryOverview(organizationId);

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch inventory",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const created = await createInventoryItem({
      organization_id: "buildpod-org-001",
      sku: body.sku,
      part_number: body.part_number,
      name: body.name,
      inventory_type: body.inventory_type,
      unit_of_measure: body.unit_of_measure,
      standard_cost: body.standard_cost,
      reorder_threshold: body.reorder_threshold,
      reorder_quantity: body.reorder_quantity,
      location_id: body.location_id,
      quantity_on_hand: body.quantity_on_hand,
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create inventory item",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const updated = await adjustInventoryQuantity({
      inventory_item_id: body.inventory_item_id,
      location_id: body.location_id,
      quantity_on_hand: body.quantity_on_hand,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to adjust inventory quantity",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const deleted = await deactivateInventoryItem(body.inventory_item_id);

    return NextResponse.json({
      success: true,
      data: deleted,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove inventory item",
      },
      { status: 500 }
    );
  }
}