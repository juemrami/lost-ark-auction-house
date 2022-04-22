import sharp, { Region } from "sharp";
import { OutputInfo } from "sharp";
import { ScreenShotRegion, MarketResultRow } from "./utils.js";
import {
  wait,
  captureImage,
  SEARCH_RESULT_BOX,
  extractPrices,
} from "./utils.js";
import { cp, readFileSync, writeFileSync } from "fs";
import clipboard from "clipboardy";
import robot from "robotjs";
import * as d3 from "d3-color";
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
export const scanInterestList = async () => {
  console.log("'Interest List' scrape starting...");
  console.log("focus your Lost Ark window within 2 seconds...");
  await wait(2000);
  console.log("Starting now.");

  // 1350 x 569
  let counts: number[] = [];
  const pages: Buffer[] = [];
  let current_time = Date();
  console.log("Refreshing page...");
  await refresh_list();
  do {
    if (counts[0]) {
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
    counts.push(interest_list_size(screenshot));
  } while (next_page_available());
  console.log("Starting image parsing...\nYou can move mouse now");

  if (counts.length === 0) {
    console.log("nothing scanned exiting");
    process.exit();
  }

  const data = [];
  const results = {};
  for (const [count, page_image] of zip(counts, pages)) {
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
      data.push(await extractPrices(png_buffer, calculate_regions(item_row)));
    }
  }

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
  save_results(results);
  process.exit();
};
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
