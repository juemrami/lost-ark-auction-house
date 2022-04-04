import { wait } from "./helpers";
import robot from "robotjs";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

import clipboard from "clipboardy";
const SEARCH_RESULT_BOX = {
  LOC: {
    // pixel
    x: 520,
    y: 304,
    // length
    width: 1633 - 304,
    height: 520 - 360,
  },
  // coordinates relative to the search result box canvas
  // (see dimensions above)
  RECENT_PRICE: {
    x: 609,
    y: 18,
    width: 69,
    height: 20,
  },
  LOWEST_PRICE: {
    x: 769,
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
  BUNDLE_SIZE: {
    x: 90,
    y: 28,
    width: 190,
    height: 20,
  },
  ITEM_NAME: {
    x: 90,
    y: 6,
    width: 200,
    height: 20,
  },
};

const results: any = {};
main();
let ocr_worker = createWorker({
  // logger: (m) => console.log(m),
});

async function main() {
  //worker required setup
  //https://github.com/naptha/tesseract.js/blob/master/docs/api.md#create-worker
  await ocr_worker.load();
  await ocr_worker.loadLanguage("eng+digits_comma+equ");

  const items = ["Big Rock", "Little Rock", "Sharded Rock"];

  for (const item_name of items) {
    await searchMarket(item_name);
    const item_image = await captureImage(
      SEARCH_RESULT_BOX.LOC,
      String(item_name)
    );
    results[item_name] = extractPrices(item_image);
  }
  for await (const item of results) {}
  
  await ocr_worker.terminate();
  console.log(results);
}
async function parseImage(image_buffer: Buffer, lang) {

  await ocr_worker.initialize(lang);
  // if (false)
  //   await tess_worker.setParameters({
  //     tessedit_char_whitelist: whitelist,
  //   });
  let {
    data: { text },
  } = await ocr_worker.recognize(image_buffer);
  console.log(`ocr results: ${text}`);
  // console.log(text.replace(/\s/g, ""));
  // console.log(/\.\d{3,}/.test(text));
  if (/unit/.test(text)) {
    return text;
  } else if (/\.\d{3,}/.test(text)) {
    text = text.replace(/\./, "");
    return isNaN(Number(text)) ? "" : text.trim();
  } else {
    text = text.replace(/\s/g, "");
    return isNaN(Number(text)) ? "" : text;
  }
}
async function extractPrices(image_buffer: Buffer) {
  let recent = parseImage(image_buffer, "digits_comma");
  const lowest = parseImage(image_buffer, "digits_comma");
  if ((await recent).length == 0 || (await lowest).length == 0) {
    return {
      price: false,
      lowPrice: false,
      unitSize: 1,
      time: "",
    };
  }
  let time = Date();
  const bundle = await parseImage(image_buffer, "digits_comma");
  let unitSize = 1;
  let lowPrice = Number(lowest);
  let price = Number(recent);
  if (bundle.length > 0) {
    const bundle_text = bundle.split(" ");
    for (let i = 0; i < bundle_text.length; i++) {
      const word = bundle_text[i];
      if (word.toLowerCase().includes("units")) {
        unitSize = Number(bundle_text[i - 1].trim());
        lowPrice = lowPrice / unitSize;
        price = price / unitSize;
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
async function searchMarket(item_name: string) {
  await clipboard.write(item_name);
  await wait(250);
  // To search bar and search
  robot.moveMouse(this.SEARCH_POS.x, this.SEARCH_POS.y);
  robot.mouseClick();
  // paste the search term
  robot.moveMouse(this.SEARCH_POS.x - 50, this.SEARCH_POS.y);
  robot.mouseClick();
  robot.keyTap("v", "control");
  // start searching
  robot.keyTap("enter");

  // Wait for search results
  await wait(500);

  if (robot.getPixelColor(999, 785) == "cccc01") {
    console.log("yellow");
    // getPriceData(item_name);
  }

  // after 500ms check to see if search is finished
  while (
    robot.getPixelColor(this.LOADING_POS.x, this.LOADING_POS.y) ===
    this.LOADING_COLOR
  ) {
    //if not wait an extra .25 sec
    await wait(250);
  }
  return  
}
async function captureImage(
  dim: { x: number; y: number; width: number; height: number },
  filename?: string
) {
  const channels = 4;
  const {
    image,
    width: cWidth,
    height: cHeight,
  } = robot.screen.capture(dim.x, dim.y, dim.width, dim.height);
  const img_buffer = sharp(Buffer.from(image), {
    density: 72,
    raw: {
      width: cWidth,
      height: cHeight,
      channels,
    },
  }).recomb([
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
  ]).toBuffer();
  // return image before resizing,
  // sharpImg
  //   .flatten()
  //   .negate({ alpha: false })
  //   .toColorspace("b-w")
  //   .withMetadata({ density: 150 })
  //  .png();
  // .toFile(`./src/image_dump/${filename}.png`);
  // .resize(dim.width * 4, dim.height * 4, { kernel: "mitchell" })
  // .threshold(184)
  return await img_buffer;
}
