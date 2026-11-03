# Elastic Path Payment Processing SPA Example

This example showcases how to implement **Elastic Path Payments** payment gateway with **Elastic Path Commerce Cloud** in a Single-Page Application (SPA) written in React. It builds on the `spa-manual-payments` example.

> **Heads-up:** This project focuses **exclusively** on Elastic Path Payments workflows. It creates minimal test orders solely to demonstrate payment handling—cart management, product catalogs, customer accounts, etc. are kept deliberately simple and are not the focus.

Key capabilities demonstrated:

1. **Test Order Creation** – automatically creates incomplete orders with test products for payment processing demonstration.
2. **Elastic Path Payments Gateway** – processes payments using Elastic Path Payments gateway, powered by Stripe elements:
3. **Order State Management** – converts incomplete orders to complete orders after Elastic Path payment processing.
4. **Payment Status Tracking** – displays real-time order and payment status updates with proper UI indicators.
5. **Stripe Payment Element** – Uses Stripe's recommended Payment Element for secure payment collection.

> The example purposefully uses simplified order creation and minimal product selection to keep the focus on Elastic Path payment mechanics.

---

## Store Setup Requirements

### Required

- **An application key (client ID) for implicit authentication.** `src/auth/StorefrontProvider.tsx` authenticates with it. The app shows "Storefront not authenticated" and disables order creation until the catalog returns at least one product (`src/hooks/useAppInitialization.ts`). Create the key in Commerce Manager (Application Keys) and copy its client ID and the API endpoint for your region.
- **A published catalog with at least one product that can be added to a cart.** `src/hooks/useOrderCreation.ts` lists products with `getByContextAllProducts` and skips base products unless they are variation children. Each product needs a price. Learn how to publish a catalog [in the docs](https://elasticpath.dev/docs/commerce-manager/product-experience-manager/catalogs/catalog-configuration). The example reports "No products available" when the catalog is empty or every product is a base product. It also reports that when the product call fails, because it does not read the SDK `error`. A cart add that fails is also silent and shows up later as "Failed to create order".
- **The Carts and Orders APIs.** `useOrderCreation.ts` creates a cart, adds a product, and checks out as a guest with a placeholder customer (`test@example.com`) and a US test address. No store setting is needed beyond the application key.
- **The Elastic Path Payments gateway, enabled and connected to a Stripe account.** `src/components/ElasticPathPayment.tsx` calls `paymentSetup` with gateway `elastic_path_payments_stripe`, method `purchase` and `payment_method_types: ["card"]`, then confirms the payment with Stripe. Enable the gateway in Commerce Manager (Payment Gateways), add your Stripe Connect account, and turn on test mode. The order total's currency must be one Stripe supports.
- **A Stripe publishable key and account ID from that same connected Stripe account.** `src/App.tsx` passes them to `loadStripe`. Keys from a different account cause the "No such payment_intent" error described below.

### Optional

- **Inventory (stock levels) for products.** `useOrderCreation.ts` calls `getStock` for each candidate product. A product with no stock record, or a failed stock call, counts as in stock. A product whose `available` is 0 is skipped, and if every addable product is out of stock the example reports "No products available with sufficient stock". Configure stock in Commerce Manager with the Inventories API.

### Common Setup Issues

**"No such payment_intent" Error**:

- **Cause**: Frontend Stripe keys don't match the backend Stripe account
- **Solution**: Ensure `VITE_STRIPE_PUBLISHABLE_KEY` and `VITE_STRIPE_ACCOUNT_ID` are from the same Stripe account connected to Elastic Path

**"No products available" Error**:

- **Cause**: No products in published catalog, catalog not published, or all products are base products
- **Solution**: Create and publish a catalog with at least one simple product

**404 Inventory Errors**:

- **Cause**: Product inventory not configured
- **Solution**: Either configure inventory or ignore (example handles gracefully)

---

## Project Structure

```
spa-elastic-path-payments/
├── index.html                    # Vite entry point
├── src/
│   ├── App.tsx                   # Main app orchestration & state management
│   ├── components/
│   │   ├── AppHeader.tsx         # Authentication status & cart ID display
│   │   ├── StepIndicator.tsx     # Multi-step progress indicator
│   │   ├── OrderCreator.tsx      # Creates test orders for payment demo
│   │   ├── ElasticPathPayment.tsx # Elastic Path payment processing with Stripe
│   │   ├── OrderStatus.tsx       # Order & payment status display
│   │   └── OrderCompleteView.tsx # Success screen with reset functionality
│   ├── hooks/
│   │   ├── useAppInitialization.ts # App startup & authentication logic
│   │   └── useOrderCreation.ts   # Order creation workflow & state
│   └── auth/
│       ├── CartProvider.tsx      # Basic cart initialization
│       └── StorefrontProvider.tsx # Elastic Path client setup
└── README.md                     # ← you are here
```

## How It Works

### 1. Test Order Creation

`OrderCreator` automatically creates a test scenario:

```tsx
// Creates cart → adds test product → checkout → incomplete order
const createIncompleteOrder = async () => {
  const products = await getByContextAllProducts()
  const selectedProduct = products.data.find(/* stock logic */)
  // ... cart creation, checkout, order creation
}
```

This generates an incomplete order ready for payment processing.

### 2. Payment Processing

`ElasticPathPayment` captures payment details and processes them using Elastic Path Payments (powered by Stripe):

```tsx
// 1. Initialize payment with Elastic Path
const paymentResponse = await paymentSetup({
  path: { orderID: order.id },
  body: {
    data: {
      gateway: "elastic_path_payments_stripe",
      method: "purchase",
      payment: {
        currency: order.meta?.display_price?.with_tax?.currency,
        amount: order.meta?.display_price?.with_tax?.amount,
      },
    },
  },
})

// 2. Confirm payment with Stripe
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: { return_url: window.location.origin },
  redirect: "if_required",
})

// 3. Confirm with Elastic Path
await confirmOrder({ path: { orderID: order.id } })
```

### 3. Status Display

`OrderStatus` shows order and payment status.

---

## Running the Example Locally

1. **Install deps** (from the repo root):

```bash
pnpm i   # or npm install / yarn
```

2. **Set environment variables** – create a `.env` file in `examples/spa-elastic-path-payments`:

```env
# Elastic Path Commerce Cloud
VITE_APP_EPCC_ENDPOINT_URL=https://useast.api.elasticpath.com
VITE_APP_EPCC_CLIENT_ID=YOUR_CLIENT_ID

# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY

# Stripe Account ID
VITE_STRIPE_ACCOUNT_ID=acct_YOUR_STRIPE_ACCOUNT_ID
```

- `VITE_APP_EPCC_ENDPOINT_URL` (required): the API host for your store's region, including `https://`. The SDK uses it as the base URL for every request, so a bare host without the scheme is fetched as a relative URL and fails.
- `VITE_APP_EPCC_CLIENT_ID` (required): the client ID of the application key described above.
- `VITE_STRIPE_PUBLISHABLE_KEY` (required): your Stripe **publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode). `src/App.tsx` falls back to an empty string when it is unset, and Stripe cannot initialise with that.
- `VITE_STRIPE_ACCOUNT_ID` (required): the connected Stripe account ID (`acct_...`), passed to Stripe as `stripeAccount`. It must belong to the same Stripe account that Elastic Path Payments is connected to.

Vite inlines `VITE_` variables at build time. Restart the dev server or rebuild after you change them.

3. **Start Vite dev server**:

```bash
pnpm --filter spa-elastic-path-payments dev
```

The app will be available at `http://localhost:5173`

---

## Learn More

- [Elastic Path Payments Documentation](https://elasticpath.dev/docs/developer-tools/fundamentals/checkout/payments/elastic-path-payments/implement-payments)
- [Stripe Payment Element Guide](https://stripe.com/docs/payments/payment-element)
- [Elastic Path Commerce Cloud Docs](https://elasticpath.dev/docs)
