import { prisma } from "../lib/prisma";

export async function getRecentInventoryTransactions(organizationId: string) {
  return prisma.inventory_transactions.findMany({
    where: {
      organization_id: organizationId,
    },
    include: {
      inventory_item: true,
      location: true,
      created_by: true,
    },
    orderBy: {
      created_at: "desc",
    },
    take: 20,
  });
}