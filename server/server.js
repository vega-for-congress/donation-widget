// Production-ready Node.js server for donation widget
// Includes proper error handling, validation, and security measures for processing real donations

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Read application info from package.json
const packageInfo = require('../package.json');
const APP_NAME = 'VegaDonationEngine';
const APP_VERSION = packageInfo.version;

// Form submission worker URL (for adding donors to NocoDB)
const FORM_WORKER_URL = 'https://votevega-form-submission.vega-signup.workers.dev';

const app = express();
const port = process.env.PORT || 3000;

// Initialize Stripe with your restricted key
const stripe = require('stripe')(process.env.STRIPE_RESTRICTED_KEY);

// Middleware
app.use(cors());
// Parse JSON for all routes EXCEPT /webhook (which needs raw body for signature verification)
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Serve the homepage with redirect to /donate
app.get('/', (req, res) => {
    const fs = require('fs');
    const htmlPath = path.join(__dirname, '..', 'home.html');
    
    fs.readFile(htmlPath, 'utf8', (err, html) => {
        if (err) {
            console.error('Error reading home HTML file:', err);
            return res.status(500).send('Error loading page');
        }
        
        res.send(html);
    });
});

// Serve the donation widget with dynamic Stripe key injection at /donate
app.get('/donate', (req, res) => {
    const fs = require('fs');
    const htmlPath = path.join(__dirname, '..', 'index.html');
    
    fs.readFile(htmlPath, 'utf8', (err, html) => {
        if (err) {
            console.error('Error reading HTML file:', err);
            return res.status(500).send('Error loading page');
        }
        
        // Inject the Stripe publishable key from environment
        const stripeKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key_replace_with_real_key';
        
        // Check for --preview parameter to enable preview mode (localhost only)
        const enablePreview = process.argv.includes('--preview');
        
        // Detect environment type
        const isLocalDev = host === 'localhost' && !process.env.RAILWAY_ENVIRONMENT;
        const isRailwayDev = process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV !== 'production';
        const isProduction = process.env.NODE_ENV === 'production' || (process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV === 'production');
        const environmentType = isProduction ? 'production' : (isRailwayDev ? 'railway-dev' : 'local-dev');
        const isTestMode = stripeKey.startsWith('pk_test_');
        
        // Create the script injection
        const scriptInjection = `    <script>
        // Stripe publishable key injected by server (campaign-specific)
        window.STRIPE_PUBLISHABLE_KEY = '${stripeKey}';
        console.log('Stripe key configured:', '${stripeKey.substring(0, 12)}...');
        // Preview mode control (injected by server)
        window.ENABLE_PREVIEW_MODE = ${enablePreview};
        // Environment information (injected by server)
        window.ENVIRONMENT_INFO = {
            type: '${environmentType}',
            isProduction: ${isProduction},
            isTestMode: ${isTestMode},
            host: '${host}',
            port: ${port}
        };
    </script>`;
        
        // Insert the script before the widget.js script
        const modifiedHtml = html.replace(
            '<script src="js/widget.js"></script>',
            `${scriptInjection}\n    <script src="js/widget.js"></script>`
        );
        
        res.send(modifiedHtml);
    });
});

// Serve Privacy Policy page
app.get('/privacy.html', (req, res) => {
    const htmlPath = path.join(__dirname, '..', 'privacy.html');
    res.sendFile(htmlPath, (err) => {
        if (err) {
            console.error('Error serving privacy.html:', err);
            res.status(404).send('Privacy Policy page not found');
        }
    });
});

// Serve Terms of Service page
app.get('/terms.html', (req, res) => {
    const htmlPath = path.join(__dirname, '..', 'terms.html');
    res.sendFile(htmlPath, (err) => {
        if (err) {
            console.error('Error serving terms.html:', err);
            res.status(404).send('Terms of Service page not found');
        }
    });
});

