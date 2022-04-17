import Prisma from "@prisma/client";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { price_data, market_item } from "@prisma/client";

const prisma = new Prisma.PrismaClient();

// console.log(item_list);
await prisma.$connect();
const results = {};
const data = await prisma.market_item.findMany({
  select: {
    name: true,
    bundle_size: true,
    price_history: {
      select: {
        lowest_price: true,
        recent_price: true,
        date_time: true,
        avg_day_price: true,
        cheapest_rem: true,
      },
    },
  },
});

for (const item of data) {
  const { name: item_name, price_history } = item;

  if (!results[item_name]) {
    results[item_name] = [];
  }
  for (const price_data of price_history) {
    results[item_name].push({ ...price_data });
  }
}

await prisma.$disconnect();
let file_tag = String(new Date().toUTCString());
file_tag = file_tag.replace(/\s/g, "_");
file_tag = file_tag.replace(/,/, "");
const path = process.cwd() + `/src/data/data_export.json`;
// mkdirSync(`/src/data/data_export_${file_tag}.json`);
writeFileSync(path, JSON.stringify(results));
// console.log("done");
