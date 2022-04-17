import sharp, { Region } from "sharp";
import { OutputInfo } from "sharp";
import { price_data } from "@prisma/client";
import {
  wait,
  captureImage,
  SEARCH_RESULT_BOX,
  extractPrices,
} from "./utils.js";
import { readFileSync, writeFileSync } from "fs";
import clipboard from "clipboardy";

interface sharpObj {
  data: Buffer;
  info: OutputInfo;
}
const gap = 57;
const pin = { x: 18, y: 28 };
const INTEREST_PAGE = {
  dim: {
    x: 283,
    y: 264,
    width: 1633 - 283,
    height: 833 - 264,
  },
  AVG_DAILY_PRICE: {
    x: 688,
    y: 18,
    width: 69,
    height: 20,
  },
  RECENT_PRICE: {
    x: 850,
    y: 18,
    width: 69,
    height: 20,
  },
  LOWEST_PRICE: {
    x: 1012,
    y: 18,
    width: 69,
    height: 20,
  },
  CHEAPEST_REM: {
    x: 1266,
    y: 18,
    width: 69,
    height: 20,
  },
  ITEM_NAME: {
    x: 90,
    y: 6,
    width: 200,
    height: 28,
  },
};
export const test = async () => {
  console.log("interest list scrape starting...");
  console.log("focus your Lost Ark window...");
  await wait(2000);
  console.log("...commencing. dont touch mouse!");

  // whole page of items
  // 1350 x 569
  let img = await captureImage(INTEREST_PAGE.dim, "dbg_interest", true);
  let count = count_results(img);

  // rectangle for a single item
  const entries = [];
  for (let i = 0; i < count; i++) {
    const image = sharp(img, {
      raw: { width: 1350, height: 569, channels: 1 },
    })
      .extract({
        top: 0 + i * gap,
        left: 0,
        height: SEARCH_RESULT_BOX.LOC.height,
        width: INTEREST_PAGE.dim.width,
      })
      .png()
      .withMetadata({ density: 150 });
    await image.toFile(`coop_${i}.png`);
    entries.push(image);
  }
  // const item_result_box = sharp(img, {
  //   raw: { width: 1350, height: 569, channels: 1 },
  // })
  //   .extract({
  //     top: 0,
  //     left: 0,
  //     height: SEARCH_RESULT_BOX.LOC.height,
  //     width: INTEREST_PAGE.dim.width,
  //   })
  //   .png()
  //   .withMetadata({ density: 150 });
  // await item_result_box.toFile("coop.png");
  const results = {};
  const data = [];
  for (const item_result_box of entries) {
    data.push(extractPrices(await item_result_box.toBuffer(), INTEREST_PAGE));
  }
  for (const scan_result of data) {
    await scan_result;
    let item_name = scan_result.item_name;
    if (item_name) {
      results[item_name] = scan_result;
    } else {
      console.log("missing item name for ", scan_result);
    }
  }
  console.log(results);
};

const save_results = (results) => {
  let old: Object = JSON.parse(
    readFileSync(process.cwd() + "\\src\\data\\recent_scans.json", "utf-8")
  );
  [].push.call(old, results);
  let res = JSON.stringify(old);
  writeFileSync(process.cwd() + "\\src\\data\\recent_scans.json", res);
  writeFileSync(
    process.cwd() + "\\src\\data\\last_scan.json",
    JSON.stringify(results)
  );
  clipboard.writeSync(JSON.stringify(results));
  console.log("results copied to keyboard.");
  console.log("run `yarn transfer` to push to db");
};

const count_results = (img) => {
  let count = 0;
  let index = 0;
  do {
    index = INTEREST_PAGE.dim.width * (pin.y + count * gap) + pin.x;
    let test = img[index];
    console.log(img.length, index);
    console.log(test);
    if (test > 128 || test == undefined) {
      break;
    }
    count += 1;
  } while (count < 10);
  console.log("items: ", count);
  return count;
};
function split_results_image(image) {
  //first count the amount of results in the page
}