// Serve static assets (CSS, JS, images) - placed after dynamic routes
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/embed', express.static(path.join(__dirname, '..', 'embed')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// API endpoint to create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
    console.log('🔄 Creating payment intent with data:', {
        amount: req.body.amount,
        donationType: req.body.donationType,
        email: req.body.email ? '[REDACTED]' : 'missing'
    });
    
    try {
        const {
            amount,
            donationAmount,
            processingFee,
            donationType,
            coverProcessingFee,
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            zip,
            occupation,
            employer,
            comment
        } = req.body;

        const paymentType = req.body.paymentType || 'card';

        // Validate required fields
        if (!amount || amount < 50) { // Minimum $0.50
            console.log('❌ Invalid amount:', amount);
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // For card payments, require billing details; for Link, Stripe provides them
        if (paymentType !== 'link' && (!firstName || !lastName || !email)) {
            console.log('❌ Missing required fields:', { firstName: !!firstName, lastName: !!lastName, email: !!email });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create customer (required for subscriptions, optional for one-time)
        // For Link payments, Stripe attaches billing details to the PaymentMethod directly
        let customer = null;
        const hasFullBilling = firstName && lastName && email;
        try {
            console.log('👤 Attempting to create customer...');
            const customerCreateParams = {
                metadata: {
                    processed_by: APP_NAME,
                    app_version: APP_VERSION,
                    payment_type: paymentType,
                    occupation: occupation || '',
                    employer: employer || '',
                    comment: comment || '',
                    donor_name: hasFullBilling ? `${firstName} ${lastName}` : '',
                    donor_email: email || '',
                    phone: phone || '',
                    address: address || '',
                    city: city || '',
                    state: state || '',
                    zip: zip || '',
                },
            };

            // Include billing details when available (card flow)
            if (hasFullBilling) {
                customerCreateParams.name = `${firstName} ${lastName}`;
                customerCreateParams.email = email;
                customerCreateParams.phone = phone || undefined;
                customerCreateParams.address = {
                    line1: address,
                    city: city,
                    state: state,
                    postal_code: zip,
                    country: 'US',
                };
            }

            customer = await stripe.customers.create(customerCreateParams);
            console.log('✅ Customer created:', customer.id);
        } catch (customerError) {
            console.log('⚠️ Could not create customer:', customerError.message);
            
            // For monthly donations, customer is required for proper receipt emails
            if (donationType === 'monthly') {
                console.error('❌ Customer creation failed for subscription - this will affect email receipts');
                return res.status(400).json({ 
                    error: 'Unable to create customer for subscription. Please check your Stripe key permissions.' 
                });
            }
        }

        // Create payment intent
        const paymentIntentData = {
            amount: amount, // Amount in cents
            currency: 'usd',
            payment_method_types: ['card', 'link'],
            description: hasFullBilling ? `Donation from ${firstName} ${lastName}` : 'Donation via Link',
            receipt_email: email || undefined,
            metadata: {
                processed_by: APP_NAME,
                app_version: APP_VERSION,
                donation_type: donationType,
                donor_name: `${firstName} ${lastName}`,
                donor_email: email,
                donor_phone: phone || '',
                donor_address: address || '',
                donor_city: city || '',
                donor_state: state || '',
                donor_zip: zip || '',
                cover_processing_fee: coverProcessingFee.toString(),
                occupation: occupation || '',
                employer: employer || '',
                comment: comment || '',
                email_opt_in: (req.body.emailOptIn === true).toString()
            }
        };
        
        // Add customer if we were able to create one
        if (customer) {
            paymentIntentData.customer = customer.id;
        }

        // If monthly donation, create a subscription instead
        if (donationType === 'monthly') {
            console.log('🔄 Creating monthly subscription...');
            
            // Create a product for the donation
            const product = await stripe.products.create({
                name: 'Monthly Donation',
                metadata: {
                    processed_by: APP_NAME,
                    app_version: APP_VERSION,
                    donor_name: `${firstName} ${lastName}`,
                    donor_email: email,
                    comment: comment || ''
                }
            });

            // Create a price for the product
            const price = await stripe.prices.create({
                unit_amount: amount,
                currency: 'usd',
                recurring: { interval: 'month' },
                product: product.id,
            });

            // Create a subscription with proper invoice email configuration
            const subscription = await stripe.subscriptions.create({
                customer: customer.id, // Customer is required (we validated this above)
                items: [{ price: price.id }],
                payment_behavior: 'default_incomplete',
                payment_settings: {
                    payment_method_types: ['card', 'link'],
                },
                expand: ['latest_invoice.payment_intent'],
                metadata: {
                    processed_by: APP_NAME,
                    app_version: APP_VERSION,
                    donation_type: 'monthly',
                    donor_name: `${firstName} ${lastName}`,
                    donor_email: email,
                    donor_phone: phone || '',
                    donor_address: address || '',
                    donor_city: city || '',
                    donor_state: state || '',
                    donor_zip: zip || '',
                    cover_processing_fee: coverProcessingFee.toString(),
                    occupation: occupation || '',
                    employer: employer || '',
                    comment: comment || '',
                    email_opt_in: (req.body.emailOptIn === true).toString()
                },
                automatic_tax: {
                    enabled: false,
                },
                collection_method: 'charge_automatically',
                default_tax_rates: [],
            });
            
            // Note: We'll handle invoice email receipts via webhook when payment succeeds
            // This is the most reliable approach as Stripe's automatic emails are inconsistent
            console.log('📧 Invoice receipt will be sent via webhook when payment succeeds');
            
            // Ensure customer is configured properly for invoices
            try {
                await stripe.customers.update(customer.id, {
                    invoice_settings: {
                        default_payment_method: null, // Will be set when payment succeeds
                        custom_fields: null,
                        default_tax_rates: [],
                        footer: 'Thank you for your continued support!'
                    }
                });
                console.log('📝 Customer invoice settings updated');
            } catch (emailError) {
                console.log('⚠️ Could not configure customer settings:', emailError.message);
            }

            console.log('✅ Monthly subscription created:', subscription.id);

            // Note: Donor will be submitted to NocoDB via webhook when payment succeeds

            res.json({
                subscriptionId: subscription.id,
                clientSecret: subscription.latest_invoice.payment_intent.client_secret
            });

        } else {
            // One-time payment
            console.log('💳 Creating one-time payment intent with amount:', amount);
            const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
            console.log('✅ Payment intent created:', paymentIntent.id);

            // Note: Donor will be submitted to NocoDB via webhook when payment succeeds

            res.json({
                clientSecret: paymentIntent.client_secret
            });
        }

    } catch (error) {
        console.error('❌ Error creating payment intent:', {
            message: error.message,
            type: error.type,
            code: error.code,
            statusCode: error.statusCode,
            requestId: error.requestId
        });
        
        // Return more specific error information
        const errorMessage = error.code ? `Stripe error (${error.code}): ${error.message}` : error.message;
        res.status(error.statusCode || 500).json({ error: errorMessage });
    }
});

