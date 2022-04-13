import Prisma from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { time } from "console";
import { readFileSync } from "fs";

const prisma = new Prisma.PrismaClient();
type data_form = {
  item_name: {
    price: Decimal;
    lowPrice: Decimal;
    unitSize: number;
    time: string;
    avg_daily: Decimal;
    cheapest_rem: number;
  };
};
const exists_in_db = async (item_name, time) => {
  if (
    await prisma.price_data.findFirst({
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
    })
  ) {
    return true;
  } else return false;
};

const data = readFileSync("./src/data/last_scan.json", { encoding: "utf-8" });
let item_list: data_form = JSON.parse(data);
console.log(item_list);
await prisma.$connect();
for (const [item_name, item] of Object.entries(item_list)) {
  if (exists_in_db(item_name, item.time)) {
    console.log("data exists in db, not saving..");
    continue;
  }
  await prisma.price_data.create({
    data: {
      recent_price: Number(item.price),
      lowest_price: Number(item.lowPrice),
      date_time: new Date(item.time),
      avg_day_price: Number(item.avg_daily),
      lowest_rem: item.cheapest_rem,
      item: {
        connectOrCreate: {
          where: {
            name: item_name,
          },
          create: {
            name: String(item_name),
          },
        },
      },
    },
    include: {
      item: true,
    },
  });
}
await prisma.$disconnect();
console.log("done");
