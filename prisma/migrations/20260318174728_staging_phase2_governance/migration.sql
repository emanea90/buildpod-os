-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "staging_status" ADD VALUE 'ready';
ALTER TYPE "staging_status" ADD VALUE 'short';
ALTER TYPE "staging_status" ADD VALUE 'dispatched';
ALTER TYPE "staging_status" ADD VALUE 'closed';

-- AlterTable
ALTER TABLE "staging_session_items" ADD COLUMN     "shortage_reason" TEXT;

-- AlterTable
ALTER TABLE "staging_sessions" ADD COLUMN     "release_note" TEXT,
ADD COLUMN     "released_at" TIMESTAMP(3),
ADD COLUMN     "released_by_user_id" TEXT;

-- CreateIndex
CREATE INDEX "staging_sessions_released_by_user_id_idx" ON "staging_sessions"("released_by_user_id");
