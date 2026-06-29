const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', '..', 'public', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function takeScreenshots() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Taking screenshot of Landing Page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, '01-landing.png') });

  console.log('Taking screenshot of Dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, '02-dashboard.png') });

  console.log('Taking screenshot of Custom Dashboards...');
  await page.goto('http://localhost:3000/custom-dashboards', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, '03-custom-dashboards.png') });

  console.log('Taking screenshot of DevQL Studio...');
  await page.goto('http://localhost:3000/devql', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, '04-devql.png') });

  console.log('Taking screenshot of Incidents...');
  await page.goto('http://localhost:3000/incidents', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, '05-incidents.png') });

  await browser.close();
  console.log('Done!');
}

takeScreenshots().catch(console.error);
