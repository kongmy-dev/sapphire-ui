import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  
  await page.goto('http://localhost:5173/');
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'screenshot-initial.png' });
  
  // Click Accept
  await page.evaluate(() => document.querySelector('cookie-banner [data-accept-btn]').click());
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshot-accepted.png' });
  
  // Click Cookie Settings
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Cookie Settings'));
    btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshot-force-show.png' });

  await browser.close();
})();
