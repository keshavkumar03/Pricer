# Pricer - Dynamic Pricing & Price Tracker Tool

**Pricer** is a dynamic and intelligent price tracking tool designed to scrape product data from e-commerce websites like **Amazon**. It calculates and analyzes product prices over time, notifies users about price drops, and helps make informed buying decisions.

---

## 🚀 Features

* **Web Scraping & Data Extraction:**
  Automatically fetch product details including **price, images, description, and availability** using scraping tools.

* **Dynamic Price Analysis:**
  Calculates **highest, lowest, and average price** of products over time.

* **Product Tracking & Alerts:**
  Users can subscribe to track a product via **email notifications** when:

  * Price drops below a threshold
  * Product is back in stock
  * Other custom triggers

* **User-Friendly Dashboard:**
  Displays scraped product details, price trends, and similar products in a clean **React-based interface**.

* **Automated Updates:**
  Uses **Cron jobs** to automatically scrape and update product data periodically.

---

## 📦 Tech Stack

* **Frontend:** React.js, Next.js 13, HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Web Scraping Tools:** Puppeteer (Headless Browser), Cheerio
* **Automation:** Cron Jobs for scheduled scraping
* **Email Notifications:** Nodemailer / Any email service

---

## 🛠 Project Structure

```text
Pricer/
├── backend/
│   ├── server.js            # Node.js server & scraping API endpoints
│   ├── scraper.js           # Puppeteer / Cheerio scraper logic
│   └── utils/
│       └── email.js         # Email notification logic
├── frontend/
│   ├── pages/
│   │   └── index.js         # Main Dashboard
│   ├── components/          # UI Components
│   └── styles/              # CSS / Tailwind styles
├── database/
│   └── models/
│       └── product.js       # MongoDB schema
└── README.md
```

---

## ⚡ How It Works

1. **Scraping Products:**
   User provides an Amazon product link → Backend scraper fetches **product data** → Stores it in **MongoDB**.

2. **Price Analysis:**
   Calculates **average, highest, lowest price** of the product.

3. **Notifications:**
   Sends email to users when product hits target price, is back in stock, or any other tracking condition is met.

4. **Frontend Dashboard:**
   Displays scraped product details, historical price trends, and similar products visually using **React components**.

5. **Automation:**
   Cron jobs run the scraping process automatically at defined intervals, keeping data up-to-date.

---

## 💻 Usage

1. Clone the repository:

   ```bash
   git clone <repo-url>
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the backend server:

   ```bash
   npm run dev
   ```
4. Open the frontend dashboard at `http://localhost:3000`

---

## ⚙️ Notes

* This project was implemented following a YouTube tutorial for educational purposes.
* Bright Data / proxy solutions are recommended for scraping at scale to bypass IP restrictions.
* Works best with Amazon product links.

---

