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
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  await page.goto(URL, { waitUntil: "domcontentloaded" });

  // 로딩 대기
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

  // 🔥 AI 자동 플레이
  const interval = setInterval(async () => {
    try {
      const move = await page.evaluate(() => {
        const snake = window.snake;
        const foods = window.foods;

        if (!snake || !foods || foods.length === 0) return null;

        const head = snake[0];

        let target = foods[0];
        let minDist = Infinity;

        for (const f of foods) {
          const d = Math.abs(head.x - f.x) + Math.abs(head.y - f.y);
          if (d < minDist) {
            minDist = d;
            target = f;
          }
        }

        if (target.x > head.x) return "ArrowRight";
        if (target.x < head.x) return "ArrowLeft";
        if (target.y > head.y) return "ArrowDown";
        if (target.y < head.y) return "ArrowUp";

        return null;
      });

      if (move) {
        await page.keyboard.press(move);
      }
    } catch {}
  }, 120);

  // 캔버스 위치
  const canvasEl = await page.$("#game");
  const box = await canvasEl.boundingBox();

  // 프레임 캡처
  for (let i = 0; i < 50; i++) {
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

    await new Promise(r => setTimeout(r, 100));
  }

  encoder.finish();

  await new Promise(resolve => stream.on("finish", resolve));

  clearInterval(interval);
  await browser.close();

  console.log("✅ AI GIF 생성 완료");
})();
