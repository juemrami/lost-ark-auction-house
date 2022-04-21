// import * as robot from "robotjs";
import robot from "robotjs";
import { writeFileSync, readFileSync } from "fs";
import Tesseract, { createWorker, createScheduler } from "tesseract.js";
import clipboard from "clipboardy";
import sharp, { Sharp } from "sharp";
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
async function parseImage(image_buffer, worker, lang, dim?: any) {
  {
    // crop and zoom and flatten if needed for better resolution
    // const image_buffer = sharp(image_buffer)
    //   .extract({ left: dim.x, top: dim.y, width: dim.width, height: dim.height })
    //   .resize(dim.width * 4, dim.height * 4, { kernel: "mitchell" })
    //   .threshold(184)
    //   .png()
    //   .toFile(`./temp/image_dump/testcrop${dim.x}.png`);
    // await image_buffer.toBuffer();
  }
  // console.log("job started by ", worker.id);
  await worker.initialize(lang);
  if (lang === "eng") {
    await worker.setParameters({
      tessedit_char_whitelist: NAME_CHARS,
    });
  } else {
    await worker.setParameters({
      tessedit_char_whitelist: NUM_CHARS,
    });
  }
  let {
    data: { text },
  } = await worker.recognize(image_buffer, {
    rectangle: {
      left: dim.x,
      top: dim.y,
      width: dim.width,
      height: dim.height,
    },
  });
  // console.log(`\tJob done ${worker.id}`);
  // console.log(`-- ocr results: ${text.trim()}`);
  if (lang === "eng") {
    return text.trim();
  }
  if (/unit/.test(text)) {
    // check if is bundle size text
    return text;
  } else if (/\.\d{3,}/.test(text)) {
    // check if misinterpreted comma
    text = text.replace(/\./, "");
    return isNaN(Number(text)) ? "" : text.trim();
  } else {
    // strip space between numbers
    text = text.replace(/\s/g, "");
    return isNaN(Number(text)) ? "" : text;
  }
}

export async function extractPrices(
  image_buffer: Buffer,
  region?: MarketResultRow
) {
  const ocr_scheduler = createScheduler();
  const worker_pool = [];
  for (const i in Object.keys(region)) {
    // for (let i = 0; i++; i < 2) {
    // console.log("worker created", i);
    worker_pool.push(
      createWorker({
        // logger: (m) => console.log(m),
        // errorHandler: (e) => console.log(console.error()),
        cachePath: process.cwd() + "\\models\\",
        gzip: false,
      })
    );
  }
  for (const worker of worker_pool) {
    // console.log("loading worker...", worker.id);
    await worker.load();
    await worker.loadLanguage("digits_comma+eng");
  }
  // console.log("workers ready!");
  const getRecent = parseImage(
    image_buffer,
    worker_pool[0],
    "digits_comma",
    region.RECENT_PRICE
  );
  const getLowest = parseImage(
    image_buffer,
    worker_pool[1],
    "digits_comma",
    region.LOWEST_PRICE
  );
  let getName = undefined;
  if (region.ITEM_NAME) {
    getName = parseImage(image_buffer, worker_pool[2], "eng", region.ITEM_NAME);
  }
  const getAvg = parseImage(
    image_buffer,
    worker_pool[3],
    "digits_comma",
    region.AVG_DAILY_PRICE
  );
  const getCheapestRem = parseImage(
    image_buffer,
    worker_pool[4],
    "digits_comma",
    region.CHEAPEST_REM
  );
  let recent = await getRecent;
  let lowest = await getLowest;
  let avg_daily = await getAvg;
  let cheapest_rem = await getCheapestRem;
  let item_name = await getName;
  console.log(item_name);
  const killWorkers = ocr_scheduler.terminate();
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

  await killWorkers;
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
