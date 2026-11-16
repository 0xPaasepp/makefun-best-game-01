import { chromium } from '/home/hatch/workspace/makefun/node_modules/playwright-core/index.mjs';
import { readFile, mkdir, stat } from 'node:fs/promises';

const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1187/chrome-linux/chrome',
  headless: true,
  args: ['--no-sandbox']
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const errors = [], failures = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => failures.push(request.url()));
  const shots = JSON.parse(await readFile('shots.json', 'utf8'));
  await mkdir('screenshots', { recursive: true });
  for (const scene of shots) {
    await page.goto('http://localhost:8080/' + scene.query);
    await page.waitForTimeout(150);
    const path = 'screenshots/' + scene.name;
    await page.screenshot({ path, type: 'jpeg', quality: 80 });
    const { size } = await stat(path);
    if (size > 262144) throw new Error(`${scene.name} exceeds 256 KiB`);
    console.log(`${scene.name}: 1280x720 JPEG, ${size} bytes`);
  }
  if (errors.length || failures.length) throw new Error(JSON.stringify({ errors, failures }));
  console.log(`${shots.length} real renders with 0 browser errors and 0 failed requests`);
} finally {
  await browser.close();
}
