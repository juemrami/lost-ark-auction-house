import fs from "fs";
import Jimp from "jimp";
import robot from "robotjs";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

export const PRICE_CONFIG = process.cwd() + "\\src\\data\\prices.json";
export const RECIPES_PATH = process.cwd() + "\\src\\data\\recipes.json";

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
    .resize(width * 4, height * 4, { kernel: "lanczos3" })
    .withMetadata({ density: 150 })
    .png()
    .toFile(`.image_dump/${filename}.png`);
  return sharpImg;
}
async function parse_img(imageBuffer, lang, whitelist = null) {
  //spawn a worker and set up logging (for debugging)
  let tess_worker = createWorker({
    logger: (m) => console.log(m),
  });

  //worker required setup
  //https://github.com/naptha/tesseract.js/blob/master/docs/api.md#create-worker
  await tess_worker.load();
  await tess_worker.loadLanguage("eng+digits");
  await tess_worker.initialize(lang);
  if (whitelist)
    await tess_worker.setParameters({
      tessedit_char_whitelist: whitelist,
    });
  const {
    data: { text },
  } = await tess_worker.recognize(imageBuffer);
  await tess_worker.terminate();
  return isNan(text) ? '' : text;
}
export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
