import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:5173/');
  await new Promise(r => setTimeout(r, 1000));
  
  const zIndexes = await page.evaluate(() => {
    const sidebar = document.querySelector('.docs-sidebar');
    const banner = document.querySelector('[data-banner-container]');
    
    return {
      sidebarZ: window.getComputedStyle(sidebar).zIndex,
      sidebarPosition: window.getComputedStyle(sidebar).position,
      bannerZ: banner ? window.getComputedStyle(banner).zIndex : 'none',
      bannerLeft: banner ? banner.getBoundingClientRect().left : 'none',
      bannerTop: banner ? banner.getBoundingClientRect().top : 'none',
      sidebarLeft: sidebar.getBoundingClientRect().left,
      sidebarRight: sidebar.getBoundingClientRect().right,
      textLeft: banner ? banner.querySelector('h3').getBoundingClientRect().left : 'none'
    };
  });
  
  console.log(zIndexes);
  await browser.close();
})();
