import { prisma } from "../lib/prisma";

export async function getAllStagingSessions(organizationId: string) {
  return prisma.staging_sessions.findMany({
    where: organizationId
  ? { organization_id: organizationId }
  : {},
    include: {
      target_asset: true,
      target_job: true,
      started_by: true,
      items: {
        orderBy: {
          created_at: "asc",
        },
      },
    },
    orderBy: {
      started_at: "desc",
    },
  });
}
