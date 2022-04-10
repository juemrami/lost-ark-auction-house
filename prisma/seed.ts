import Prisma from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { readFileSync } from "fs";

const prisma = new Prisma.PrismaClient();
type data_form = {
  item_name: {
    price: Decimal;
    lowPrice: Decimal;
    unitSize: number;
    time: string;
  };
};

const data = readFileSync("./src/data/prices2.json", { encoding: "utf-8" });
let item_list: data_form = JSON.parse(data);
console.log(item_list);
await prisma.$connect();
for (const [item_name, item] of Object.entries(item_list)) {
  await prisma.price_data.create({
    data: {
      recent_price: item.price,
      lowest_price: item.lowPrice,
      date_time: new Date(item.time),
      item: {
        connectOrCreate: {
          where: {
            name: item_name,
          },
          create: {
            name: String(item_name),
            bundle_size: item.unitSize,
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