// Webhook endpoint for Stripe events (optional but recommended)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        console.warn('Webhook secret not configured');
        return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('💰 Payment succeeded:', paymentIntent.id);
            
            // Submit donor to NocoDB via worker (only after payment confirmed)
            handlePaymentSucceeded(paymentIntent);
            break;

        case 'payment_intent.payment_failed':
            console.log('❌ Payment failed:', event.data.object.id);
            break;

        case 'customer.subscription.created':
            console.log('🔄 Subscription created:', event.data.object.id);
            break;

        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            console.log('📧 Recurring payment succeeded:', invoice.id);
            
            // Send receipt email for subscription invoices
            handleInvoicePaymentSucceeded(invoice);
            break;
            
        case 'invoice.finalized':
            const finalizedInvoice = event.data.object;
            console.log('📝 Invoice finalized:', finalizedInvoice.id);
            
            // For subscription invoices, ensure receipt email is sent when finalized
            if (finalizedInvoice.subscription) {
                handleInvoiceFinalized(finalizedInvoice);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple status endpoint
app.get('/api/status', (req, res) => {
    const hasStripeKey = !!process.env.STRIPE_RESTRICTED_KEY && !process.env.STRIPE_RESTRICTED_KEY.includes('dummy');
    const hasPublishableKey = !!process.env.STRIPE_PUBLISHABLE_KEY && !process.env.STRIPE_PUBLISHABLE_KEY.includes('dummy');
    
    res.json({
        status: 'OK',
        stripeConfigured: hasStripeKey && hasPublishableKey,
        keyType: process.env.STRIPE_RESTRICTED_KEY?.substring(0, 7) + '...',
        environment: process.env.NODE_ENV || 'development'
    });
});

// =========================================================
// MONEYBOMB API — public read-only endpoint for fundraiser page
// =========================================================

// Moneybomb: env vars serve as optional defaults; query params override.
const MONEYBOMB_DEFAULTS = {
    start: process.env.MONEYBOMB_START || null,
    end: process.env.MONEYBOMB_END || null,
    goal: parseInt(process.env.MONEYBOMB_GOAL || '50000', 10),
};

// In-memory cache keyed by start+end so different params don't share stale data
const moneybombCaches = {};
const MONEYBOMB_CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Truncate full name to "First L." for privacy.
 * "Maria Garcia" -> "Maria G."
 * "Anonymous" -> "Anonymous"
 */
function truncateName(fullName) {
    if (!fullName) return 'Anonymous';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

/**
 * Format a relative time string from a timestamp.
 */
function timeAgo(created) {
    const seconds = Math.floor((Date.now() / 1000) - created);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Fetch all succeeded payment intents in the moneybomb window from Stripe.
 * Paginates automatically (Stripe caps at 100 per request).
 */
async function fetchMoneybombData(start, end, goal) {
    const startTs = Math.floor(new Date(start).getTime() / 1000);
    const endTs = Math.floor(new Date(end).getTime() / 1000);

    let raised = 0;
    let donors = 0;
    const recentDonations = [];
    let hasMore = true;
    let startingAfter = undefined;

    while (hasMore) {
        const params = {
            limit: 100,
            created: { gte: startTs, lte: endTs },
        };
        if (startingAfter) params.starting_after = startingAfter;

        const result = await stripe.paymentIntents.list(params);

        for (const pi of result.data) {
            // Only count succeeded payments from our app
            if (pi.status !== 'succeeded') continue;
            if (pi.metadata?.processed_by !== APP_NAME) continue;

            const amountDollars = Math.round(pi.amount / 100);
            raised += amountDollars;
            donors += 1;

            // Collect the 20 most recent for the feed
            if (recentDonations.length < 20) {
                recentDonations.push({
                    name: truncateName(pi.metadata.donor_name),
                    amount: amountDollars,
                    message: pi.metadata.comment || '',
                    location: pi.metadata.donor_state
                        ? `${pi.metadata.donor_city || ''}, ${pi.metadata.donor_state}`.replace(/^,\s*/, '')
                        : '',
                    time: timeAgo(pi.created),
                });
            }
        }

        hasMore = result.has_more;
        if (hasMore && result.data.length > 0) {
            startingAfter = result.data[result.data.length - 1].id;
        }
    }

    return {
        mode: 'live',
        goal,
        raised,
        donors,
        recentDonations,
        countdownEnd: end,
        countdownStart: start,
    };
}

app.get('/api/moneybomb', async (req, res) => {
    // Query params override env-var defaults
    const start = req.query.start || MONEYBOMB_DEFAULTS.start;
    const end = req.query.end || MONEYBOMB_DEFAULTS.end;
    const goal = parseInt(req.query.goal, 10) || MONEYBOMB_DEFAULTS.goal;

    if (!start || !end) {
        return res.status(400).json({
            error: 'Missing start/end parameters',
            hint: 'Pass ?start=ISO&end=ISO (or set MONEYBOMB_START/MONEYBOMB_END env vars as defaults)',
        });
    }

    // Validate ISO dates
    if (isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) {
        return res.status(400).json({ error: 'Invalid start or end date (use ISO 8601)' });
    }

    try {
        const now = Date.now();
        const cacheKey = start + '|' + end;

        // Serve from cache if fresh
        const cached = moneybombCaches[cacheKey];
        if (cached && now < cached.expiresAt) {
            return res.json(cached.data);
        }

        // Fetch fresh data from Stripe
        const data = await fetchMoneybombData(start, end, goal);

        // Update cache
        moneybombCaches[cacheKey] = { data, expiresAt: now + MONEYBOMB_CACHE_TTL };

        res.json(data);
    } catch (error) {
        console.error('Moneybomb API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch moneybomb data' });
    }
});

// Helper functions for webhook handling

/**
 * Submit donor information to NocoDB via Cloudflare worker (non-blocking)
 * This runs asynchronously and will not block the payment flow if it fails
 */
function submitDonorToWorker(donorData) {
    const payload = {
        name: donorData.name,
        email: donorData.email,
        phone: donorData.phone || '',
        zip: donorData.zip || '',
        source: 'stripe',
        emailOptIn: donorData.emailOptIn === true, // Only true if explicitly opted in
        comment: donorData.comment || '',
    };

    // Determine origin based on environment
    const isRailwayProd = process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV === 'production';
    const isRailwayDev = process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV !== 'production';
    const origin = isRailwayProd ? 'https://secure.votevega.nyc'
        : isRailwayDev ? 'https://donation-widget-dev.up.railway.app'
        : 'http://localhost:3000';

    // Fire-and-forget: don't await, handle errors silently
    fetch(FORM_WORKER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': origin,
        },
        body: JSON.stringify(payload),
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('⚠️ Worker API error:', response.status, text);
                });
            }
            console.log('✅ Donor submitted to worker:', donorData.email);
        })
        .catch(error => {
            console.error('⚠️ Worker submission failed (non-blocking):', error.message);
        });
}

