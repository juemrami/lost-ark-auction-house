import fs from "fs";
import Jimp from "jimp";
import robot from "robotjs";
import sharp from "sharp";

export const PRICE_CONFIG = process.cwd() + "\\src\\data\\prices.json";
export const RECIPES_PATH = process.cwd() + "\\src\\data\\recipes.json";

export const recipes = fs.existsSync(RECIPES_PATH)
  ? JSON.parse(fs.readFileSync(RECIPES_PATH))
  : false;
export const prices = fs.existsSync(PRICE_CONFIG)
  ? JSON.parse(fs.readFileSync(PRICE_CONFIG))
  : false;

export function generatePriceConfig(data) {
  let out = {};
  Object.values(data).forEach((recipe) => {
    if (!out[recipe.name]) {
      out[recipe.name] = 0;
    }

    recipe.materials.forEach((mat) => {
      const name = data[mat.id];
      if (!name) {
        // console.log("Not found! :(", mat.id, recipe);
      }
      if (!out[name]) {
        out[name] = 0;
      }
    });
  });
  return out;
}
export async function _captureImage(x, y, width, height, filename) {
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
  sharpImg
    .flatten()
    .resize(width * 4, height * 4, { kernel: "lanczos3" })
    .withMetadata({ density: 150 })
    .png();
  if (filename) {
    await sharpImg.toFile(`.image_dump/${filename}.png`);
  }

  return await sharpImg.toBuffer();
}
export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
