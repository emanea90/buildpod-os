import { NextResponse } from "next/server";
import { updateStagingItem } from "../../../services/staging-items.service";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { id, actual_quantity, verification_status, note } = body;

    const updated = await updateStagingItem(id, {
      actual_quantity,
      verification_status,
      note,
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
        error: "Failed to update staging item",
      },
      { status: 500 }
    );
  }
}