// Handle invoice payment succeeded event
async function handleInvoicePaymentSucceeded(invoice) {
    try {
        console.log('📧 Invoice payment succeeded:', invoice.id);
        
        // For subscription first payment, submit donor to NocoDB
        // billing_reason: 'subscription_create' = first payment, 'subscription_cycle' = recurring
        if (invoice.subscription && invoice.billing_reason === 'subscription_create') {
            console.log('🎉 First subscription payment - submitting donor to NocoDB');
            
            // Fetch the subscription to get our metadata
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const metadata = subscription.metadata || {};
            
            // Check if this is one of our subscriptions
            if (metadata.processed_by === APP_NAME) {
                const donorData = {
                    name: metadata.donor_name || '',
                    email: metadata.donor_email || invoice.customer_email || '',
                    phone: metadata.donor_phone || '',
                    zip: metadata.donor_zip || '',
                    emailOptIn: metadata.email_opt_in === 'true',
                    comment: metadata.comment || ''
                };
                
                if (donorData.email) {
                    console.log('📤 Submitting subscription donor to NocoDB:', donorData.email);
                    submitDonorToWorker(donorData);
                } else {
                    console.warn('⚠️ No email in subscription metadata');
                }
            }
        } else if (invoice.billing_reason === 'subscription_cycle') {
            console.log('🔄 Recurring subscription payment - not re-submitting donor');
        }
        
        // Log receipt info
        if (invoice.status === 'paid' && invoice.customer_email) {
            console.log(`📧 Receipt for ${invoice.customer_email}: $${(invoice.amount_paid / 100).toFixed(2)}`);
        }
    } catch (error) {
        console.error('⚠️ Error in handleInvoicePaymentSucceeded:', error.message);
    }
}

