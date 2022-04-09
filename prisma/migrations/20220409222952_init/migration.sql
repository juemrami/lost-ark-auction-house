-- CreateTable
CREATE TABLE "item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bundle_size" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_data" (
    "data_id" TEXT NOT NULL,
    "item_id" INTEGER NOT NULL,
    "avg_day_price" INTEGER,
    "recent_price" INTEGER,
    "lowest_price" INTEGER,
    "lowest_rem" INTEGER,
    "date_time" TIMESTAMP(3),

    CONSTRAINT "price_data_pkey" PRIMARY KEY ("data_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "item_id_key" ON "item"("id");

-- AddForeignKey
ALTER TABLE "price_data" ADD CONSTRAINT "price_data_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
