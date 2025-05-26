"use server"
import { connectToDB } from '../mongoose';
import Product from '../models/product.model';
import puppeteer from 'puppeteer';
//import { extractCurrency, extractDescription, extractPrice } from '../utils'; // Keep this import

export async function scrapeAmazonProduct(url: string) {
  if (!url) {
    console.error('No URL provided to scrapeAmazonProduct');
    return null;
  }

  console.log(`Starting to scrape: ${url}`);

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

    await browser.close();

    // Validate scraped data
    if (!data.title) {
      console.warn(`No title found for URL: ${url}`);
      return null;
    }

    // Process the extracted price
    const processedCurrentPrice = extractPrice(data.currentPrice) || extractPrice(data.originalPrice);
    const processedOriginalPrice = extractPrice(data.originalPrice) || extractPrice(data.currentPrice);

    if (!processedCurrentPrice || isNaN(processedCurrentPrice)) {
      console.warn(`⚠️ Skipping product with invalid price: ${url}`);
      return null;
    }

    // Construct data object with processed information
    const finalData = {
      url: url, // Explicitly use the url parameter
      currency: extractCurrency(data.currentPrice) || 'INR',
      image: data.imageUrls[0] || '',
      title: data.title,
      currentPrice: processedCurrentPrice,
      originalPrice: processedOriginalPrice,
      priceHistory: [],
      discountRate: Number(data.discountRate) || 0,
      category: 'category',
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: data.outOfStock,
      description: data.description || '',
      lowestPrice: processedCurrentPrice,
      highestPrice: processedOriginalPrice,
      averagePrice: processedCurrentPrice,
    };

    console.log('Processed finalData:', {
      url: finalData.url,
      title: finalData.title.substring(0, 50) + '...',
      currentPrice: finalData.currentPrice,
      originalPrice: finalData.originalPrice
    });

    // Connect to DB
    await connectToDB();

    // Save or update product
    const savedProduct = await Product.findOneAndUpdate(
      { url: finalData.url },
      finalData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Successfully saved/updated product:', savedProduct._id);
    return savedProduct;

  } catch (error: any) {
    console.error(`Error scraping product ${url}:`, error.message);
    return null;
  }
}