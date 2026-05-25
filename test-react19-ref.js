import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Expose a function so the page can log to node console
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:5173/');
  await new Promise(r => setTimeout(r, 1000));
  
  // Click Cookie Settings
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Cookie Settings'));
    btn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));

  await browser.close();
})();
