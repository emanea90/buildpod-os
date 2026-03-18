import { prisma } from "../lib/prisma";

type CreateStagingSessionEventInput = {
  organization_id?: string | null;
  staging_session_id: string;
  staging_item_id?: string | null;
  event_type: string;
  result?: string | null;
  scanned_value?: string | null;
  message?: string | null;
  previous_status?: string | null;
  next_status?: string | null;
  note_snapshot?: string | null;
  metadata?: unknown | null;
};

export async function createStagingSessionEvent(
  input: CreateStagingSessionEventInput
) {
  return prisma.staging_session_events.create({
    data: {
      organization_id: input.organization_id ?? null,
      staging_session_id: input.staging_session_id,
      staging_item_id: input.staging_item_id ?? null,
      event_type: input.event_type,
      result: input.result ?? null,
      scanned_value: input.scanned_value ?? null,
      message: input.message ?? null,
      previous_status: input.previous_status ?? null,
      next_status: input.next_status ?? null,
      note_snapshot: input.note_snapshot ?? null,
      metadata: (input.metadata ?? null) as never,
    },
  });
}