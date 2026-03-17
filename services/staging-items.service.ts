import { prisma } from "../lib/prisma";
import { evaluateStagingSession } from "./staging-readiness.service";

export async function updateStagingItem(
  itemId: string,
  data: {
    actual_quantity?: number;
    verification_status?: "pending" | "verified" | "missing" | "issue";
    note?: string;
  }
) {
  const updatedItem = await prisma.staging_session_items.update({
    where: { id: itemId },
    data,
  });

  const updatedSession = await evaluateStagingSession(
    updatedItem.staging_session_id
  );

  return {
    item: updatedItem,
    session: updatedSession,
  };
}