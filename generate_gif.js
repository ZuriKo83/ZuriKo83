const puppeteer = require("puppeteer");
const fs = require("fs");
const GIFEncoder = require("gifencoder");
const { createCanvas, loadImage } = require("canvas");

const WIDTH = 400;
const HEIGHT = 400;
const URL = "https://ZuriKo83.github.io/ZuriKo83/";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  await page.goto(URL);

  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  encoder.createReadStream().pipe(fs.createWriteStream("assets/preview.gif"));

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  for(let i=0;i<40;i++){
    await page.screenshot({ path: "frame.png" });
    const img = await loadImage("frame.png");
    ctx.drawImage(img, 0, 0);
    encoder.addFrame(ctx);
  }

  encoder.finish();
  await browser.close();
})();