// Handle invoice finalized event
async function handleInvoiceFinalized(invoice) {
    try {
        console.log('📝 Invoice finalized, checking if email receipt needed:', invoice.id);
        
        // For subscription invoices that are finalized but not yet paid,
        // we can't send them yet - wait for payment_succeeded event
        if (invoice.subscription && invoice.status === 'open') {
            console.log('🗓️ Subscription invoice finalized, will send receipt when paid');
        }
    } catch (error) {
        console.error('⚠️ Error in handleInvoiceFinalized:', error.message);
    }
}

/**
 * Handle successful payment - submit donor to NocoDB
 * This is called from the webhook after payment is confirmed
 */
function handlePaymentSucceeded(paymentIntent) {
    try {
        const metadata = paymentIntent.metadata || {};
        
        // Check if this is one of our donations (has our metadata)
        if (metadata.processed_by !== APP_NAME) {
            console.log('ℹ️ Payment not from our app, skipping donor submission');
            return;
        }
        
        // Extract donor info from metadata
        const donorData = {
            name: metadata.donor_name || '',
            email: metadata.donor_email || paymentIntent.receipt_email || '',
            phone: metadata.donor_phone || '',
            zip: metadata.donor_zip || '',
            emailOptIn: metadata.email_opt_in === 'true',
            comment: metadata.comment || ''
        };
        
        // Validate we have minimum required data
        if (!donorData.email) {
            console.warn('⚠️ No email in payment metadata, skipping donor submission');
            return;
        }
        
        console.log('📤 Submitting donor to NocoDB after successful payment:', donorData.email);
        submitDonorToWorker(donorData);
        
    } catch (error) {
        console.error('⚠️ Error in handlePaymentSucceeded:', error.message);
    }
}

