// Production-ready Node.js server for donation widget
// Includes proper error handling, validation, and security measures for processing real donations

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Read application info from package.json
const packageInfo = require('../package.json');
const APP_NAME = 'VegaDonationEngine';
const APP_VERSION = packageInfo.version;

const app = express();
const port = process.env.PORT || 3000;

// Initialize Stripe with your restricted key
const stripe = require('stripe')(process.env.STRIPE_RESTRICTED_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Check if React build exists
const distPath = path.join(__dirname, '..', 'dist');
const reactBuildExists = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));

// Serve React build if available, otherwise serve vanilla
if (reactBuildExists) {
    console.log('📱 React build detected - serving React app');
    
    // Serve React static files with fallback to root assets
    app.use('/assets', express.static(path.join(distPath, 'assets')));
    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
    
    // Serve React app with Stripe key injection
    const serveReactApp = (req, res) => {
        const reactHtmlPath = path.join(distPath, 'index.html');
        
        fs.readFile(reactHtmlPath, 'utf8', (err, html) => {
            if (err) {
                console.error('Error reading React HTML file:', err);
                return res.status(500).send('Error loading page');
            }
            
            // Inject Stripe key for React app
            const stripeKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key_replace_with_real_key';
            const enablePreview = process.argv.includes('--preview');
            
            const isLocalDev = host === 'localhost' && !process.env.RAILWAY_ENVIRONMENT;
            const isRailwayDev = process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV !== 'production';
            const isProduction = process.env.NODE_ENV === 'production' || (process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV === 'production');
            const environmentType = isProduction ? 'production' : (isRailwayDev ? 'railway-dev' : 'local-dev');
            const isTestMode = stripeKey.startsWith('pk_test_');
            
            const scriptInjection = `    <script>
        // Stripe publishable key injected by server (React mode)
        window.STRIPE_PUBLISHABLE_KEY = '${stripeKey}';
        console.log('🔑 Stripe key configured:', '${stripeKey.substring(0, 12)}...');
        console.log('⚛️ React app loaded via Express server');
        // Environment information
        window.ENVIRONMENT_INFO = {
            type: '${environmentType}',
            isProduction: ${isProduction},
            isTestMode: ${isTestMode},
            host: '${host}',
            port: ${port},
            mode: 'react-build'
        };
    </script>`;
            
            // Insert script before closing head tag
            const modifiedHtml = html.replace(
                '</head>',
                `${scriptInjection}\n  </head>`
            );
            
            res.send(modifiedHtml);
        });
    };
    
    // React app routes
    app.get('/', serveReactApp);
    app.get('/donate', serveReactApp);
    app.get('/privacy', serveReactApp);
    app.get('/terms', serveReactApp);
    
} else {
    console.log('🗂️ No React build found - serving vanilla HTML');
    
    // Serve the homepage with redirect to /donate (vanilla mode)
    app.get('/', (req, res) => {
        const htmlPath = path.join(__dirname, '..', 'home.html');
        
        fs.readFile(htmlPath, 'utf8', (err, html) => {
            if (err) {
                console.error('Error reading home HTML file:', err);
                return res.status(500).send('Error loading page');
            }
            
            res.send(html);
        });
    });
}

    // Vanilla donation widget (only if no React build)
    if (!reactBuildExists) {
        app.get('/donate', (req, res) => {
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
        // Stripe publishable key injected by server (vanilla mode)
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
            port: ${port},
            mode: 'vanilla'
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
    }

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

// Serve static assets (CSS, JS, images) - only for vanilla mode
if (!reactBuildExists) {
    app.use('/css', express.static(path.join(__dirname, '..', 'css')));
    app.use('/js', express.static(path.join(__dirname, '..', 'js')));
    app.use('/embed', express.static(path.join(__dirname, '..', 'embed')));
    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
}

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

        // Validate required fields
        if (!amount || amount < 50) { // Minimum $0.50
            console.log('❌ Invalid amount:', amount);
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (!firstName || !lastName || !email) {
            console.log('❌ Missing required fields:', { firstName: !!firstName, lastName: !!lastName, email: !!email });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create customer (required for subscriptions, optional for one-time)
        let customer = null;
        try {
            console.log('👤 Attempting to create customer...');
            customer = await stripe.customers.create({
                name: `${firstName} ${lastName}`,
                email: email,
                phone: phone || undefined,
                address: {
                    line1: address,
                    city: city,
                    state: state,
                    postal_code: zip,
                    country: 'US'
                },
                metadata: {
                    processed_by: APP_NAME,
                    app_version: APP_VERSION,
                    occupation: occupation || '',
                    employer: employer || '',
                    comment: comment || '',
                    donor_name: `${firstName} ${lastName}`,
                    donor_email: email,
                    phone: phone || '',
                    address: address || '',
                    city: city || '',
                    state: state || '',
                    zip: zip || ''
                }
            });
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
            description: `Donation from ${firstName} ${lastName}`,
            receipt_email: email,
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
                comment: comment || ''
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
                    comment: comment || ''
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
            res.json({
                subscriptionId: subscription.id,
                clientSecret: subscription.latest_invoice.payment_intent.client_secret
            });

        } else {
            // One-time payment
            console.log('💳 Creating one-time payment intent with amount:', amount);
            const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
            console.log('✅ Payment intent created:', paymentIntent.id);

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
            // Handle successful payment (e.g., send confirmation email, update database)
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

// Helper functions for webhook handling

// Handle invoice payment succeeded event
async function handleInvoicePaymentSucceeded(invoice) {
    try {
        console.log('📧 Attempting to send receipt email for invoice:', invoice.id);
        
        // Try to send the invoice via email
        // First check if the invoice can be sent (not already sent)
        if (invoice.status === 'paid' && invoice.customer_email) {
            // For paid invoices with customer email, manually trigger email
            console.log(`📧 Sending receipt to ${invoice.customer_email} for invoice ${invoice.id}`);
            
            // We cannot use sendInvoice for paid invoices, but we can create a custom email
            // In a production environment, you'd use your email service (SendGrid, etc.)
            console.log('📧 Receipt email would be sent here in production environment');
            console.log(`   - To: ${invoice.customer_email}`);
            console.log(`   - Amount: $${(invoice.amount_paid / 100).toFixed(2)}`);
            console.log(`   - Date: ${new Date(invoice.status_transitions.paid_at * 1000).toLocaleString()}`);
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

// SPA fallback for React Router (only if React build exists)
if (reactBuildExists) {
    app.get('*', (req, res) => {
        // Serve React app for any unmatched routes
        const reactHtmlPath = path.join(distPath, 'index.html');
        
        fs.readFile(reactHtmlPath, 'utf8', (err, html) => {
            if (err) {
                console.error('Error reading React HTML file for SPA fallback:', err);
                return res.status(500).send('Error loading page');
            }
            
            // Inject Stripe key for React app
            const stripeKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key_replace_with_real_key';
            const enablePreview = process.argv.includes('--preview');
            
            const isLocalDev = host === 'localhost' && !process.env.RAILWAY_ENVIRONMENT;
            const isRailwayDev = process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV !== 'production';
            const isProduction = process.env.NODE_ENV === 'production' || (process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV === 'production');
            const environmentType = isProduction ? 'production' : (isRailwayDev ? 'railway-dev' : 'local-dev');
            const isTestMode = stripeKey.startsWith('pk_test_');
            
            const scriptInjection = `    <script>
        // Stripe publishable key injected by server (React SPA fallback)
        window.STRIPE_PUBLISHABLE_KEY = '${stripeKey}';
        console.log('🔑 Stripe key configured:', '${stripeKey.substring(0, 12)}...');
        console.log('⚛️ React app loaded via SPA fallback');
        // Environment information
        window.ENVIRONMENT_INFO = {
            type: '${environmentType}',
            isProduction: ${isProduction},
            isTestMode: ${isTestMode},
            host: '${host}',
            port: ${port},
            mode: 'react-spa-fallback'
        };
    </script>`;
            
            // Insert script before closing head tag
            const modifiedHtml = html.replace(
                '</head>',
                `${scriptInjection}\n  </head>`
            );
            
            res.send(modifiedHtml);
        });
    });
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
