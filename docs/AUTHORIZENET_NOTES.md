# Authorize.Net Integration Notes

## Key Differences from Stripe

### Authentication
- **Authorize.Net**: Uses API Login ID + Transaction Key
- **Stripe**: Uses Publishable Key + Secret Key

### Frontend Integration
- **Authorize.Net Options**:
  1. **Accept.js** - Client-side encryption (similar to Stripe Elements)
  2. **Hosted Payment Form** - Redirect to Authorize.Net hosted form (easiest for MVP)
  3. **Accept Customer** - Customer profile management

### Payment Processing
- **Authorize.Net**: Synchronous API responses
- **Stripe**: Async with webhooks

### Transaction Types
- **Charge**: `createTransaction` with `AUTH_CAPTURE`
- **Refund**: `createTransaction` with `REFUND`
- **Void**: `createTransaction` with `VOID`

## Recommended Approach for MVP

### Option 1: Hosted Payment Form (Easiest)
- Redirect customer to Authorize.Net hosted form
- Simplest implementation
- PCI compliance handled by Authorize.Net
- Good for MVP

### Option 2: Accept.js (More Control)
- Keep customer on your site
- More customization
- Requires PCI compliance considerations
- Better UX but more complex

## SDK Installation

```bash
npm install authorizenet
```

## Environment Variables

```env
AUTHORIZENET_API_LOGIN_ID=your_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_ENVIRONMENT=sandbox  # or 'production'
```

## API Response Handling

Authorize.Net returns responses synchronously:
- Success: Transaction response with transaction ID
- Failure: Error response with reason codes
- Need to handle responses in API endpoints (not webhooks)

## Testing

- Use Authorize.Net Sandbox account
- Test cards: See Authorize.Net developer docs
- Can test transactions in sandbox environment

## Documentation

- Official SDK: https://github.com/AuthorizeNet/node-sdk
- API Reference: https://developer.authorize.net/api/reference/
- Accept.js: https://developer.authorize.net/api/reference/features/acceptjs.html
- Hosted Form: https://developer.authorize.net/api/reference/features/accept_hosted.html

