import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:5173/');
  
  console.log('Page loaded');
  
  // Wait for React to render
  await new Promise(r => setTimeout(r, 1000));
  
  // Click the Accept button to hide it initially
  try {
    await page.click('cookie-banner [data-accept-btn]');
    console.log('Clicked Accept');
  } catch (e) {
    console.log('No accept button found or error:', e.message);
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click "Cookie Settings"
  try {
    const buttons = await page.$$('button');
    let clicked = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Cookie Settings')) {
        await btn.click();
        console.log('Clicked Cookie Settings');
        clicked = true;
        break;
      }
    }
    if (!clicked) console.log('Cookie Settings button not found');
  } catch (e) {
    console.log('Error clicking Cookie Settings:', e.message);
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.evaluate(() => document.querySelector('cookie-banner')?.outerHTML);
  console.log('CookieBanner HTML:', html);

  await browser.close();
})();
