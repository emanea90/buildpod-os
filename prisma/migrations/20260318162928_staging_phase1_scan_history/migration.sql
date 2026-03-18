-- CreateTable
CREATE TABLE "staging_session_events" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "staging_session_id" TEXT NOT NULL,
    "staging_item_id" TEXT,
    "event_type" TEXT NOT NULL,
    "result" TEXT,
    "scanned_value" TEXT,
    "message" TEXT,
    "previous_status" TEXT,
    "next_status" TEXT,
    "note_snapshot" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staging_session_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staging_session_events_staging_session_id_created_at_idx" ON "staging_session_events"("staging_session_id", "created_at");

-- CreateIndex
CREATE INDEX "staging_session_events_staging_item_id_created_at_idx" ON "staging_session_events"("staging_item_id", "created_at");

-- AddForeignKey
ALTER TABLE "staging_session_events" ADD CONSTRAINT "staging_session_events_staging_session_id_fkey" FOREIGN KEY ("staging_session_id") REFERENCES "staging_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staging_session_events" ADD CONSTRAINT "staging_session_events_staging_item_id_fkey" FOREIGN KEY ("staging_item_id") REFERENCES "staging_session_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
