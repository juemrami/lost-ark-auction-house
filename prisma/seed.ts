import Prisma from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { time } from "console";
import { readFileSync } from "fs";
import { price_data } from "@prisma/client";
type data = {
  item_name: price_data[];
};
const prisma = new Prisma.PrismaClient();
const exists_in_db = async (item_name, time) => {
  let res = await prisma.price_data.findFirst({
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
  });
  if (res) {
    return true;
  } else return false;
};

const data = readFileSync("./src/data/data_export.json", {
  encoding: "utf-8",
});
let item_list: data = JSON.parse(data);
// console.log(item_list);
await prisma.$connect();
for (const [item_name, price_history] of Object.entries(item_list)) {
  for (const {
    recent_price,
    lowest_price,
    date_time,
    avg_day_price,
    cheapest_rem,
  } of price_history) {
    if (await exists_in_db(item_name, date_time)) {
      console.log("data exists in db, not saving..");
      continue;
    }
    await prisma.price_data.create({
      data: {
        recent_price,
        lowest_price,
        date_time,
        avg_day_price,
        cheapest_rem,
        item: {
          connectOrCreate: {
            where: {
              name: item_name,
            },
            create: {
              name: String(item_name),
              bundle_size: 1,
            },
          },
        },
      },
      include: {
        item: true,
      },
    });
  }
}
await prisma.$disconnect();
console.log("done");
