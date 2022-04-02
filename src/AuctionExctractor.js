import robot from "robotjs";
import clipboard from "clipboardy";

import { createWorker } from "tesseract.js";
import { captureImage, wait } from "./helpers.js";
import { parse_img } from "./test.js";

export default class AuctionExtractor {
  SEARCH_POS = { x: 1551, y: 243 };
  LOADING_POS = { x: 1060, y: 447 };
  PRICE_POS = { x: 1082, y: 312 };
  BUNDLE_POS = { x: 615, y: 333 };
  recent_price_pos = { x: 1133, y: 322, w: 69, h: 20 };
  lowest_price_pos = {
    x: 1293,
    y: 322,
    h: 20,
    w: 69,
  };

  LOADING_COLOR = "101114";

  _worker;
  //spawn a worker and set up logging (for debugging)
  constructor() {
    this._worker = createWorker({
      // logger: m => console.log(m),
    });
    this._worker.load();
    this._worker.loadLanguage("eng+digits_comma");
  }

  async start(interest_list) {
    let market_prices = {};
    let prices_missing = false;
    console.log("Prices\n----------------");
    for (const item_name of interest_list) {
      market_prices[item_name] = await this.get_price_data(item_name);
      if (
        market_prices[item_name].price == false ||
        market_prices[item_name].price == NaN
      ) {
        prices_missing = true;
      }
      console.log(item_name, ":", market_prices[item_name]);
    }

    if (prices_missing) {
      for (const item_name of interest_list) {
        if (market_prices[item_name].price == false) {
          do {
            console.log("price missing for ", item_name, "...refetching.");
            const item_data = await this.get_price_data(item_name);
            market_prices[item_name] = item_data;
            console.log(item_name, ":", market_prices[item_name]);
          } while (market_prices[item_name].price == false);
        }
      }
    }
    return market_prices;
  }

  // async parse_img(imageBuffer, lang, whitelist = null) {
  //   //worker required setup
  //   //https://github.com/naptha/tesseract.js/blob/master/docs/api.md#create-worker
  //   await this._worker.initialize(lang);
  //   if (whitelist)
  //     await this._worker.setParameters({
  //       tessedit_char_whitelist: whitelist,
  //     });
  //   const {
  //     data: { text },
  //   } = await this._worker.recognize(imageBuffer);
  //   await this._worker.terminate();
  //   console.log(`ocr results: ${text}`);
  //   return isNaN(text) ? "" : text;
  // }
  async get_price_data(itemName) {
    await clipboard.write(itemName);
    await wait(250);
    // To search bar and search
    robot.moveMouseSmooth(this.SEARCH_POS.x, this.SEARCH_POS.y);
    robot.mouseClick();

    robot.moveMouseSmooth(this.SEARCH_POS.x - 50, this.SEARCH_POS.y);
    robot.mouseClick();
    robot.keyTap("v", "control");

    robot.keyTap("enter");

    // Wait for search results
    await wait(1000);
    while (
      robot.getPixelColor(this.LOADING_POS.x, this.LOADING_POS.y) ===
      this.LOADING_COLOR
    ) {
      await wait(250);
    }
    const price_img = await captureImage(
      this.recent_price_pos.x,
      this.recent_price_pos.y,
      this.recent_price_pos.w,
      this.recent_price_pos.h,
      `recent_price_${String(itemName).split(/\s/).join("")}`
    );
    const low_price_img = await captureImage(
      this.lowest_price_pos.x,
      this.lowest_price_pos.y,
      this.lowest_price_pos.w,
      this.lowest_price_pos.h,
      `lowest_price_${String(itemName).split(/\s/).join("")}`
    );
    let recent_price = await parse_img(price_img, "digits_comma");
    let lowest_price = await parse_img(low_price_img, "digits_comma");
    let price = Number(recent_price.trim()) || false;
    let lowPrice = Number(lowest_price.trim()) || false;
    let unitSize = 1;
    let time = Date();

    // if (price) {
    //   // Adjust price if sold in bundles
    //   const bundle_text = (
    //     await this.parse_img(
    //       await captureImage(
    //         this.BUNDLE_POS.x,
    //         this.BUNDLE_POS.y,
    //         288,
    //         17,
    //         `bundle_${String(itemName).split(/\s/).join("")}`
    //       ),
    //       "eng",
    //       " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz[]0123456789."
    //     )
    //   ).split(" ");
    //   for (let i = 0; i < bundle_text_img.length; i++) {
    //     const word = bundle_text_img[i];
    //     if (word.toLowerCase().includes("units")) {
    //       unitSize = Number(bundle_text_img[i - 1].trim());
    //       price = price / unitSize;
    //       lowPrice = lowPrice / unitSize;
    //       break;
    //     }
    //   }
    // }
    return {
      price,
      lowPrice,
      unitSize,
      time,
    };
  }
}
