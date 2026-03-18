import { prisma } from "../lib/prisma";
import { createStagingSessionEvent } from "./staging-session-events.service";

function deriveStagingStatus(
  items: Array<{
    verification_status?: string | null;
  }>,
  currentStatus?: string | null
) {
  const hasBlockingIssues = items.some((item) => {
    const status = item.verification_status?.toLowerCase();
    return status === "missing" || status === "issue";
  });

  if (hasBlockingIssues) {
    return "short";
  }

  if (items.length === 0) {
    return "draft";
  }

  const allVerified = items.every(
    (item) => item.verification_status?.toLowerCase() === "verified"
  );

  if (allVerified) {
    if ((currentStatus ?? "").toLowerCase() === "dispatched") {
      return "dispatched";
    }

    return "ready";
  }

  return "in_progress";
}

export async function evaluateStagingSession(sessionId: string) {
  const session = await prisma.staging_sessions.findUnique({
    where: { id: sessionId },
    include: {
      items: true,
    },
  });

  if (!session) {
    throw new Error("Staging session not found");
  }

  const nextStatus = deriveStagingStatus(session.items, session.status);
  const previousStatus = session.status;

  const completedAt =
    nextStatus === "ready" || nextStatus === "dispatched"
      ? session.completed_at ?? new Date()
      : null;

  const updatedSession = await prisma.staging_sessions.update({
    where: { id: sessionId },
    data: {
      status: nextStatus as never,
      completed_at: completedAt,
    },
  });

  if (previousStatus !== nextStatus) {
    await createStagingSessionEvent({
      organization_id: session.organization_id,
      staging_session_id: session.id,
      event_type: "staging.status_change",
      result: nextStatus,
      message: `Session status derived to ${nextStatus}.`,
      previous_status: previousStatus,
      next_status: nextStatus,
      metadata: {
        blocker_count: session.items.filter((item) => {
          const status = item.verification_status?.toLowerCase();
          return status === "missing" || status === "issue";
        }).length,
      },
    });
  }

  if (session.target_job_id) {
    const jobReady = nextStatus === "ready" || nextStatus === "dispatched";

    await prisma.jobs.update({
      where: { id: session.target_job_id },
      data: {
        status: (jobReady ? "ready" : "in_progress") as never,
      },
    });
  }
  
  return updatedSession;
}