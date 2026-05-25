import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Find "Cookie Settings" button and click it
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Cookie Settings'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  
  console.log('Clicked cookie settings via button:', clicked);
  
  await new Promise(r => setTimeout(r, 500));
  
  const hasForceShow = await page.evaluate(() => {
    const el = document.querySelector('cookie-banner');
    return el && el.hasAttribute('force-show');
  });
  
  console.log('cookie-banner has force-show attr:', hasForceShow);
  
  const html = await page.evaluate(() => {
    return document.querySelector('cookie-banner').innerHTML;
  });
  
  console.log('cookie-banner innerHTML:', html);

  await browser.close();
})();
