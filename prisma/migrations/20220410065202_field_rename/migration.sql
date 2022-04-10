/*
  Warnings:

  - You are about to drop the `item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "price_data" DROP CONSTRAINT "price_data_item_name_fkey";

-- DropTable
DROP TABLE "item";

-- CreateTable
CREATE TABLE "market_item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bundle_size" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "market_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_item_id_key" ON "market_item"("id");

-- CreateIndex
CREATE UNIQUE INDEX "market_item_name_key" ON "market_item"("name");

-- AddForeignKey
ALTER TABLE "price_data" ADD CONSTRAINT "price_data_item_name_fkey" FOREIGN KEY ("item_name") REFERENCES "market_item"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
