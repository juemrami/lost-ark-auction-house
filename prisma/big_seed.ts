import Prisma from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { readFileSync } from "fs";

const prisma = new Prisma.PrismaClient();
type sheets_data = {
  recent_price: string;
  date_time: string;
};
type data_form = {
  item_name: sheets_data[];
};

const data = readFileSync("./prisma/data.json", { encoding: "utf-8" });
let item_list: data_form = JSON.parse(data);
// console.log(item_list);
await prisma.$connect();
for (const [item_name, historic_data] of Object.entries(item_list)) {
  for (const { recent_price, date_time } of historic_data) {
    await prisma.price_data.create({
      data: {
        recent_price,
        date_time,
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
}
await prisma.$disconnect();
console.log("done");
