import Prisma from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { readFileSync } from "fs";

type _dataformat = {
  item_name: {
    price: Decimal;
    lowPrice: Decimal;
    unitSize: number;
    time: string;
    avg_daily: Decimal;
    cheapest_rem: number;
  };
};

const prisma = new Prisma.PrismaClient();
type sheets_data = {
  recent_price: string;
  date_time: string;
};
type data_form = _dataformat[];
// console.log(process.cwd());
const data = readFileSync(process.cwd() + "/src/data/_prices.json", {
  encoding: "utf-8",
});
let entry_list = JSON.parse(data);
// console.log(item_list);
await prisma.$connect();
for (const [index, price_data_entry] of Object.entries(entry_list)) {
  for (const [item_name, item_data] of Object.entries(price_data_entry)) {
    console.log(item_data);
    const { price, lowPrice, unitSize, time, avg_daily, cheapest_rem } =
      item_data;

    !(await prisma.price_data.findFirst({
      where: {
        AND: {
          item_name: {
            equals: String(item_name),
          },
        },
        date_time: {
          equals: time,
        },
      },
    }));
    {
      console.log("data does not exist, saving.");
      await prisma.price_data.create({
        data: {
          recent_price: price,
          date_time: time,
          avg_day_price: avg_daily,
          lowest_rem: cheapest_rem,
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
    }
    console.log("data exists not saving.");
  }
}

await prisma.$disconnect();
console.log("done");
