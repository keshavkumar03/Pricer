"use server"

import puppeteer from 'puppeteer';
//import { extractCurrency, extractDescription, extractPrice } from '../utils'; // Keep this import

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  try {
    // Launch Puppeteer browser without proxy
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' }); // Wait until page is fully loaded

    // Extract product details
    const data = await page.evaluate(() => {
      const title = document.querySelector('#productTitle')?.textContent?.trim() || '';
      const currentPrice = document.querySelector('.priceToPay span.a-price-whole')?.textContent?.trim() || '0';
      const originalPrice = document.querySelector('.a-offscreen')?.textContent?.trim() || '';
      const outOfStock = document.querySelector('#availability span')?.textContent?.trim().toLowerCase() === 'currently unavailable';
      
      const images = document.querySelector('#imgBlkFront')?.getAttribute('data-a-dynamic-image') ||
        document.querySelector('#landingImage')?.getAttribute('data-a-dynamic-image') || '{}';
      const imageUrls = Object.keys(JSON.parse(images));

      const discountRate = document.querySelector('.savingsPercentage')?.textContent?.replace(/[-%]/g, "") || '';

      const description = (() => {
        const selectors = [".a-unordered-list .a-list-item", ".a-expander-content p"];
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            return Array.from(elements)
              .map(el => el.textContent?.trim())
              .filter(Boolean)
              .join("\n");
          }
        }
        return "";
      })();
      
      

      // Return raw extracted data as an object
      return {
        title,
        currentPrice,
        originalPrice,
        outOfStock,
        imageUrls,
        discountRate,
        description
      };
    });

    // Process raw data in Node.js context
    // const currency = extractCurrency(data.currentPrice);
    // const processedDescription = extractDescription(data.description);
    // const currentPrice = extractPrice(data.currentPrice);
    // const originalPrice = extractPrice(data.originalPrice);

    // Construct data object with processed information
    const finalData = {
      url,
      currency: data.currentPrice,
      image: data.imageUrls[0],
      title: data.title,
      currentPrice: Number(data.currentPrice) || Number(data.originalPrice),
      originalPrice: Number(data.originalPrice) || Number(data.currentPrice),
      priceHistory: [],
      discountRate: Number(data.discountRate),
      category: 'category',
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: data.outOfStock,
      description: data.description,
      lowestPrice: Number(data.currentPrice) || Number(data.originalPrice),
      highestPrice: Number(data.originalPrice) || Number(data.currentPrice),
      averagePrice: Number(data.currentPrice) || Number(data.originalPrice),
    };

    console.log(finalData);

    await browser.close();
    console.log(finalData); // Close the browser after extraction
    return finalData;

  } catch (error: any) {
    console.log(error);
  }
}
