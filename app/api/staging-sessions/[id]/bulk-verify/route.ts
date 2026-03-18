import { NextResponse } from "next/server";
import { bulkVerifyStagingItems } from "../../../../../services/staging-items.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const itemIds = Array.isArray(body.item_ids) ? body.item_ids : [];

    const result = await bulkVerifyStagingItems(id, itemIds);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to bulk verify staging items",
      },
      { status: 500 }
    );
  }
}