import fs from "fs";
import Jimp from "jimp";
import robot from "robotjs";
import sharp from "sharp";

export const PRICE_CONFIG = process.cwd() + "\\src\\data\\prices.json";
export const RECIPES_PATH = process.cwd() + "\\src\\data\\recipes.json";

export async function _captureImage(x, y, width, height, ID) {
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
    .toFile(`.image_dump/${ID}.png`);
  return sharpImg;
}
export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
