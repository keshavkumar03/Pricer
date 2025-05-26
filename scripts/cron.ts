import cron from 'node-cron'
import { scrapeAndUpdateProducts } from '@/lib/jobs/scrapeAndUpdate'

// Run every 30 minutes (adjust as needed)
cron.schedule('*/30 * * * *', async () => {
  console.log('⏰ Running scheduled product update...')
  try {
    const result = await scrapeAndUpdateProducts()
    console.log('✅ Scheduled update completed successfully')
  } catch (error) {
    console.error('❌ Scheduled update failed:', error)
  }
})

// Optionally run immediately on start
console.log('🚀 Starting initial product update...')
scrapeAndUpdateProducts()
  .then(() => console.log('✅ Initial update completed'))
  .catch(error => console.error('❌ Initial update failed:', error))