import robot from "robotjs";
import sharp from "sharp";

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
    .threshold(128)
    .resize(width * 4, height * 4, { kernel: "mitchell" })
    .negate({ alpha: false })
    .withMetadata({ density: 150 })
    .png();
  if (filename) {
    await sharpImg.toFile(`./src/image_dump/${filename}.png`);
  }
  return await sharpImg.toBuffer();
}
