import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import {
  asset_status,
  job_status,
  membership_role,
  maintenance_status,
} from "../app/generated/prisma/enums";

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