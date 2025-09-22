
# Address Autocomplete Implementation

The donation widget now includes Stripe's Address Element, which can provide Google Maps-powered address autocomplete. However, there are two approaches to enable the autocomplete functionality:

## Option 1: Payment Element + Address Element (Recommended)

**Pros:** 
- Automatic Google Maps autocomplete with no API key required
- Stripe provides and manages the Google Maps API key
- Modern payment experience

**Cons:**
- Requires switching from Card Element to Payment Element
- Payment Element requires more complex initialization

## Option 2: Address Element + Google Maps API Key

**Pros:**
- Keep existing Card Element
- Full control over Google Maps integration

**Cons:**
- Requires obtaining and managing your own Google Maps API key
- Additional setup and billing with Google Cloud

## Current Implementation

The widget currently uses **Option 2** setup but without the Google Maps API key. To enable autocomplete, you have two choices:

### Enable Option 2 (Easier - Recommended)

1. Get a Google Maps API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable the "Places API"
   - Create an API key
   - Restrict the API key to your domain for security

2. Add the API key to your widget:

```javascript
// In js/widget.js, update the addressElement creation:
this.addressElement = this.elements.create('address', {
    mode: 'billing',
    autocomplete: {
        mode: 'automatic',
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
    },
    fields: {
        phone: 'never'
    },
    defaultValues: {
        country: 'US'
    }
});
```

### Implement Option 1 (More complex)

This would require:
1. Switching from Card Element to Payment Element
2. Updating payment confirmation logic
3. Handling Payment Element initialization with client secrets

## Testing Autocomplete

Once you've added your Google Maps API key (Option 2), you can test autocomplete by:

1. Starting the development server: `npm run dev`
2. Opening http://localhost:3000
3. Clicking in the address field
4. Typing a partial address (e.g., "123 Main St")
5. You should see Google Maps autocomplete suggestions appear

## Supported Countries

Stripe's Address Element with autocomplete supports these countries:
- Australia, Belgium, Brazil, Canada, France, Germany, India, Ireland, Italy
- Japan, Malaysia, Mexico, Netherlands, New Zealand, Norway, Philippines
- Poland, Russia, Singapore, South Africa, Spain, Sweden, Switzerland
- Turkey, United Kingdom, United States

## Security Notes

- Always restrict your Google Maps API key to your specific domains
- Monitor API usage to avoid unexpected charges
- Consider implementing rate limiting if needed

## Troubleshooting

If autocomplete isn't working:

1. Check browser console for JavaScript errors
2. Verify your Google Maps API key is valid and unrestricted during testing
3. Ensure Places API is enabled in Google Cloud Console
4. Test in an incognito window to avoid cache issues
5. Check that you're typing addresses in supported countries# Address Autocomplete Implementation

The donation widget now includes Stripe's Address Element, which can provide Google Maps-powered address autocomplete. However, there are two approaches to enable the autocomplete functionality:

## Option 1: Payment Element + Address Element (Recommended)

**Pros:** 
- Automatic Google Maps autocomplete with no API key required
- Stripe provides and manages the Google Maps API key
- Modern payment experience

**Cons:**
- Requires switching from Card Element to Payment Element
- Payment Element requires more complex initialization

## Option 2: Address Element + Google Maps API Key

**Pros:**
- Keep existing Card Element
- Full control over Google Maps integration

**Cons:**
- Requires obtaining and managing your own Google Maps API key
- Additional setup and billing with Google Cloud

## Current Implementation

The widget currently uses **Option 2** setup but without the Google Maps API key. To enable autocomplete, you have two choices:

### Enable Option 2 (Easier - Recommended)

1. Get a Google Maps API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable the "Places API"
   - Create an API key
   - Restrict the API key to your domain for security

2. Add the API key to your widget:

```javascript
// In js/widget.js, update the addressElement creation:
this.addressElement = this.elements.create('address', {
    mode: 'billing',
    autocomplete: {
        mode: 'automatic',
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
    },
    fields: {
        phone: 'never'
    },
    defaultValues: {
        country: 'US'
    }
});
```

### Implement Option 1 (More complex)

This would require:
1. Switching from Card Element to Payment Element
2. Updating payment confirmation logic
3. Handling Payment Element initialization with client secrets

## Testing Autocomplete

Once you've added your Google Maps API key (Option 2), you can test autocomplete by:

1. Starting the development server: `npm run dev`
2. Opening http://localhost:3000
3. Clicking in the address field
4. Typing a partial address (e.g., "123 Main St")
5. You should see Google Maps autocomplete suggestions appear

## Supported Countries

Stripe's Address Element with autocomplete supports these countries:
- Australia, Belgium, Brazil, Canada, France, Germany, India, Ireland, Italy
- Japan, Malaysia, Mexico, Netherlands, New Zealand, Norway, Philippines
- Poland, Russia, Singapore, South Africa, Spain, Sweden, Switzerland
- Turkey, United Kingdom, United States

## Security Notes

- Always restrict your Google Maps API key to your specific domains
- Monitor API usage to avoid unexpected charges
- Consider implementing rate limiting if needed

## Troubleshooting

If autocomplete isn't working:

1. Check browser console for JavaScript errors
2. Verify your Google Maps API key is valid and unrestricted during testing
3. Ensure Places API is enabled in Google Cloud Console
4. Test in an incognito window to avoid cache issues
5. Check that you're typing addresses in supported countries