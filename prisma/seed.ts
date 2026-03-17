import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
  asset_status,
  job_status,
  membership_role,
  maintenance_status,
} from "../generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const organization = await prisma.organizations.upsert({
    where: { id: "buildpod-org-001" },
    update: {},
    create: {
      id: "buildpod-org-001",
      name: "BuildPod Demo Org",
    },
  });

  const user = await prisma.users.upsert({
    where: { id: "demo-user-001" },
    update: {},
    create: {
      id: "demo-user-001",
      email: "admin@buildpod.local",
    },
  });

  await prisma.organization_memberships.upsert({
    where: { id: "membership-001" },
    update: {},
    create: {
      id: "membership-001",
      organization_id: organization.id,
      user_id: user.id,
      role: membership_role.owner,
    },
  });

  const trailer = await prisma.assets.upsert({
    where: { id: "asset-trailer-001" },
    update: {},
    create: {
      id: "asset-trailer-001",
      organization_id: organization.id,
      name: "Trailer 01",
      asset_type: "trailer",
      status: asset_status.available,
    },
  });

  await prisma.jobs.upsert({
    where: { id: "job-001" },
    update: {},
    create: {
      id: "job-001",
      organization_id: organization.id,
      title: "Demo Job – Warehouse Staging Test",
      description: "Initial BuildPod OS demo job.",
      status: job_status.planned,
    },
  });

  await prisma.maintenance_events.upsert({
    where: { id: "maintenance-001" },
    update: {},
    create: {
      id: "maintenance-001",
      organization_id: organization.id,
      asset_id: trailer.id,
      description: "Initial demo maintenance record.",
      status: maintenance_status.open,
    },
  });

  const warehouse = await prisma.locations.upsert({
    where: { id: "location-warehouse-001" },
    update: {},
    create: {
      id: "location-warehouse-001",
      organization_id: organization.id,
      name: "Main Warehouse",
      location_type: "warehouse",
    },
  });

  await prisma.locations.upsert({
    where: { id: "location-trailer-bay-001" },
    update: {},
    create: {
      id: "location-trailer-bay-001",
      organization_id: organization.id,
      name: "Trailer Bay 01",
      location_type: "trailer_bay",
      parent_location_id: warehouse.id,
    },
  });

  const stagingSession = await prisma.staging_sessions.upsert({
    where: { id: "staging-session-001" },
    update: {},
    create: {
      id: "staging-session-001",
      organization_id: organization.id,
      target_asset_id: trailer.id,
      target_job_id: "job-001",
      started_by_user_id: user.id,
      status: "in_progress",
      notes: "Initial demo staging session.",
    },
  });

  await prisma.staging_session_items.upsert({
    where: { id: "staging-item-001" },
    update: {},
    create: {
      id: "staging-item-001",
      staging_session_id: stagingSession.id,
      item_type: "asset",
      referenced_item_id: trailer.id,
      expected_quantity: 1,
      actual_quantity: 1,
      verification_status: "verified",
      note: "Trailer verified for demo staging.",
    },
  });

  await prisma.staging_session_items.upsert({
    where: { id: "staging-item-002" },
    update: {},
    create: {
      id: "staging-item-002",
      staging_session_id: stagingSession.id,
      item_type: "checklist",
      referenced_item_id: "checklist-demo-001",
      expected_quantity: 1,
      actual_quantity: 0,
      verification_status: "pending",
      note: "Checklist item still pending.",
    },
  });

  await prisma.events.create({
    data: {
      organization_id: organization.id,
      entity_type: "system",
      entity_id: "seed",
      event_type: "seed.completed",
      payload_json: {
        message: "Initial BOS Axis seed complete",
      },
      user_id: user.id,
    },
  });

  console.log("Seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });