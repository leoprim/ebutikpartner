const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function scanAlibaba(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for the main product title to appear
  await page.waitForSelector('h1, .ma-title, .module-pdp-title', { timeout: 20000 });

  // Dump the fully rendered HTML for debugging
  const html = await page.content();
  fs.writeFileSync('alibaba-debug.html', html);

  // Scan for all <img> tags with alicdn.com in src
  const allImages = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .map(img => img.src || img.getAttribute('data-src'))
      .filter(src => src && src.includes('alicdn.com'));
  });
  fs.writeFileSync('alibaba-all-images.json', JSON.stringify(allImages, null, 2));

  // Scan for all elements with 'sku', 'variant', or 'option' in class or id
  const variantHtmls = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*')).filter(el => {
      const c = typeof el.className === 'string' ? el.className.toLowerCase() : '';
      const i = typeof el.id === 'string' ? el.id.toLowerCase() : '';
      return (
        (c && (c.includes('sku') || c.includes('variant') || c.includes('option')))
        || (i && (i.includes('sku') || i.includes('variant') || i.includes('option')))
      );
    });
    return elements.map(el => el.outerHTML);
  });
  fs.writeFileSync('alibaba-variant-htmls.json', JSON.stringify(variantHtmls, null, 2));

  // Extract main product images from the main carousel
  const mainImages = await page.evaluate(() => {
    function normalize(url) {
      if (!url) return null;
      if (url.startsWith('//')) return 'https:' + url;
      if (url.startsWith('http')) return url;
      return url;
    }
    return Array.from(document.querySelectorAll('[data-testid="product-image-view"] img'))
      .map(img => normalize(img.src || img.getAttribute('data-src')))
      .filter(Boolean);
  });
  fs.writeFileSync('alibaba-main-images.json', JSON.stringify(mainImages, null, 2));

  // Extract structured variant data
  const variants = await page.evaluate(() => {
    function normalize(url) {
      if (!url) return null;
      if (url.startsWith('//')) return 'https:' + url;
      if (url.startsWith('http')) return url;
      return url;
    }
    const variantGroups = Array.from(document.querySelectorAll('[data-testid="sku-list"]'));
    return variantGroups.map(group => {
      const nameSpan = group.querySelector('h4 span');
      const name = nameSpan ? nameSpan.textContent.replace(/\(\d+\)$/, '').trim() : '';
      const options = Array.from(group.querySelectorAll('[data-testid="sku-list-item"] [data-testid="non-last-sku-item"]')).map(opt => {
        const img = opt.querySelector('img');
        return {
          label: img ? img.alt : '',
          image: img ? normalize(img.src || img.getAttribute('data-src')) : null
        };
      });
      return { name, options };
    });
  });
  fs.writeFileSync('alibaba-variants.json', JSON.stringify(variants, null, 2));

  // Extract title and description
  const title = await page.evaluate(() => {
    const el = document.querySelector('h1, .ma-title, .module-pdp-title');
    return el ? el.textContent.trim() : '';
  });
  const description = await page.evaluate(() => {
    const el = document.querySelector('.product-description, [data-testid="product-description"]');
    return el ? el.textContent.trim() : '';
  });

  // Output all as a single JSON object for backend consumption
  const result = {
    title,
    description,
    images: mainImages,
    variants,
  };
  console.log(JSON.stringify(result));

  await browser.close();
  console.error('Scan complete. See alibaba-debug.html, alibaba-all-images.json, and alibaba-variant-htmls.json for results.');
}

// Usage: node scripts/scrape-alibaba-puppeteer.js <alibaba-url>
if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/scrape-alibaba-puppeteer.js <alibaba-url>');
    process.exit(1);
  }
  scanAlibaba(url).catch(err => {
    console.error('Scanning failed:', err);
    process.exit(1);
  });
}
