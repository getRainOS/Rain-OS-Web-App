// scripts/cleanup-stripe-customers.js
// Run this script to clean up invalid Stripe customer IDs from the database
// Usage: node scripts/cleanup-stripe-customers.js

require('dotenv').config();
const Stripe = require('stripe');
const { Pool } = require('pg');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});

// Initialize database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function cleanupStripeCustomers() {
    console.log('Starting Stripe customer cleanup...');
    console.log('Using Stripe mode:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'TEST' : 'LIVE');

    try {
        // Get all users with Stripe customer IDs
        const result = await pool.query(
            'SELECT id, email, stripe_customer_id FROM users WHERE stripe_customer_id IS NOT NULL'
        );

        const users = result.rows;
        console.log(`\nFound ${users.length} users with Stripe customer IDs\n`);

        let invalidCount = 0;
        let validCount = 0;

        for (const user of users) {
            try {
                // Try to retrieve the customer from Stripe
                await stripe.customers.retrieve(user.stripe_customer_id);
                validCount++;
                console.log(`✓ Valid customer: ${user.stripe_customer_id} (${user.email})`);
            } catch (error) {
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

        console.log('\n========================================');
        console.log('           CLEANUP SUMMARY');
        console.log('========================================');
        console.log(`Total users checked:        ${users.length}`);
        console.log(`Valid customer IDs:         ${validCount}`);
        console.log(`Invalid IDs cleaned:        ${invalidCount}`);
        console.log('========================================\n');

        return { total: users.length, valid: validCount, invalid: invalidCount };

    } catch (error) {
        console.error('Error during cleanup:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the cleanup
cleanupStripeCustomers()
    .then((stats) => {
        if (stats.invalid > 0) {
            console.log('✅ Cleanup completed successfully!');
            console.log('The invalid Stripe customer IDs have been removed from the database.');
            console.log('Users will get new customer IDs when they try to subscribe again.');
        } else {
            console.log('✅ No invalid customer IDs found - your database is clean!');
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Cleanup failed:', error.message);
        process.exit(1);
    });