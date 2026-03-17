import { prisma } from "../lib/prisma";

export async function getDashboardJobs(organizationId: string) {
  return prisma.jobs.findMany({
    where: {
      organization_id: organizationId,
    },
    include: {
      staging_sessions: {
        include: {
          target_asset: true,
        },
        orderBy: {
          created_at: "desc",
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
}