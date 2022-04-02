import fs from "fs";
import robot from "robotjs";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

export const PRICE_CONFIG = process.cwd() + "\\src\\data\\prices.json";
export const RECIPES_PATH = process.cwd() + "\\src\\data\\recipes.json";
export async function main() {
  const recent_price_pos = { x: 1133, y: 322, w: 69, h: 20 };
  const BUNDLE_POS = { x: 615, y: 333 };
  const alt_img = "./src/image_dump/test_21.png";
  const img_path = "./src/image_dump/lpriceGuardianStoneCrystal.png";

  const img = await captureImage(
    recent_price_pos.x,
    recent_price_pos.y,
    recent_price_pos.w,
    recent_price_pos.h,
    `rprice${String("Destruction Stone Crystal").split(/\s/).join("")}`
  );
  const bundle_img = await captureImage(
    BUNDLE_POS.x,
    BUNDLE_POS.y,
    288,
    17,
    `bundle_${String("test Stone").split(/\s/).join("")}`
  );
  const char_set = "0123456789.";
  const alpha =
    " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz[]0123456789.";
  const lang = "digits_comma";
  parse_img(bundle_img, "eng", alpha);
  const data = parse_img(img, "digits_comma", char_set);
  console.log("returned ", await data);
}
export async function captureImage(x, y, width, height, filename) {
  const channels = 4;
  const {
    image,
    width: cWidth,
    height: cHeight,
  } = robot.screen.capture(x, y, width, height);
  const img_buffer = Buffer.from(image);
  const sharpImg = sharp(img_buffer, {
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
  ]);
  await sharpImg
    .flatten()
    .negate({ alpha: false })
    .toColorspace("b-w")
    .resize(width * 4, height * 4, { kernel: "mitchell" })
    .threshold(184)
    .withMetadata({ density: 150 })
    .png()
    .toFile(`./src/image_dump/${filename}.png`);
  return await sharpImg.toBuffer();
}

export async function parse_img(imageBuffer, lang, whitelist = null) {
  //spawn a worker and set up logging (for debugging)
  let tess_worker = createWorker({
    // logger: (m) => console.log(m),
  });

  //worker required setup
  //https://github.com/naptha/tesseract.js/blob/master/docs/api.md#create-worker
  await tess_worker.load();
  await tess_worker.loadLanguage("eng+digits_comma+equ");
  await tess_worker.initialize(lang);
  if (false)
    await tess_worker.setParameters({
      tessedit_char_whitelist: whitelist,
    });
  let {
    data: { text },
  } = await tess_worker.recognize(imageBuffer);
  await tess_worker.terminate();
  console.log(`ocr results: ${text}`);
  // console.log(text.replace(/\s/g, ""));
  // console.log(/\.\d{3,}/.test(text));
  if (/unit/.test(text)) {
    return text;
  } else if (/\.\d{3,}/.test(text)) {
    text = text.replace(/\./, "");
    return isNaN(text) ? false : text;
  } else {
    text = text.replace(/\s/g, "");
    return isNaN(text) ? false : text;
  }
}
export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
main();
