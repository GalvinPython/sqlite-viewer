import path from "path";

import puppeteer from "puppeteer";

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: path.resolve(__dirname, ".puppeteer"),
    });
    const page = await browser.newPage();

    await page.goto("http://localhost:8010");
    await page.setViewport({ width: 1920, height: 1080 });

    await page.screenshot({
        path: path.resolve(
            __dirname,
            "./public/screenshot_home.png",
        ) as `${string}.png`,
    });

    await page.goto("http://localhost:8010/convert");
    await page.screenshot({
        path: path.resolve(
            __dirname,
            "./public/screenshot_convert.png",
        ) as `${string}.png`,
    });

    await browser.close();
})();
