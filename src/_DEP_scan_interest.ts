import sharp, { Region } from "sharp";
import { OutputInfo } from "sharp";
import {
  wait,
  captureImage,
  SEARCH_RESULT_BOX,
  extractPrices,
} from "./utils.js";
import { readFileSync, writeFileSync } from "fs";
import clipboard from "clipboardy";
import robot from "robotjs";
const {
  moveMouse,
  mouseClick,
  keyTap,
  getPixelColor,
  moveMouseSmooth,
  screen,
} = robot;
interface sharpObj {
  data: Buffer;
  info: OutputInfo;
}
const NEXT_PAGE_INDICATOR = "64859a";
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
  console.log("focus your Lost Ark window within 2 seconds...");
  await wait(2000);
  console.log("...taking sceenshot!");
  const entries = [];
  // take SS 1
  // check for 2 pages ...
  //    if 2nd page{
  //      take SS 2
  //    }
  //  count num of item in both pages.
  //  use extract with a rectangle based on count
  //   and supply an offset
  //
  //
  //
  // whole page of items
  // 1350 x 569
  const img = await captureImage(INTEREST_PAGE.dim, "dbg_interest", true);
  const count = interest_list_size(img);

  if (count === 0) {
    console.log("interest list empty or not on screen\n exiting...");
    process.exit();
  }

  // if there is a 2nd page process it first
  if (getPixelColor(1027, 891) == NEXT_PAGE_INDICATOR) {
    console.log("moving to next page...");
    await grab_next_page();
    console.log("...taking sceenshot!");
    await wait(565);
    let page_2_img = await captureImage(INTEREST_PAGE.dim, undefined, true);
    let page_2_count = interest_list_size(page_2_img);
    console.log("you can move mouse now");
    for (let i = 0; i < page_2_count; i++) {
      const image = sharp(page_2_img, {
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
      entries.push(image);
    }
  }

  // for all items detected, extract the individual item image
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
    // await image.toFile(`coop_${i}.png`);
    entries.push(image);
  }
  const results = {};
  const data = [];
  for (const item_result_box of entries) {
    data.push(
      await extractPrices(await item_result_box.toBuffer(), INTEREST_PAGE)
    );
  }
  for (const scan_result of data) {
    let item_name = scan_result.item_name;
    if (item_name) {
      // delete scan_result.item_name;
      results[item_name] = scan_result;
    } else {
      console.log("missing item name for ", scan_result);
    }
  }
  // console.log(results);
  save_results(results);
  process.exit();
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

const interest_list_size = (img) => {
  let count = 0;
  let index = 0;
  do {
    index = INTEREST_PAGE.dim.width * (pin.y + count * gap) + pin.x;
    let test = img[index];
    // console.log(img.length, index);
    // console.log(test);
    if (test > 128 || test == undefined) {
      break;
    }
    count += 1;
  } while (count < 10);
  console.log("items: ", count);
  return count;
};
const grab_next_page = async () => {
  moveMouse(1027, 891);
  // await wait(20);
  mouseClick();
};
function split_results_image(image) {
  //first count the amount of results in the page
}
