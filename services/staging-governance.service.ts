import { prisma } from "../lib/prisma";
import { createStagingSessionEvent } from "./staging-session-events.service";
import { evaluateStagingSession } from "./staging-readiness.service";

export async function releaseStagingSession(
  sessionId: string,
  releaseNote?: string | null
) {
  const session = await prisma.staging_sessions.findUnique({
    where: { id: sessionId },
    include: {
      items: true,
    },
  });

  if (!session) {
    throw new Error("Staging session not found.");
  }

  const evaluated = await evaluateStagingSession(sessionId);

  if ((evaluated.status ?? "").toLowerCase() !== "ready") {
    throw new Error("This session is blocked and cannot be released.");
  }

  const actorUserId = session.started_by_user_id ?? "system";

  const released = await prisma.staging_sessions.update({
    where: { id: sessionId },
    data: {
      status: "dispatched" as never,
      released_at: new Date(),
      released_by_user_id: actorUserId,
      release_note: releaseNote ?? null,
    },
  });

  await createStagingSessionEvent({
    organization_id: session.organization_id,
    staging_session_id: session.id,
    event_type: "staging.governance_action",
    result: "dispatched",
    message: "Session released for dispatch.",
    previous_status: evaluated.status,
    next_status: "dispatched",
    metadata: {
      released_by_user_id: actorUserId,
      release_note: releaseNote ?? null,
    },
  });

  return released;
}