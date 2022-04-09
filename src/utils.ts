import { wait } from "./helpers.js";
import robot from "robotjs";
import { range } from "d3-array";
import { writeFileSync } from "fs";
import * as log from "why-is-node-running";
const {
  moveMouse,
  mouseClick,
  keyTap,
  getPixelColor,
  moveMouseSmooth,
  screen,
} = robot;
import sharp from "sharp";
import { createWorker, createScheduler } from "tesseract.js";

import clipboard from "clipboardy";
const SEARCH_BOX = { x: 1551, y: 243 };
const LOADING_BOX = { x: 1060, y: 447, color: "111215" };
const SEARCH_RESULT_BOX = {
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

// test();
main();

async function main() {
  //worker required setup
  //https://github.com/naptha/tesseract.js/blob/master/docs/api.md#create-worker

  const items = [
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
  for (const item_name of items) {
    await searchMarket(item_name);
    const item_image = await captureImage(
      SEARCH_RESULT_BOX.LOC,
      String(item_name)
    );
    const temp = item_image;
    results[item_name] = extractPrices(temp);
  }
  console.log("out of loop");
  console.log(results);
  for (const item_name of items) {
    results[item_name] = await results[item_name];
    while (!results[item_name]) {
      console.log("price missing for ", item_name, "...refetching.");
      await searchMarket(item_name);
      results[item_name] = await extractPrices(
        await captureImage(SEARCH_RESULT_BOX.LOC, String(item_name))
      );
    }
  }
  console.log("done await");
  console.log(results);
  writeFileSync(
    process.cwd() + "\\src\\data\\prices2.json",
    JSON.stringify(results)
  );
  process.exit();
}
//needs new arg to support box region
async function parseImage(image_buffer, worker, lang, dim?: any) {
  // crop and zoom and flatten
  const sharp_img = sharp(image_buffer)
    .extract({ left: dim.x, top: dim.y, width: dim.width, height: dim.height })
    .png()
    .toFile(`./temp/image_dump/testcrop${dim.x}.png`);
  await sharp_img;
  // just pass location

  await worker.initialize(lang);
  // if (false)
  //   await tess_worker.setParameters({
  //     tessedit_char_whitelist: whitelist,
  //   });
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
  console.log(`ocr results: ${text.trim()}`);
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
  const ocr_scheduler = createScheduler();
  const workers = [];
  for (const i in range(3)) {
    workers.push(createWorker());
  }
  for (let worker of workers) {
    await worker.load();
    await worker.loadLanguage("eng+digits_comma");
    // await ocr_worker.initialize("eng+digits_comma");
    // ocr_scheduler.addWorker(ocr_worker);
  }
  // const data = await ocr_scheduler.addJob("recognize", image_buffer, {
  //   rectangle: {
  //     left: SEARCH_RESULT_BOX.RECENT_PRICE.x,
  //     top: SEARCH_RESULT_BOX.RECENT_PRICE.y,
  //     width: SEARCH_RESULT_BOX.RECENT_PRICE.width,
  //     height: SEARCH_RESULT_BOX.RECENT_PRICE.height,
  //   },
  // });
  // console.log(data);
  let getRecent = parseImage(
    image_buffer,
    workers[0],
    "digits_comma",
    SEARCH_RESULT_BOX.RECENT_PRICE
  );
  const getLowest = parseImage(
    image_buffer,
    workers[1],
    "digits_comma",
    SEARCH_RESULT_BOX.LOWEST_PRICE
  );

  let recent = await getRecent;
  let lowest = await getLowest;
  console.log(recent, lowest);
  if (recent.length == 0 || lowest.length == 0) {
    return undefined;
  }
  let time = Date();
  const bundle = await parseImage(
    image_buffer,
    workers[2],
    "eng",
    SEARCH_RESULT_BOX.BUNDLE_SIZE
  );
  ocr_scheduler.terminate();
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
  moveMouseSmooth(SEARCH_BOX.x, SEARCH_BOX.y);
  mouseClick();
  // paste the search term
  moveMouseSmooth(SEARCH_BOX.x - 50, SEARCH_BOX.y);
  mouseClick();
  keyTap("v", "control");
  // start searching
  keyTap("enter");
  // Wait for search results
  await wait(500);

  if (getPixelColor(999, 785) == "cccc01") {
    console.log("yellow");
    // getPriceData(item_name);
  }
  // after 500ms check to see if search is finished
  while (getPixelColor(LOADING_BOX.x, LOADING_BOX.y) === LOADING_BOX.color) {
    //if not wait an extra .25 sec
    await wait(250);
  }
  return;
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
    .withMetadata({ density: 150 })
    .png();

  if (filename) {
    img_buffer.toFile(`./temp/image_dump/${filename}.png`);
  }
  let temp = await img_buffer.toBuffer();
  // return image before resizing,
  // sharpImg
  // .toFile(`./src/image_dump/${filename}.png`);
  // .resize(dim.width * 4, dim.height * 4, { kernel: "mitchell" })
  // .threshold(184)
  return temp;
}
