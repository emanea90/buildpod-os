import { prisma } from "../lib/prisma";

export async function updateStagingItem(
  itemId: string,
  data: {
    actual_quantity?: number;
    verification_status?: "pending" | "verified" | "missing" | "issue";
    note?: string;
  }
) {
  return prisma.staging_session_items.update({
    where: { id: itemId },
    data,
  });
}