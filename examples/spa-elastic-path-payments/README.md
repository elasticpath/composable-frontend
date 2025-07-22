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

## Prerequisites

Before running this example, you'll need:

1. **Elastic Path Commerce Cloud Store** with Elastic Path Payments enabled
2. **Stripe Account** - Elastic Path Payments is powered by Stripe
3. **Stripe Publishable Key** and **Account ID** - Get these from your Stripe Dashboard

---

## Store Setup Requirements

To use this example, your **Elastic Path Commerce Cloud store** must be properly configured:

### 🔌 **Payment Gateway Configuration**

1. **Enable Elastic Path Payments** in Commerce Manager:

   - Go to **Settings** → **Payment Gateways**
   - Configure **Elastic Path Payments** gateway
   - Add your **Stripe Connect account**
   - Enable the gateway and test mode

### 📦 **Product Setup**

Your store needs products in a published catalog for the payment demo to work. Learn more about how to publish a catalog [in the docs](https://elasticpath.dev/docs/commerce-manager/product-experience-manager/catalogs/catalog-configuration):

1. **Product Requirements**:

   - Add at least one **simple product** (not a base product requiring variations)
   - Products should have **prices** associated with them
   - Products must be **active** and included in the published catalog

2. **Inventory Configuration** (Optional):
   - If using inventory management, ensure products have **stock levels** configured

### 🔑 **API Access Setup**

1. **Client Credentials**:

   - Go to **Settings** → **API Keys** and create a new application key
   - Note your **Client ID** and **Store URL** and use them in your .env

2. **Stripe Keys**:
   - From your **connected Stripe account**, obtain:
     - **Publishable Key** (`pk_test_...` for test mode or `pk_live_...` for live)
     - **Account ID** (`acct_...`) - This identifies your specific Stripe Connect account

### 🚨 **Common Setup Issues**

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
VITE_APP_EPCC_ENDPOINT_URL=https://YOUR_EP_DOMAIN.elasticpath.com
VITE_APP_EPCC_CLIENT_ID=YOUR_CLIENT_ID

# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY

# Stripe Account ID
VITE_STRIPE_ACCOUNT_ID=acct_YOUR_STRIPE_ACCOUNT_ID
```

**Important**: Make sure you're using your Stripe **publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode).

3. **Configure Elastic Path Payments** in your Elastic Path store:

   - Enable Elastic Path Payments in your store settings
   - Connect your Stripe account
   - Ensure the payment gateway is configured properly (e.g. test mode, enabled)

4. **Start Vite dev server**:

```bash
pnpm --filter spa-elastic-path-payments dev
```

The app will be available at `http://localhost:5173`

---

## Learn More

- [Elastic Path Payments Documentation](https://elasticpath.dev/docs/developer-tools/fundamentals/checkout/payments/elastic-path-payments/implement-payments)
- [Stripe Payment Element Guide](https://stripe.com/docs/payments/payment-element)
- [Elastic Path Commerce Cloud Docs](https://elasticpath.dev/docs)
