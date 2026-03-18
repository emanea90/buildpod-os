import { prisma } from "../lib/prisma";

export async function getAllStagingSessions(organizationId: string) {
  return prisma.staging_sessions.findMany({
    where: organizationId ? { organization_id: organizationId } : {},
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

export async function getStagingSessionById(sessionId: string) {
  return prisma.staging_sessions.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      target_asset: true,
      target_job: true,
      started_by: true,
      items: {
        orderBy: {
          created_at: "asc",
        },
      },
      events: {
        orderBy: {
          created_at: "desc",
        },
        take: 50,
        include: {
          staging_item: {
            select: {
              id: true,
              referenced_item_id: true,
              item_type: true,
            },
          },
        },
      },
    },
  });
}