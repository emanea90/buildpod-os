/*
  Warnings:

  - The values [verified,failed,completed] on the enum `staging_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "staging_status_new" AS ENUM ('draft', 'in_progress', 'ready', 'short', 'dispatched', 'closed');
ALTER TABLE "public"."staging_sessions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "staging_sessions" ALTER COLUMN "status" TYPE "staging_status_new" USING ("status"::text::"staging_status_new");
ALTER TYPE "staging_status" RENAME TO "staging_status_old";
ALTER TYPE "staging_status_new" RENAME TO "staging_status";
DROP TYPE "public"."staging_status_old";
ALTER TABLE "staging_sessions" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;
