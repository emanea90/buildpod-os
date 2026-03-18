import { prisma } from "../lib/prisma";
import { createStagingSessionEvent } from "./staging-session-events.service";
import { updateStagingItem } from "./staging-items.service";

type HandleStagingScanResult =
  | {
      ok: true;
      result: "verified" | "already_verified" | "unmatched" | "invalid" | "ignored";
      message: string;
      item_id?: string;
      referenced_item_id?: string | null;
    }
  | {
      ok: false;
      result: "error";
      message: string;
    };

export async function handleStagingScan(
  stagingSessionId: string,
  rawScannedValue: string
): Promise<HandleStagingScanResult> {
  const scannedValue = rawScannedValue.trim();

  if (!scannedValue) {
    return {
      ok: true,
      result: "ignored",
      message: "Empty scan ignored.",
    };
  }

  const session = await prisma.staging_sessions.findUnique({
    where: { id: stagingSessionId },
    select: {
      id: true,
      organization_id: true,
      status: true,
    },
  });

  if (!session) {
    return {
      ok: false,
      result: "error",
      message: "Staging session not found.",
    };
  }

  if ((session.status ?? "").toLowerCase() === "dispatched") {
    return {
      ok: false,
      result: "error",
      message: "This session has already been released and cannot be modified.",
    };
  }

  if (scannedValue.length < 2) {
    await createStagingSessionEvent({
      organization_id: session.organization_id,
      staging_session_id: stagingSessionId,
      event_type: "staging.scan",
      result: "invalid",
      scanned_value: scannedValue,
      message: "Invalid scan input received.",
    });

    return {
      ok: true,
      result: "invalid",
      message: "Invalid scan input.",
    };
  }

  const items = await prisma.staging_session_items.findMany({
    where: {
      staging_session_id: stagingSessionId,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  const normalizedScan = scannedValue.toLowerCase();

  const matchedItem =
    items.find(
      (item) =>
        (item.referenced_item_id ?? "").toLowerCase() === normalizedScan
    ) ??
    items.find((item) => item.id.toLowerCase() === normalizedScan);

  if (!matchedItem) {
    await createStagingSessionEvent({
      organization_id: session.organization_id,
      staging_session_id: stagingSessionId,
      event_type: "staging.scan",
      result: "unmatched",
      scanned_value: scannedValue,
      message: "Scan did not match any staging item.",
    });

    return {
      ok: true,
      result: "unmatched",
      message: "No staging item matched that scan.",
    };
  }

  if ((matchedItem.verification_status ?? "").toLowerCase() === "verified") {
    await createStagingSessionEvent({
      organization_id: session.organization_id,
      staging_session_id: stagingSessionId,
      staging_item_id: matchedItem.id,
      event_type: "staging.scan",
      result: "already_verified",
      scanned_value: scannedValue,
      message: "Item already verified.",
      previous_status: matchedItem.verification_status ?? null,
      next_status: matchedItem.verification_status ?? null,
      note_snapshot: matchedItem.note ?? null,
    });

    return {
      ok: true,
      result: "already_verified",
      message: "Item already verified.",
      item_id: matchedItem.id,
      referenced_item_id: matchedItem.referenced_item_id ?? null,
    };
  }

  await updateStagingItem(
    matchedItem.id,
    {
      verification_status: "verified",
      actual_quantity:
        matchedItem.expected_quantity ??
        matchedItem.actual_quantity ??
        1,
      shortage_reason: null,
    },
    {
      event_type: "staging.scan",
      result: "verified",
      scanned_value: scannedValue,
      message: "Item verified by scanner.",
    }
  );

  return {
    ok: true,
    result: "verified",
    message: "Item verified.",
    item_id: matchedItem.id,
    referenced_item_id: matchedItem.referenced_item_id ?? null,
  };
}