import { prisma } from "../lib/prisma";

export async function getInventoryOverview(organizationId: string) {
  return prisma.inventory_items.findMany({
    where: {
      organization_id: organizationId,
      active_flag: true,
    },
    include: {
      inventory_balances: {
        include: {
          location: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
}