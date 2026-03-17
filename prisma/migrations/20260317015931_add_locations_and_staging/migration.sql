-- CreateEnum
CREATE TYPE "location_type" AS ENUM ('warehouse', 'shop', 'jobsite', 'trailer_bay', 'hangar', 'yard', 'other');

-- CreateEnum
CREATE TYPE "staging_status" AS ENUM ('draft', 'in_progress', 'verified', 'failed', 'completed');

-- CreateEnum
CREATE TYPE "staging_item_type" AS ENUM ('asset', 'inventory', 'checklist');

-- CreateEnum
CREATE TYPE "verification_status" AS ENUM ('pending', 'verified', 'missing', 'issue');

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location_type" "location_type" NOT NULL,
    "parent_location_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staging_sessions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "target_asset_id" TEXT NOT NULL,
    "target_job_id" TEXT,
    "started_by_user_id" TEXT,
    "status" "staging_status" NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staging_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staging_session_items" (
    "id" TEXT NOT NULL,
    "staging_session_id" TEXT NOT NULL,
    "item_type" "staging_item_type" NOT NULL,
    "referenced_item_id" TEXT NOT NULL,
    "expected_quantity" INTEGER,
    "actual_quantity" INTEGER,
    "verification_status" "verification_status" NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staging_session_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "locations_organization_id_idx" ON "locations"("organization_id");

-- CreateIndex
CREATE INDEX "locations_parent_location_id_idx" ON "locations"("parent_location_id");

-- CreateIndex
CREATE INDEX "staging_sessions_organization_id_idx" ON "staging_sessions"("organization_id");

-- CreateIndex
CREATE INDEX "staging_sessions_target_asset_id_idx" ON "staging_sessions"("target_asset_id");

-- CreateIndex
CREATE INDEX "staging_sessions_target_job_id_idx" ON "staging_sessions"("target_job_id");

-- CreateIndex
CREATE INDEX "staging_sessions_started_by_user_id_idx" ON "staging_sessions"("started_by_user_id");

-- CreateIndex
CREATE INDEX "staging_sessions_status_idx" ON "staging_sessions"("status");

-- CreateIndex
CREATE INDEX "staging_session_items_staging_session_id_idx" ON "staging_session_items"("staging_session_id");

-- CreateIndex
CREATE INDEX "staging_session_items_item_type_idx" ON "staging_session_items"("item_type");

-- CreateIndex
CREATE INDEX "staging_session_items_referenced_item_id_idx" ON "staging_session_items"("referenced_item_id");

-- CreateIndex
CREATE INDEX "staging_session_items_verification_status_idx" ON "staging_session_items"("verification_status");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_location_id_fkey" FOREIGN KEY ("parent_location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staging_sessions" ADD CONSTRAINT "staging_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staging_sessions" ADD CONSTRAINT "staging_sessions_target_asset_id_fkey" FOREIGN KEY ("target_asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staging_sessions" ADD CONSTRAINT "staging_sessions_target_job_id_fkey" FOREIGN KEY ("target_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staging_sessions" ADD CONSTRAINT "staging_sessions_started_by_user_id_fkey" FOREIGN KEY ("started_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staging_session_items" ADD CONSTRAINT "staging_session_items_staging_session_id_fkey" FOREIGN KEY ("staging_session_id") REFERENCES "staging_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
