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
    args: ["--no-sandbox","--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 420 });

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await new Promise(r=>setTimeout(r,2000));

  fs.mkdirSync("assets",{recursive:true});

  const encoder = new GIFEncoder(WIDTH,HEIGHT);
  const stream = encoder.createReadStream().pipe(
    fs.createWriteStream("assets/preview.gif")
  );

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);

  const canvas = createCanvas(WIDTH,HEIGHT);
  const ctx = canvas.getContext("2d");

  // 🔥 AI
  const interval = setInterval(async ()=>{
    try{
      const move = await page.evaluate(()=>{
        const s = window.snake;
        const f = window.foods;

        if(!s || !f || f.length===0) return null;

        const head = s[0];

        let target = f[0];
        let dist = Infinity;

        for(const food of f){
          const d = Math.abs(head.x-food.x)+Math.abs(head.y-food.y);
          if(d<dist){dist=d;target=food;}
        }

        if(target.x > head.x) return "ArrowRight";
        if(target.x < head.x) return "ArrowLeft";
        if(target.y > head.y) return "ArrowDown";
        if(target.y < head.y) return "ArrowUp";

        return null;
      });

      if(move){
        await page.evaluate(m=>window.setDirection(m), move);
      }

    }catch{}
  },120);

  const canvasEl = await page.$("#game");
  const box = await canvasEl.boundingBox();

  for(let i=0;i<50;i++){
    const buf = await page.screenshot({
      clip:{
        x:box.x,
        y:box.y,
        width:box.width,
        height:box.height
      }
    });

    const img = await loadImage(buf);
    ctx.drawImage(img,0,0);
    encoder.addFrame(ctx);

    await new Promise(r=>setTimeout(r,100));
  }

  encoder.finish();
  await new Promise(r=>stream.on("finish",r));

  clearInterval(interval);
  await browser.close();
})();
