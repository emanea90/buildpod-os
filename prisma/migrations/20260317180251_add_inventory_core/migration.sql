-- CreateEnum
CREATE TYPE "inventory_type" AS ENUM ('consumable', 'material', 'part', 'tooling');

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "sku" TEXT,
    "part_number" TEXT,
    "name" TEXT NOT NULL,
    "inventory_type" "inventory_type" NOT NULL,
    "unit_of_measure" TEXT NOT NULL,
    "standard_cost" DOUBLE PRECISION,
    "reorder_threshold" INTEGER,
    "reorder_quantity" INTEGER,
    "active_flag" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_balances" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "inventory_item_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
    "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
    "quantity_available" INTEGER NOT NULL DEFAULT 0,
    "last_counted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_items_organization_id_idx" ON "inventory_items"("organization_id");

-- CreateIndex
CREATE INDEX "inventory_items_sku_idx" ON "inventory_items"("sku");

-- CreateIndex
CREATE INDEX "inventory_items_part_number_idx" ON "inventory_items"("part_number");

-- CreateIndex
CREATE INDEX "inventory_balances_organization_id_idx" ON "inventory_balances"("organization_id");

-- CreateIndex
CREATE INDEX "inventory_balances_location_id_idx" ON "inventory_balances"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_balances_inventory_item_id_location_id_key" ON "inventory_balances"("inventory_item_id", "location_id");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
