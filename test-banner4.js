import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  
  await new Promise(r => setTimeout(r, 500));
  
  // 1. Initial state
  let html = await page.evaluate(() => document.querySelector('cookie-banner').innerHTML);
  console.log('Initial HTML present:', html.includes('We value your privacy'));
  
  // 2. Click Accept
  await page.evaluate(() => document.querySelector('cookie-banner [data-accept-btn]').click());
  await new Promise(r => setTimeout(r, 500));
  
  html = await page.evaluate(() => document.querySelector('cookie-banner').innerHTML);
  console.log('After Accept HTML empty:', html.trim() === '');
  
  // 3. Click Cookie Settings
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Cookie Settings'));
    btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  
  html = await page.evaluate(() => document.querySelector('cookie-banner').innerHTML);
  console.log('After Cookie Settings click HTML present:', html.includes('We value your privacy'));
  
  // 4. Click Decline
  await page.evaluate(() => document.querySelector('cookie-banner [data-decline-btn]').click());
  await new Promise(r => setTimeout(r, 500));
  
  html = await page.evaluate(() => document.querySelector('cookie-banner').innerHTML);
  console.log('After Decline HTML empty:', html.trim() === '');
  
  // 5. Click Cookie Settings AGAIN
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Cookie Settings'));
    btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  
  html = await page.evaluate(() => document.querySelector('cookie-banner').innerHTML);
  console.log('After SECOND Cookie Settings click HTML present:', html.includes('We value your privacy'));

  await browser.close();
})();
