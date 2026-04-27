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

  // 🔥 viewport 정확히 고정
  await page.setViewport({
    width: WIDTH,
    height: HEIGHT
  });

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

  // 🔥 AI 자동 이동
  const interval = setInterval(async () => {
    try {
      const move = await page.evaluate(() => {
        const s = window.snake;
        const f = window.foods;

        if (!s || !f || f.length === 0) return null;

        const head = s[0];

        let target = f[0];
        let min = Infinity;

        for (const food of f) {
          const d = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
          if (d < min) {
            min = d;
            target = food;
          }
        }

        if (target.x > head.x) return "ArrowRight";
        if (target.x < head.x) return "ArrowLeft";
        if (target.y > head.y) return "ArrowDown";
        if (target.y < head.y) return "ArrowUp";

        return null;
      });

      if (move) {
        await page.evaluate(m => window.setDirection(m), move);
      }
    } catch {}
  }, 120);

  // 🔥 canvas 위치 정확히 가져오기 + 정수화
  const canvasEl = await page.$("#game");
  const rawBox = await canvasEl.boundingBox();

  const box = {
    x: Math.floor(rawBox.x),
    y: Math.floor(rawBox.y),
    width: Math.floor(rawBox.width),
    height: Math.floor(rawBox.height)
  };

  // 🔥 프레임 캡처
  for (let i = 0; i < 50; i++) {
    const buffer = await page.screenshot({
      clip: box
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

  console.log("✅ 완전 고정 GIF 생성 완료");
})();
