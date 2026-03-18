import { NextResponse } from "next/server";
import {
  updateStagingItem,
  updateStagingItemNote,
  updateStagingItemShortageReason,
} from "../../../services/staging-items.service";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      actual_quantity,
      verification_status,
      note,
      shortage_reason,
      action_source,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "id is required",
        },
        { status: 400 }
      );
    }

    if (
      note !== undefined &&
      verification_status === undefined &&
      actual_quantity === undefined &&
      shortage_reason === undefined
    ) {
      const updated = await updateStagingItemNote(id, note ?? "");

      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    if (
      shortage_reason !== undefined &&
      verification_status === undefined &&
      actual_quantity === undefined &&
      note === undefined
    ) {
      const updated = await updateStagingItemShortageReason(
        id,
        shortage_reason ?? ""
      );

      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    const updated = await updateStagingItem(
      id,
      {
        actual_quantity,
        verification_status,
        note,
        shortage_reason,
      },
      {
        event_type:
          action_source === "manual_status_change"
            ? "staging.verify"
            : "staging.item_updated",
        result:
          action_source === "manual_status_change"
            ? "manual_status_change"
            : "item_updated",
        message:
          action_source === "manual_status_change"
            ? "Item status changed manually from staging UI"
            : "Item updated from staging UI",
      }
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update staging item",
      },
      { status: 500 }
    );
  }
}