// Check for --host parameter to enable network access
// In production environments, always bind to 0.0.0.0 for external access
const enableNetworkAccess = process.argv.includes('--host');
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
const host = (enableNetworkAccess || isProduction) ? '0.0.0.0' : 'localhost';

// Start server
app.listen(port, host, () => {
    const environmentType = isProduction ? 'production' : (process.env.RAILWAY_ENVIRONMENT ? 'railway-dev' : 'local-dev');
    const isTestMode = (process.env.STRIPE_PUBLISHABLE_KEY || '').startsWith('pk_test_');
    
    console.log('='.repeat(60));
    console.log(`🚀 DONATION WIDGET SERVER STARTED`);
    console.log('='.repeat(60));
    console.log(`🎯 Environment: ${environmentType.toUpperCase()}`);
    console.log(`🔑 Stripe Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
    console.log(`🌍 Server: http://${host}:${port}`);
    console.log(`📝 Widget: http://localhost:${port}`);
    
    if (!isProduction) {
        console.log(`🚨 WARNING: This is a ${environmentType.replace('-', ' ').toUpperCase()} environment!`);
        console.log(`📝 For production, visit: https://secure.votevega.nyc/donate`);
    }
    
    if (isProduction) {
        console.log(`🌐 Production mode: Server bound to ${host} for external access`);
    }
    
    console.log('='.repeat(60));
    
    // Show network access info only when --host is used
    if (enableNetworkAccess) {
        // Get local network IP for mobile access
        const { networkInterfaces } = require('os');
        const nets = networkInterfaces();
        const results = {};
        
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }
        
        // Display network access info
        const networkIPs = Object.values(results).flat();
        if (networkIPs.length > 0) {
            console.log(`📱 Network access enabled! Available at:`);
            networkIPs.forEach(ip => {
                console.log(`   - http://${ip}:${port}`);
            });
            console.log(`📱 Use these URLs to access from mobile devices on the same network`);
        } else {
            console.log(`📱 Network access enabled, but no external network interfaces found`);
        }
    }
    
    if (!process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_RESTRICTED_KEY === 'sk_test_dummy_secret_key_replace_with_real_key') {
        console.warn('⚠️  Warning: Using dummy Stripe restricted key. Set STRIPE_RESTRICTED_KEY environment variable.');
    }
    
    if (!process.env.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY === 'pk_test_dummy_key_replace_with_real_key') {
        console.warn('⚠️  Warning: Using dummy Stripe publishable key. Set STRIPE_PUBLISHABLE_KEY environment variable.');
    }
});
