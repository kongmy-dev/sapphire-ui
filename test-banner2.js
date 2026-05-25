import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click Accept to hide it
  await page.evaluate(() => document.querySelector('[data-accept-btn]').click());
  await new Promise(r => setTimeout(r, 1000));
  
  let html = await page.evaluate(() => document.querySelector('cookie-banner')?.outerHTML);
  console.log('After accept HTML:', html);

  // Simulate setShowCookies(true) -> el.setAttribute('force-show', '')
  await page.evaluate(() => document.querySelector('cookie-banner').setAttribute('force-show', ''));
  await new Promise(r => setTimeout(r, 100));
  
  html = await page.evaluate(() => document.querySelector('cookie-banner')?.outerHTML);
  console.log('After force-show HTML:', html);

  await browser.close();
})();
