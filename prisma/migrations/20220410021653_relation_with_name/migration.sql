/*
  Warnings:

  - You are about to drop the column `item_id` on the `price_data` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `item` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `item_name` to the `price_data` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "price_data" DROP CONSTRAINT "price_data_item_id_fkey";

-- AlterTable
ALTER TABLE "price_data" DROP COLUMN "item_id",
ADD COLUMN     "item_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "item_name_key" ON "item"("name");

-- AddForeignKey
ALTER TABLE "price_data" ADD CONSTRAINT "price_data_item_name_fkey" FOREIGN KEY ("item_name") REFERENCES "item"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
