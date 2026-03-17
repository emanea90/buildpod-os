import { prisma } from "../lib/prisma";

export async function getAllStagingSessions(organizationId: string) {
  return prisma.staging_sessions.findMany({
    where: {
      organization_id: organizationId,
    },
    include: {
      target_asset: true,
      target_job: true,
      started_by: true,
      items: true,
    },
    orderBy: {
      started_at: "desc",
    },
  });
}