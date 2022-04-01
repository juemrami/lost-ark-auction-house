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
export async function _captureImage(x, y, width, height, ID) {
  const channels = 4;
  const {
    image,
    width: cWidth,
    height: cHeight,
    bytesPerPixel,
    byteWidth,
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
  return await sharpImg.toBuffer();
}

export function captureImage(x, y, width, height, ID) {
  const raw_img = robot.screen.capture(x, y, width, height);
  //const _width = (raw_img.byteWidth) / raw_img.bytesPerPixel; // raw_img.width is sometimes wrong!
  //const _height = raw_img.height;
  const j_img = new Jimp(width, height);

  const image = new Jimp(width, height);

  let red, green, blue;
  let LIMIT = 100;
  raw_img.image.forEach((byte, i) => {
    switch (i % 4) {
      case 0:
        return (blue = byte);
      case 1:
        return (green = byte);
      case 2:
        return (red = byte);
      case 3:
        if (red >= LIMIT || green >= LIMIT || blue >= LIMIT) {
          image.bitmap.data[i - 3] = 255;
          image.bitmap.data[i - 2] = 255;
          image.bitmap.data[i - 1] = 255;
        } else {
          image.bitmap.data[i - 3] = 0;
          image.bitmap.data[i - 2] = 0;
          image.bitmap.data[i - 1] = 0;
        }
        image.bitmap.data[i] = 255;
    }
  });
  if (ID) {
    image.writeAsync(`.image_dump/DEBUG-${ID}.png`);
  }
  return image.getBufferAsync(Jimp.MIME_PNG);
}

export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
