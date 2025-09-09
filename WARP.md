# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a political campaign donation widget built with Node.js, Express, and Stripe. It provides a secure, embeddable donation form for political campaigns with support for one-time and recurring donations, processing fee coverage, and FEC compliance fields.

## Common Commands

### Development
```bash
# Start development server with auto-restart
npm run dev

# Start development server with network access (for mobile testing)
npm run dev:host

# Start development server with preview mode enabled
npm run dev:preview

# Start development server with both network access and preview mode
npm run dev:full
```

### Production
```bash
# Start production server
npm start

# Start production server with network access
npm run start:host

# Start production server with preview mode
npm run start:preview

# Start production server with both network access and preview mode
npm run start:full
```

### Environment Setup
```bash
# Copy environment template and configure Stripe keys
cp .env.example .env

# Install dependencies
npm install
```

### Testing
```bash
# No automated tests configured yet
# Manual testing uses Stripe test cards:
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# 3D Secure: 4000 0000 0000 3220
```

## Architecture Overview

### Backend Architecture (Node.js/Express)
- **Main Server**: `server/server.js` - Express server handling both static files and API routes
- **Payment Processing**: Integrated Stripe API for payment intents and subscriptions
- **Route Structure**:
  - `/` - Homepage redirect
  - `/donate` - Main widget page with dynamic Stripe key injection
  - `/api/create-payment-intent` - Payment processing endpoint
  - `/webhook` - Stripe webhook handler for payment events
  - Static file serving for CSS, JS, images

### Frontend Architecture (Vanilla JavaScript)
- **Widget Class**: `js/widget.js` - Main donation widget functionality
- **Stripe Elements**: Integrated Stripe card input with custom styling
- **State Management**: Simple class-based state for amount selection, donation type, fee coverage
- **Form Validation**: Client-side validation with server-side backup

### Key Features
- **Preset Donation Amounts**: $25, $50, $100, $250, $500, $1,000, $3,500
- **Custom Amount Input**: Supports any amount with validation
- **Donation Types**: One-time payments and monthly subscriptions
- **Processing Fee Coverage**: Optional 2.9% + $0.30 fee coverage
- **FEC Compliance**: Collects required fields (name, address, occupation, employer)
- **URL Parameters**: Pre-fill amounts via `?amount=5000` (amount in cents)

### File Structure
```
donation-widget/
├── server/
│   └── server.js           # Express server with Stripe integration
├── js/
│   └── widget.js           # Frontend widget class
├── css/
│   └── widget.css          # Widget styling
├── embed/
│   └── embed.js            # Embeddable script for other websites
├── assets/                 # Images and logos
├── index.html              # Main widget page
├── embed-example.html      # Example of embedding widget
└── package.json            # Dependencies and scripts
```

## Environment Variables

### Required
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_test_... or pk_live_...)
- `STRIPE_RESTRICTED_KEY` - Stripe secret key (sk_test_... or sk_live_...)

### Optional
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret for Stripe events
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Development Patterns

### Error Handling
- Server includes comprehensive error logging with emoji indicators (🔄, ✅, ❌, ⚠️)
- Client-side error display with user-friendly messages
- Stripe-specific error handling with proper error codes

### Payment Processing Flow
1. **Client**: User fills form and submits
2. **Validation**: Client validates required fields and amount
3. **Payment Intent**: Server creates Stripe Payment Intent or Subscription
4. **Card Processing**: Stripe Elements handles secure card processing
5. **Confirmation**: Success/error handling with user feedback

### Server Command Line Options
- `--host` - Enable network access (bind to 0.0.0.0)
- `--preview` - Enable preview mode features
- Can be combined: `npm run dev:full` uses both options

## Stripe Integration Details

### One-time Donations
- Creates Payment Intent with customer data
- Supports processing fee calculation and addition
- Automatic receipt emails via Stripe

### Monthly Subscriptions
- Creates Customer, Product, and Price objects
- Uses Subscription with payment_behavior: 'default_incomplete'
- Handles invoice emails via webhooks

### Webhook Events Handled
- `payment_intent.succeeded` - One-time payment success
- `payment_intent.payment_failed` - Payment failure
- `invoice.payment_succeeded` - Recurring payment success
- `customer.subscription.created` - New subscription

## Deployment Information

The project includes detailed deployment guides in:
- `SINGLE-DEPLOYMENT.md` - Railway, Render, Heroku, Vercel options
- Supports full-stack deployment (both frontend and backend together)
- Configured for production with proper environment variable handling

## URL Parameter Pre-filling

Feature documented in `URL-PARAMETERS.md`:
- `?amount=5000` pre-fills $50 donation
- Supports both preset button selection and custom amounts
- Amount specified in cents (5000 = $50.00)

## Security Considerations

- Server-side validation of all payment data
- Stripe Elements handles PCI compliance for card data
- Environment variables properly isolated from frontend
- HTTPS enforced in production environments
- Customer data stored in Stripe, not locally

## Political Campaign Compliance

The widget collects FEC-required information:
- Donor name, address, occupation, employer
- Processing fee transparency
- Contribution limit awareness ($3,500 federal limit noted)
- Comment field for donor messages

## Browser Support

- Modern browsers with ES6+ support
- Mobile responsive design
- Stripe Elements provides cross-browser payment compatibility

## Testing Strategy

Currently manual testing with Stripe test cards. Consider adding:
- Automated form validation tests
- Payment flow integration tests
- Mobile device testing utilities
- Error scenario testing
