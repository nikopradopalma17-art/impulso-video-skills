const path = require('path');
const fs = require('fs');

async function renderVideo({ htmlPath, outputDir, width = 1280, height = 720, maxDurationSec = 180 }) {
  const { chromium } = require('playwright');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: { dir: outputDir, size: { width, height } },
  });
  const page = await context.newPage();
  await page.goto('file://' + path.resolve(htmlPath));
  await page.waitForLoadState('networkidle');

  await page.waitForFunction(() => window.__done === true, null, { timeout: maxDurationSec * 1000 });
  await page.waitForTimeout(400);

  const video = page.video();
  await context.close();
  const videoPath = await video.path();
  await browser.close();
  return videoPath;
}

module.exports = { renderVideo };
