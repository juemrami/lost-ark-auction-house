// import * as robot from "robotjs";
import robot from "robotjs";
import { writeFileSync, readFileSync } from "fs";
import Tesseract, { createWorker, createScheduler } from "tesseract.js";
import clipboard from "clipboardy";
import sharp, { Sharp } from "sharp";
import OcrTaskScheduler from "./OcrTaskScheduler.js";
// import * as _sharpjs from "sharp";
export interface MarketResultRow {
  RECENT_PRICE: ScreenShotRegion;
  LOWEST_PRICE: ScreenShotRegion;
  CHEAPEST_REM: ScreenShotRegion;
  AVG_DAILY_PRICE: ScreenShotRegion;
  ITEM_NAME?: ScreenShotRegion;
}
export interface ScreenShotRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}
export const wait = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};
const {
  moveMouse,
  mouseClick,
  keyTap,
  getPixelColor,
  moveMouseSmooth,
  screen,
} = robot;
const SEARCH_BOX = { x: 1551, y: 243 };
const LOADING_BOX = { x: 1060, y: 447, color: "111215" };
export const SEARCH_RESULT_BOX = {
  LOC: {
    // pixel
    x: 520,
    y: 304,
    // length
    width: 1633 - 520,
    height: 360 - 304,
  },
  // coordinates relative to the search result box canvas
  // (see dimensions above)
  RECENT_PRICE: {
    x: 610,
    y: 18,
    width: 69,
    height: 20,
  },
  LOWEST_PRICE: {
    x: 770,
    y: 18,
    width: 69,
    height: 20,
  },
  CHEAPEST_REM: {
    x: 1030,
    y: 18,
    width: 69,
    height: 20,
  },
  AVG_DAILY_PRICE: {
    x: 452,
    y: 18,
    width: 69,
    height: 20,
  },
  // BUNDLE_SIZE: {
  //   x: 90,
  //   y: 28,
  //   width: 190,
  //   height: 20,
  // },
  // ITEM_NAME: {
  //   x: 90,
  //   y: 6,
  //   width: 200,
  //   height: 20,
  // },
};
const NAME_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz() ";
const NUM_CHARS = "0123456789.";
const results: any = {};
const ocr = await OcrTaskScheduler.initialize([
  { threads: 2, lang: "digits_comma" },
  { threads: 1, lang: "eng" },
]);
export const main = async () => {
  let items = [
    "Guardian Stone Crystal",
    "Destruction Stone Crystal",
    "Honor Leapstone",
    "Honor Shard Pouch (S)",
    "Great Honor Leapstone",
    "Solar Grace",
    "Solar Blessing",
    "Solar Protection",
    "Life Shard Pouch (S)",
  ];

  console.log("Starting auction house scrape..");
  console.log("you have 2 seconds to focus your Lost Ark game window.");
  await wait(2000);
  console.log("...commencing. dont touch mouse!");
  
  while (items.length > 0) {
    for (const item_name of items) {
      await searchMarket(item_name);
      const item_image: any = await captureImage(
        SEARCH_RESULT_BOX.LOC
        // item_name // uncomment for image saving
      );
      results[item_name] = extractPrices(item_image, SEARCH_RESULT_BOX);
    }
    for (const item_name of items) {
      results[item_name] = await results[item_name];
      if (results[item_name]) {
        items = items.filter((x) => x != item_name);
      }
    }
    if (items.length > 0) {
      console.log("items missing ", items, "refetching...");
    }
  }

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
  process.exit();
};

async function extractPrices(image_buffer: Buffer, region?: MarketResultRow) {
  const getRecent = ocr.parseImage(
    image_buffer,
    "digits_comma",
    region.RECENT_PRICE
  );
  const getLowest = ocr.parseImage(
    image_buffer,
    "digits_comma",
    region.LOWEST_PRICE
  );
  let getName = undefined;
  if (region.ITEM_NAME) {
    getName = ocr.parseImage(image_buffer, "eng", region.ITEM_NAME);
  }
  const getAvg = ocr.parseImage(
    image_buffer,
    "digits_comma",
    region.AVG_DAILY_PRICE
  );
  const getCheapestRem = ocr.parseImage(
    image_buffer,
    "digits_comma",
    region.CHEAPEST_REM
  );
  let recent = await getRecent;
  let lowest = await getLowest;
  let avg_daily = await getAvg;
  let cheapest_rem = await getCheapestRem;
  let item_name = await getName;
  console.log(item_name);
  console.log(recent, lowest, cheapest_rem);
  if (
    recent.length == 0 ||
    lowest.length == 0 ||
    recent === undefined ||
    lowest === undefined
  ) {
    return undefined;
  }
  let time = Date();
  let bundle_size = null;
  let lowest_price = Number(lowest);
  let recent_price = Number(recent);
  avg_daily = Number(avg_daily);
  cheapest_rem = Number(cheapest_rem);
  return {
    item_name: item_name,
    price: recent_price,
    lowPrice: lowest_price,
    unitSize: bundle_size,
    time,
    avg_daily,
    cheapest_rem,
  };
}
async function searchMarket(item_name: string) {
  await clipboard.write(item_name);
  await wait(250);
  // To search bar and search
  moveMouseSmooth(SEARCH_BOX.x, SEARCH_BOX.y);
  mouseClick();
  await wait(40);
  mouseClick();

  // paste the search term
  moveMouseSmooth(SEARCH_BOX.x - 50, SEARCH_BOX.y);
  mouseClick();
  mouseClick();
  keyTap("v", "control");
  await wait(10);
  // start searching
  keyTap("enter");

  // Wait for search results
  await wait(500);

  if (getPixelColor(999, 785) == "cccc01") {
    console.log("yellow");
  }
  // after 500ms check to see if search is finished
  while (getPixelColor(LOADING_BOX.x, LOADING_BOX.y) === LOADING_BOX.color) {
    //if not wait an extra .25 sec
    await wait(250);
  }
  return;
}
export async function captureImage(
  dim: { x: number; y: number; width: number; height: number },
  filename?: string,
  raw?: boolean
) {
  const channels = 4;
  const {
    image,
    width: cWidth,
    height: cHeight,
  } = screen.capture(dim.x, dim.y, dim.width, dim.height);
  let img_buffer = sharp(Buffer.from(image), {
    raw: {
      width: cWidth,
      height: cHeight,
      channels,
    },
  })
    .recomb([
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
    ])
    .flatten()
    .negate({ alpha: false })
    .toColorspace("b-w")
    .threshold(198)
    .resize({ kernel: "lanczos3" })
    .withMetadata({ density: 150 });

  if (filename) {
    await img_buffer.png().toFile(`./temp/image_dump/${filename}.png`);
  }
  if (raw) {
    // console.log(await img_buffer.raw().metadata());
    return await img_buffer.raw().toBuffer();
  }
  console.log("screenshot done");
  return await img_buffer.png().toBuffer();
}
