import { prisma } from "../lib/prisma";

export async function getAllJobs(organizationId: string) {
  return prisma.jobs.findMany({
    where: {
      organization_id: organizationId,
    },
    include: {
      staging_sessions: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}