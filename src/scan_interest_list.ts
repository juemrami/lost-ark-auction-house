import sharp, { Region } from "sharp";
import {
  wait,
  captureImage,
  SEARCH_RESULT_BOX,
  extractPrices,
} from "./utils.js";

const INTEREST_PAGE = {
  dim: {
    x: 283,
    y: 264,
    width: 1633 - 283,
    height: 833 - 264,
  },
};
export const test = async () => {
  console.log("interest list scrape starting...");
  console.log("you have 2 seconds to focus your Lost Ark game window.");
  await wait(2000);
  console.log("...commencing. dont touch mouse!");

  const img = await captureImage(INTEREST_PAGE.dim, "dbg_interest");

  const sharpImg = await sharp(img)
    .extract({
      top: 0,
      left: 0,
      height: SEARCH_RESULT_BOX.LOC.height,
      width: 1349,
    })
    .png();
  sharpImg.toFile("coop.png");

  const data = await extractPrices(await sharpImg.toBuffer());
  console.log(data);
};
