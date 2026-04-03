import dotenv from 'dotenv';
import path from 'path';
// Manual dotenv config matching the project structure
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { pool } from '../services/db';
import { stripe } from '../services/stripeService';
import { updateUserSubscription } from '../services/dbService';

async function syncUserLimits() {
  console.log('Starting User Limit Sync...');
  
  try {
    const res = await pool.query('SELECT id, stripe_price_id, email, usage FROM users WHERE subscription_status = \'active\' AND stripe_price_id IS NOT NULL');
    const users = res.rows;
    console.log(`Found ${users.length} active users with price IDs.`);

    for (const user of users) {
      const priceId = user.stripe_price_id;
      const currentLimit = user.usage?.limit;
      
      console.log(`Processing user ${user.email} (Price: ${priceId}, Current Limit: ${currentLimit})...`);

      try {
        const price = await stripe.prices.retrieve(priceId);
        const correctLimitStr = price.metadata.analysis_limit;
        
        if (!correctLimitStr) {
            console.warn(`  WARNING: Price ${priceId} still has no metadata limit! Skipping.`);
            continue;
        }

        const correctLimit = parseInt(correctLimitStr, 10);

        if (currentLimit !== correctLimit) {
            console.log(`  Mismatch found! Updating limit from ${currentLimit} to ${correctLimit}...`);
            await updateUserSubscription(user.id, { usageLimit: correctLimit });
            console.log(`  User updated.`);
        } else {
            console.log(`  Limit is already correct.`);
        }

      } catch (err: any) {
        console.error(`  Error fetching price ${priceId} for user ${user.id}:`, err.message);
      }
    }
  } catch (err) {
      console.error("Database error:", err);
  } finally {
      await pool.end();
  }
  
  console.log('Finished User Limit Sync.');
}

syncUserLimits();
