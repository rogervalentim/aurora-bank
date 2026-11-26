const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3100/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'shots/login.png', fullPage: true });
  await page.getByRole('button', { name: 'Usar credenciais do sandbox' }).click();
  await page.getByRole('button', { name: 'Entrar no backoffice' }).click();
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'shots/dashboard.png', fullPage: true });
  await page.getByRole('button', { name: 'Auditar' }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/auditoria.png', fullPage: false });
  await browser.close();
})();
