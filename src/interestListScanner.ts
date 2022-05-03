import sharp, { Region } from "sharp";
import { ScreenShotRegion, MarketResultRow } from "./utils.js";
import { wait, captureImage } from "./utils.js";
import { cp, readFileSync, writeFileSync } from "fs";
import clipboard from "clipboardy";
import robot from "robotjs";
import * as d3 from "d3-color";
import OcrTaskScheduler from "./OcrTaskScheduler.js";
const { moveMouse, mouseClick, getPixelColor, moveMouseSmooth, getMousePos } =
  robot;
const ITEM_GAP_DISTANCE = 57;
const PINNED_ITEM_LOGO = { x: 18, y: 28 };
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
const _ocr = OcrTaskScheduler.initialize([
  { threads: 2, lang: "digits_comma" },
  { threads: 1, lang: "eng" },
]);
let ocr: any;
export const scanInterestList = async () => {
  console.log("'Interest List' scrape starting...");
  console.log("focus your Lost Ark window within 2 seconds...");
  await wait(2000);
  console.log("Starting now.");
  ocr = await _ocr;
  // 1350 x 569
  let items_at_page: number[] = [];
  const pages: Buffer[] = [];

  console.log("Refreshing page...");
  await refresh_list();
  let current_time = Date();
  let start = new Date();
  do {
    if (items_at_page[0]) {
      console.log("moving to next page...");
      await grab_next_page();
    }
    console.log("...Taking screenshot!");
    const screenshot = await captureImage(
      INTEREST_PAGE.dim,
      "dbg_interest",

      true
    );
    pages.push(screenshot);
    items_at_page.push(interest_list_size(screenshot));
  } while (next_page_available());
  console.log("Starting image parsing...\nYou can move mouse now");

  if (items_at_page.length === 0) {
    console.log("nothing scanned exiting");
    process.exit();
  }

  let data = [];
  const results = {};
  for (const [count, page_image] of zip(items_at_page, pages)) {
    if (count === 0) {
      console.log("page empty or not on screen\n exiting...");
    }
    // convert to png with metadata
    const png_buffer = await sharp(page_image, {
      raw: { width: 1350, height: 569, channels: 1 },
    })
      .png()
      .withMetadata({ density: 150 })
      .toBuffer();

    // for all items detected, extract the individual item image
    for (let item_row = 0; item_row < count; item_row++) {
      data.push(extractPrices(png_buffer, calculate_regions(item_row)));
    }
  }
  data = await Promise.all(data);
  let stop = new Date();
  // console.log(data);

  for (const scan_result of data) {
    let item_name = scan_result.item_name;
    scan_result.time = current_time;
    if (item_name) {
      results[item_name] = scan_result;
    } else {
      console.log("missing item name for ", scan_result);
    }
  }
  console.log(results);
  console.log(
    "Scans done in ",
    (stop.getTime() - start.getTime()) / 1000 + "s"
  );

  save_results(results);
  // process.exit();
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
const zip = (a, b) => a.map((k, i) => [k, b[i]]);
const calculate_regions = (offset_index: number) => {
  const res: MarketResultRow = {
    AVG_DAILY_PRICE: {
      x: 688,
      y: 18 + offset_index * ITEM_GAP_DISTANCE,
      width: 69,
      height: 20,
    },
    RECENT_PRICE: {
      x: 850,
      y: 18 + offset_index * ITEM_GAP_DISTANCE,
      width: 69,
      height: 20,
    },
    LOWEST_PRICE: {
      x: 1012,
      y: 18 + offset_index * ITEM_GAP_DISTANCE,
      width: 69,
      height: 20,
    },
    CHEAPEST_REM: {
      x: 1266,
      y: 18 + offset_index * ITEM_GAP_DISTANCE,
      width: 69,
      height: 20,
    },
    ITEM_NAME: {
      x: 90,
      y: 6 + offset_index * ITEM_GAP_DISTANCE,
      width: 200,
      height: 28,
    },
  };
  return res;
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
const next_page_available = () => {
  const clickable_arrow_color = "59738b";
  const color_difference_threshold = 20;
  const similarity_score = (hex_color_1, hex_color_2) => {
    const c1 = d3.hsl("#" + hex_color_1);
    const c2 = d3.hsl("#" + hex_color_2);
    // console.log(c1, c2);

    // compare color hue values
    let res = Math.abs(c1.h - c2.h);
    // console.log(res);
    return res;
  };
  if (getMousePos() == { x: 1027, y: 891 }) {
    moveMouse(1027, 300);
  }
  console.log(getPixelColor(1027, 891), clickable_arrow_color);

  const res =
    similarity_score(getPixelColor(1027, 891), clickable_arrow_color) <=
    color_difference_threshold;
  res ?? console.log("additional page detected.");
  return res;
};
const interest_list_size = (img) => {
  let count = 0;
  let index = 0;
  do {
    index =
      INTEREST_PAGE.dim.width *
        (PINNED_ITEM_LOGO.y + count * ITEM_GAP_DISTANCE) +
      PINNED_ITEM_LOGO.x;
    let test_pixel = img[index];
    if (test_pixel > 128 || test_pixel == undefined) {
      break;
    }
    count += 1;
  } while (count < 10);
  console.log("items on page: ", count);
  return count;
};
const grab_next_page = async () => {
  moveMouse(1027, 891);
  await wait(20);
  mouseClick();
  await wait(1000);
  moveMouse(1027, 200);

  return;
};
const refresh_list = async () => {
  moveMouse(460, 925);
  // await wait(20);
  mouseClick();
  mouseClick();
  await wait(500);
  return;
};
