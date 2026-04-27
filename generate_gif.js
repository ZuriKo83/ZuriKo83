const puppeteer = require("puppeteer");
const fs = require("fs");
const GIFEncoder = require("gifencoder");
const { createCanvas, loadImage } = require("canvas");

const WIDTH = 400;
const HEIGHT = 400;
const URL = "https://ZuriKo83.github.io/ZuriKo83/repo/";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  const page = await browser.newPage();

  // viewport 고정 (중요)
  await page.setViewport({
    width: WIDTH,
    height: HEIGHT
  });

  await page.goto(URL, { waitUntil: "domcontentloaded" });

  // 게임 로딩 대기
  await new Promise(r => setTimeout(r, 2000));

  fs.mkdirSync("assets", { recursive: true });

  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  const stream = encoder.createReadStream().pipe(
    fs.createWriteStream("assets/preview.gif")
  );

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.setQuality(10);

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // 자동 플레이
  const directions = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

  const interval = setInterval(async () => {
    try {
      const key = directions[Math.floor(Math.random() * 4)];
      await page.keyboard.press(key);
    } catch {}
  }, 300);

  // 캔버스 위치 가져오기 (핵심)
  const canvasEl = await page.$("#game");
  const box = await canvasEl.boundingBox();

  // 프레임 캡처
  for (let i = 0; i < 40; i++) {
    const buffer = await page.screenshot({
      clip: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height
      }
    });

    const img = await loadImage(buffer);
    ctx.drawImage(img, 0, 0);
    encoder.addFrame(ctx);

    // 프레임 간 딜레이
    await new Promise(r => setTimeout(r, 100));
  }

  encoder.finish();

  await new Promise(resolve => stream.on("finish", resolve));

  clearInterval(interval);
  await browser.close();

  console.log("✅ GIF 생성 완료: assets/preview.gif");
})();
