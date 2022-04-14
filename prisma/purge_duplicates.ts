import Prisma from "@prisma/client";
import { readFileSync, writeFileSync } from "fs";
import { price_data, market_item } from "@prisma/client";
import { tree } from "d3";
import { Decimal } from "@prisma/client/runtime";

const prisma = new Prisma.PrismaClient();
await prisma.$connect();
const clean_db = async () => {
  console.log("cleaning duplicates...");
  let dup_count = 0;
  let delete_count = 0;
  const data = await prisma.price_data.findMany({
    select: {
      date_time: true,
      recent_price: true,
      item_name: true,
    },
  });
  for (const { date_time, item_name, recent_price } of data) {
    let res = await prisma.price_data.findMany({
      where: {
        AND: {
          date_time: {
            equals: date_time,
          },
          item_name: {
            equals: item_name,
          },
        },
      },
    });
    if (res.length > 1) {
      dup_count++;
      console.log("duplicates found", [...res]);
      console.log("deleting last copy found");
      delete_count++;
      await prisma.price_data.delete({
        where: {
          data_id: res[1].data_id,
        },
      });
    }
  }
  console.log(dup_count, "total duplicates");
  console.log(delete_count, "total deleted");
};

const clean_decimal_data = async () => {
  console.log("cleaning bad decimals...");

  let mod_count = 0;
  const data = await prisma.price_data.findMany({
    where: {
      OR: [
        {
          item_name: {
            equals: "Guardian Stone Crystal",
          },
        },
        {
          item_name: {
            equals: "Destruction Stone Crystal",
          },
        },
      ],
    },
    select: {
      data_id: true,
      avg_day_price: true,
      recent_price: true,
      lowest_price: true,
    },
  });
  for (const { data_id, avg_day_price, recent_price, lowest_price } of data) {
    if (/\./.test(String(recent_price))) {
      mod_count++;
      await prisma.price_data.update({
        where: {
          data_id: data_id,
        },
        data: {
          avg_day_price: Number(avg_day_price) * 10.0,
          recent_price: Number(recent_price) * 10.0,
          lowest_price: Number(lowest_price) * 10.0,
        },
      });
    }
  }
  console.log(mod_count, "total modded");
};
await clean_db();
// await clean_decimal_data();
await prisma.$disconnect();

console.log("done");
