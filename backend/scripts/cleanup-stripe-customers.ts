// scripts/cleanup-stripe-customers.ts
// This script cleans up invalid Stripe customer IDs from the database

import { stripe } from '../services/stripeService';
import { pool } from '../services/db';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupStripeCustomers() {
    console.log('Starting Stripe customer cleanup...');

    try {
        // Get all users with Stripe customer IDs
        const result = await pool.query(
            'SELECT id, email, stripe_customer_id FROM users WHERE stripe_customer_id IS NOT NULL'
        );

        const users = result.rows;
        console.log(`Found ${users.length} users with Stripe customer IDs`);

        let invalidCount = 0;
        let validCount = 0;

        for (const user of users) {
            try {
                // Try to retrieve the customer from Stripe
                await stripe.customers.retrieve(user.stripe_customer_id);
                validCount++;
                console.log(`✓ Valid customer: ${user.stripe_customer_id} (${user.email})`);
            } catch (error: any) {
                // Customer doesn't exist in Stripe
                invalidCount++;
                console.log(`✗ Invalid customer: ${user.stripe_customer_id} (${user.email})`);

                // Clear the invalid customer ID from the database
                await pool.query(
                    'UPDATE users SET stripe_customer_id = NULL, stripe_price_id = NULL WHERE id = $1',
                    [user.id]
                );
                console.log(`  → Cleared invalid customer ID for user ${user.email}`);
            }
        }

        console.log('\n=== Cleanup Summary ===');
        console.log(`Total users checked: ${users.length}`);
        console.log(`Valid customer IDs: ${validCount}`);
        console.log(`Invalid customer IDs cleaned: ${invalidCount}`);

    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
    cleanupStripeCustomers()
        .then(() => {
            console.log('\nCleanup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\nCleanup failed:', error);
            process.exit(1);
        });
}

export { cleanupStripeCustomers };