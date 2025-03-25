import path from "path";

import puppeteer from "puppeteer";

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("http://localhost:8010");
    await page.setViewport({ width: 1920, height: 1080 });

    await page.screenshot({
        path: path.resolve(process.cwd(), "./public/screenshot_home.png"),
    });

    await page.goto("http://localhost:8010/convert");
    await page.screenshot({
        path: path.resolve(process.cwd(), "./public/screenshot_convert.png"),
    });

    await browser.close();
})();
