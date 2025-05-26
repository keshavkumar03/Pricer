import { NextResponse } from "next/server";

import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function scrapeAndUpdateProducts(request?: Request) {
  try {
    await connectToDB();

    const products = await Product.find({});

    if (!products || products.length === 0) {
      throw new Error("No products found in database");
    }

    // ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        try {
          // Scrape product
          const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

          if (!scrapedProduct) {
            console.warn(`Failed to scrape product: ${currentProduct.url}`);
            return null;
          }

          // Ensure currentProduct.priceHistory exists and is an array
          const existingPriceHistory = Array.isArray(currentProduct.priceHistory) 
            ? currentProduct.priceHistory 
            : [];

          const updatedPriceHistory = [
            ...existingPriceHistory,
            {
              price: scrapedProduct.currentPrice,
              date: new Date()
            },
          ];

          const product = {
            ...scrapedProduct,
            priceHistory: updatedPriceHistory,
            lowestPrice: getLowestPrice(updatedPriceHistory),
            highestPrice: getHighestPrice(updatedPriceHistory),
            averagePrice: getAveragePrice(updatedPriceHistory),
          };

          // Update Products in DB
          const updatedProduct = await Product.findOneAndUpdate(
            {
              url: product.url,
            },
            product,
            { new: true } // Return the updated document
          );

          if (!updatedProduct) {
            console.warn(`Failed to update product in database: ${product.url}`);
            return null;
          }

          // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
          const emailNotifType = getEmailNotifType(
            scrapedProduct,
            currentProduct
          );

          if (emailNotifType && updatedProduct.users && updatedProduct.users.length > 0) {
            const productInfo = {
              title: updatedProduct.title,
              url: updatedProduct.url,
            };
            // Construct emailContent
            const emailContent = await generateEmailBody(productInfo, emailNotifType);
            // Get array of user emails
            const userEmails = updatedProduct.users.map((user: any) => user.email);
            // Send email notification
            await sendEmail(emailContent, userEmails);
          }

          return updatedProduct;
        } catch (productError: any) {
          console.error(`Error processing product ${currentProduct.url}:`, productError.message);
          return null;
        }
      })
    );

    // Filter out null results
    const successfulUpdates = updatedProducts.filter(product => product !== null);

    return NextResponse.json({
      message: "Ok",
      data: successfulUpdates,
      totalProcessed: products.length,
      successfulUpdates: successfulUpdates.length
    });
  } catch (error: any) {
    console.error("Error in scrapeAndUpdateProducts:", error);
    throw new Error(`Failed to get all products: ${error.message}`);
  }
}