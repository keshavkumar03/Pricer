import { PriceHistoryItem, Product } from "@/types";

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

const THRESHOLD_PERCENTAGE = 40;

export function extractPrice(priceStr: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export function extractCurrency(priceStr: string): string {
  const match = priceStr?.match(/[₹$€£]/);
  if (match) return match[0];
  return 'INR'; // default
}

export function getHighestPrice(priceList: PriceHistoryItem[]) {
  // Check if priceList is empty or undefined
  if (!priceList || priceList.length === 0) {
    return 0;
  }

  let highestPrice = priceList[0];

  for (let i = 1; i < priceList.length; i++) {
    // Add null check for each price item
    if (priceList[i] && priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
  // Check if priceList is empty or undefined
  if (!priceList || priceList.length === 0) {
    return 0;
  }

  let lowestPrice = priceList[0];

  for (let i = 1; i < priceList.length; i++) {
    // Add null check for each price item
    if (priceList[i] && priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
  // Check if priceList is empty or undefined
  if (!priceList || priceList.length === 0) {
    return 0;
  }

  const sumOfPrices = priceList.reduce((acc, curr) => {
    // Add null check for each price item
    return acc + (curr && curr.price ? curr.price : 0);
  }, 0);
  
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
) => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};

export const formatNumber = (num: number = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};