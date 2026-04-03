import dotenv from 'dotenv';
import path from 'path';

// Manual dotenv config matching the project structure
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { stripe } from '../services/stripeService';

const PRICE_LIMITS = {
  'price_1SeCHg3NMjs4uYdguOgkr3SQ': '5',
  'price_1SeCJH3NMjs4uYdgpi0xB0XN': '100',
  'price_1SeCKM3NMjs4uYdgcBRhgIhD': '500',
};

async function updateMetadata() {
  console.log('Starting Stripe Metadata Update...');
  
  for (const [priceId, limit] of Object.entries(PRICE_LIMITS)) {
    try {
      console.log(`Updating ${priceId} to limit ${limit}...`);
      await stripe.prices.update(priceId, {
        metadata: {
          analysis_limit: limit,
        },
      });
      console.log(`Successfully updated ${priceId}`);
    } catch (error: any) {
      console.error(`Failed to update ${priceId}:`, error.message);
    }
  }
  
  console.log('Finished updating Stripe Metadata.');
}

updateMetadata();
