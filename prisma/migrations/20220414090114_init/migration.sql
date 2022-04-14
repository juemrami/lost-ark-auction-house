-- CreateTable
CREATE TABLE "market_item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bundle_size" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "market_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_data" (
    "data_id" TEXT NOT NULL,
    "avg_day_price" DECIMAL(65,30),
    "recent_price" DECIMAL(65,30),
    "lowest_price" DECIMAL(65,30),
    "cheapest_rem" INTEGER,
    "date_time" TIMESTAMP(3),
    "item_name" TEXT NOT NULL,

    CONSTRAINT "price_data_pkey" PRIMARY KEY ("data_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_item_id_key" ON "market_item"("id");

-- CreateIndex
CREATE UNIQUE INDEX "market_item_name_key" ON "market_item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "price_data_item_name_date_time_key" ON "price_data"("item_name", "date_time");

-- AddForeignKey
ALTER TABLE "price_data" ADD CONSTRAINT "price_data_item_name_fkey" FOREIGN KEY ("item_name") REFERENCES "market_item"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
