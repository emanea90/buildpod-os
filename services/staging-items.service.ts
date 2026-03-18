import { prisma } from "../lib/prisma";
import { evaluateStagingSession } from "./staging-readiness.service";
import { createStagingSessionEvent } from "./staging-session-events.service";

type UpdateStagingItemData = {
  actual_quantity?: number | null;
  verification_status?: "pending" | "verified" | "missing" | "issue";
  note?: string | null;
  shortage_reason?: string | null;
};

type UpdateStagingItemHistory = {
  event_type?: string;
  result?: string | null;
  scanned_value?: string | null;
  message?: string | null;
  metadata?: unknown | null;
};

export async function updateStagingItem(
  itemId: string,
  data: UpdateStagingItemData,
  history?: UpdateStagingItemHistory
) {
  const existingItem = await prisma.staging_session_items.findUnique({
    where: { id: itemId },
    include: {
      staging_session: {
        select: {
          id: true,
          organization_id: true,
          status: true,
        },
      },
    },
  });

  if (!existingItem) {
    throw new Error("Staging item not found");
  }

  if ((existingItem.staging_session.status ?? "").toLowerCase() === "dispatched") {
    throw new Error("Dispatched sessions cannot be modified.");
  }

  const nextData: UpdateStagingItemData = { ...data };

  if (nextData.verification_status === "verified") {
    nextData.shortage_reason = null;
  }

  const updatedItem = await prisma.staging_session_items.update({
    where: { id: itemId },
    data: nextData,
  });

  if (history) {
    await createStagingSessionEvent({
      organization_id: existingItem.staging_session.organization_id,
      staging_session_id: existingItem.staging_session_id,
      staging_item_id: updatedItem.id,
      event_type: history.event_type ?? "staging.item_updated",
      result: history.result ?? null,
      scanned_value: history.scanned_value ?? null,
      message: history.message ?? null,
      previous_status: existingItem.verification_status ?? null,
      next_status: updatedItem.verification_status ?? null,
      note_snapshot: updatedItem.note ?? null,
      metadata: history.metadata ?? null,
    });
  }

  const updatedSession = await evaluateStagingSession(
    updatedItem.staging_session_id
  );

  return {
    item: updatedItem,
    session: updatedSession,
  };
}

export async function updateStagingItemNote(itemId: string, note: string) {
  return updateStagingItem(
    itemId,
    { note },
    {
      event_type: "staging.note_update",
      result: "note_edited",
      message: "Item note updated from staging UI",
    }
  );
}

export async function updateStagingItemShortageReason(
  itemId: string,
  shortageReason: string
) {
  return updateStagingItem(
    itemId,
    { shortage_reason: shortageReason },
    {
      event_type: "staging.governance_action",
      result: "shortage_reason_updated",
      message: "Shortage reason updated.",
      metadata: {
        shortage_reason: shortageReason,
      },
    }
  );
}

export async function bulkVerifyStagingItems(
  stagingSessionId: string,
  itemIds: string[]
) {
  const session = await prisma.staging_sessions.findUnique({
    where: { id: stagingSessionId },
    select: {
      id: true,
      organization_id: true,
      status: true,
    },
  });

  if (!session) {
    throw new Error("Staging session not found");
  }

  if ((session.status ?? "").toLowerCase() === "dispatched") {
    throw new Error("Dispatched sessions cannot be modified.");
  }

  const items = await prisma.staging_session_items.findMany({
    where: {
      staging_session_id: stagingSessionId,
      id: { in: itemIds },
    },
    orderBy: {
      created_at: "asc",
    },
  });

  const eligibleItems = items.filter((item) => {
    const status = item.verification_status?.toLowerCase();
    return status !== "verified" && status !== "missing" && status !== "issue";
  });

  if (eligibleItems.length === 0) {
    return {
      updated_count: 0,
      session: await evaluateStagingSession(stagingSessionId),
    };
  }

  await prisma.$transaction(async (tx) => {
    for (const item of eligibleItems) {
      await tx.staging_session_items.update({
        where: { id: item.id },
        data: {
          verification_status: "verified",
          actual_quantity: item.expected_quantity ?? item.actual_quantity ?? 1,
          shortage_reason: null,
        },
      });
    }

    await tx.staging_session_events.create({
      data: {
        organization_id: session.organization_id,
        staging_session_id: stagingSessionId,
        event_type: "staging.verify",
        result: "verified",
        message: `Bulk verified ${eligibleItems.length} item(s).`,
        metadata: {
          item_ids: eligibleItems.map((item) => item.id),
        } as never,
      },
    });
  });

  const updatedSession = await evaluateStagingSession(stagingSessionId);

  return {
    updated_count: eligibleItems.length,
    session: updatedSession,
  };
}