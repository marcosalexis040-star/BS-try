// Renderiza los SVG de personajes a PNG (para vista previa y verificación)
// usando el Chromium preinstalado vía Playwright.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ASSETS = path.join(__dirname, '..', 'assets', 'characters');
const chars = ['shelly', 'colt', 'spike'];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ deviceScaleFactor: 2 });

  // PNG individual con fondo transparente (para el juego)
  for (const c of chars) {
    const svg = fs.readFileSync(path.join(ASSETS, `${c}.svg`), 'utf8');
    await page.setContent(`<body style="margin:0">${svg}</body>`);
    const el = await page.$('svg');
    await el.screenshot({ path: path.join(ASSETS, `${c}.png`), omitBackground: true });
  }

  // Hoja de vista previa con los tres juntos y etiquetas
  const svgs = chars.map(c => fs.readFileSync(path.join(ASSETS, `${c}.svg`), 'utf8'));
  const html = `<body style="margin:0;background:
      radial-gradient(1200px 700px at 50% 0%, #2b3350, #141826 70%);
      font-family:system-ui;display:flex;gap:10px;justify-content:center;
      align-items:flex-end;padding:30px 20px 12px">
    ${chars.map((c, i) => `<div style="text-align:center">
        <div style="width:300px;height:400px;display:flex;align-items:flex-end;justify-content:center">${svgs[i]}</div>
        <div style="color:#fff;font-size:24px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-top:6px">${c}</div>
      </div>`).join('')}
  </body>`;
  await page.setViewportSize({ width: 1000, height: 520 });
  await page.setContent(html);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(ASSETS, 'roster_preview.png') });

  await browser.close();
  console.log('OK render:', chars.map(c => c + '.png').join(', '), '+ roster_preview.png');
})().catch(e => { console.error(e); process.exit(1); });
