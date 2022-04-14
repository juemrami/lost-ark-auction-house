import Prisma from "@prisma/client";
import { readFileSync, writeFileSync } from "fs";

const bad_data = {};
let add_count = 0;
let ignore_count = 0;
const prisma = new Prisma.PrismaClient();
const data = readFileSync(process.cwd() + "/src/data/recent_scans.json", {
  encoding: "utf-8",
});
let entry_list = JSON.parse(data);
// console.log(item_list);
await prisma.$connect();
for (const [index, price_data_entry] of Object.entries(entry_list)) {
  for (const [item_name, item_data] of Object.entries(price_data_entry)) {
    const { price, lowPrice, unitSize, time, avg_daily, cheapest_rem } =
      item_data;
    if (unitSize != 1 && unitSize != 10 && unitSize != null) {
      if (!bad_data[item_name]) {
        bad_data[item_name] = [];
      }
      console.log("bad data found. not saving..");
      console.log(item_data);
      bad_data[item_name].push(item_data);
      continue;
    }
    if (
      !(await prisma.price_data.findFirst({
        where: {
          AND: {
            item_name: {
              equals: String(item_name),
            },
          },
          date_time: {
            equals: new Date(time),
          },
        },
      }))
    ) {
      // console.log("data does not exist, saving...");
      // console.log(item_data);
      await prisma.price_data.create({
        data: {
          recent_price: price,
          date_time: new Date(time),
          avg_day_price: avg_daily,
          cheapest_rem: cheapest_rem,
          lowest_price: lowPrice,
          item: {
            connectOrCreate: {
              where: { name: item_name },
              create: { name: String(item_name) },
            },
          },
        },
        include: { item: true },
      });
      add_count++;
    } else {
      // console.log("data exists not saving...");
      ignore_count++;
    }
  }
}

await prisma.$disconnect();
writeFileSync(
  process.cwd() + "/src/data/bad_data.json",
  JSON.stringify(bad_data)
);
console.log("done");
console.log("Data Samples Saved: ", add_count);
console.log("Duplicate Samples Ignored: ", ignore_count);
