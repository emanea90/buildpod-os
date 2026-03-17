import { prisma } from "../lib/prisma";

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

  const hasItems = session.items.length > 0;
  const hasMissing = session.items.some(
    (item) =>
      item.verification_status === "missing" ||
      item.verification_status === "issue"
  );
  const allVerified =
    hasItems &&
    session.items.every((item) => item.verification_status === "verified");

  let nextStatus: "in_progress" | "failed" | "completed" = "in_progress";

  if (hasMissing) {
    nextStatus = "failed";
  } else if (allVerified) {
    nextStatus = "completed";
  } else {
    nextStatus = "in_progress";
  }

  const updatedSession = await prisma.staging_sessions.update({
    where: { id: sessionId },
    data: {
      status: nextStatus,
      completed_at: nextStatus === "completed" ? new Date() : null,
    },
  });

  if (session.target_job_id) {
    let nextJobStatus: "staging" | "ready" = "staging";

    if (nextStatus === "completed") {
      nextJobStatus = "ready";
    } else {
      nextJobStatus = "staging";
    }

    await prisma.jobs.update({
      where: { id: session.target_job_id },
      data: {
        status: nextJobStatus,
      },
    });
  }

  return updatedSession;
}