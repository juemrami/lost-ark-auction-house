import sharp, { Region } from "sharp";
import {
  wait,
  captureImage,
  SEARCH_RESULT_BOX,
  extractPrices,
} from "./utils.js";
const gap = 57;
const pin = { x: 300, y: 281 };
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
    height: 20,
  },
};
export const test = async () => {
  console.log("interest list scrape starting...");
  console.log("focus your Lost Ark window...");
  await wait(2000);
  console.log("...commencing. dont touch mouse!");

  const img = await captureImage(INTEREST_PAGE.dim, "dbg_interest");
  let index = INTEREST_PAGE.dim.width * pin.y + pin.x;
  console.log(img.length, index);

  console.log(img.buffer[index]);
  const sharpImg = await sharp(img)
    .extract({
      top: 0,
      left: 0,
      height: SEARCH_RESULT_BOX.LOC.height,
      width: INTEREST_PAGE.dim.width,
    })
    .png();
  sharpImg.toFile("coop.png");

  await sharp(img)
    .extract({
      top: 0 + gap,
      left: 0,
      height: SEARCH_RESULT_BOX.LOC.height,
      width: INTEREST_PAGE.dim.width,
    })
    .png()
    .toFile("coo2.png");

  const data = await extractPrices(await sharpImg.toBuffer(), INTEREST_PAGE);
  console.log(data);
};
