import robot from "robotjs";
import clipboard from "clipboardy";

import { createWorker } from "tesseract.js";
import { captureImage, _captureImage, wait } from "./helpers.js";

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
  constructor() {
    this._worker = createWorker({
      langPath: "./src/tessdata",
      gzip: false,
      logger: (m) => {
        console.log(m);
      },
    });
    this._worker.load();
    this._worker.loadLanguage("eng+digits_comma");
  }

  async start(interest_list) {
    let market_prices = {};
    let prices_missing = false;

    console.log("Prices\n----------------");
    for (const item_name of interest_list) {
      market_prices[item_name] = await this.getPrice(item_name);
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
        if (
          market_prices[item_name].price == false ||
          market_prices[item_name].price == NaN
        ) {
          do {
            console.log("price missing for ", item_name, "...refetching.");
            const item_data = await this.getPrice(item_name);
            market_prices[item_name] = item_data;
            console.log(item_name, ":", market_prices[item_name]);
          } while (market_prices[item_name].price == false);
        }
      }
    }
    return market_prices;
  }

  async ocr(x, y, width, height, charset, debug_name = false, lang) {
    // const ogBuffer = await captureImage(x, y, width, height, debug_name);
    const img = await _captureImage(x, y, width, height, debug_name);
    //console.log(ogBuffer, imgBuffer);
    await this._worker.initialize(String(lang));
    await this._worker.setParameters({
      tessedit_char_whitelist: charset,
    });
    const {
      data: { text },
    } = await this._worker.recognize(img);
    
    return isNaN(text) ? "" : text;
  }

  async getPrice(itemName) {
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
    await wait(300);
    while (
      robot.getPixelColor(this.LOADING_POS.x, this.LOADING_POS.y) ===
      this.LOADING_COLOR
    ) {
      await wait(250);
    }

    const priceText = await this.ocr(
      this.recent_price_pos.x,
      this.recent_price_pos.y,
      this.recent_price_pos.w,
      this.recent_price_pos.h,
      "0123456789.",
      `rprice${String(itemName).split(/\s/).join("")}`,
      "digits_comma"
    );
    const lowPriceText = await this.ocr(
      this.lowest_price_pos.x,
      this.lowest_price_pos.y,
      this.lowest_price_pos.w,
      this.lowest_price_pos.h,
      "0123456789.",
      `lprice${String(itemName).split(/\s/).join("")}`,
      "digits_comma"
    );
    let price = priceText.length > 0 ? Number(priceText.trim()) : false;
    let lowPrice =
      lowPriceText.length > 0 ? Number(lowPriceText.trim()) : false;
    let unitSize = 1;
    let time = Date();

    if (price) {
      // Adjust price if sold in bundles
      const bundleText = (
        await this.ocr(
          this.BUNDLE_POS.x,
          this.BUNDLE_POS.y,
          288,
          17,
          " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz[]0123456789.",
          "eng"
        )
      ).split(" ");
      for (let i = 0; i < bundleText.length; i++) {
        const word = bundleText[i];
        if (word.toLowerCase().includes("units")) {
          unitSize = Number(bundleText[i - 1].trim());
          price = price / unitSize;
          lowPrice = lowPrice / unitSize;
          break;
        }
      }
    }
    return {
      price,
      lowPrice,
      unitSize,
      time,
    };
  }
}
