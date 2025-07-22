# Elastic Path Payment Processing SPA Example

This example showcases how to implement **Elastic Path payment gateway processing** with **Elastic Path Commerce Cloud** in a Single-Page Application (SPA) written in React. It builds on the `spa-guest-checkout` example, although omits a number of its features.

> **Heads-up:** This project focuses **exclusively** on Elastic Path payment processing workflows using **Stripe**. It creates minimal test orders solely to demonstrate payment handling—cart management, product catalogs, customer accounts, etc. are kept deliberately simple and are not the focus.

Key capabilities demonstrated:

1. **Test Order Creation** – automatically creates incomplete orders with test products for payment processing demonstration.
2. **Elastic Path Payment Gateway** – processes payments using Elastic Path's payment gateway powered by Stripe for scenarios like:
   • Credit card payments  
   • Digital wallet payments (Apple Pay, Google Pay)  
   • Alternative payment methods  
   • Secure payment processing
3. **Order State Management** – converts incomplete orders to complete orders after Elastic Path payment processing.
4. **Payment Status Tracking** – displays real-time order and payment status updates with proper UI indicators.
5. **Stripe Payment Element** – Uses Stripe's recommended Payment Element for secure payment collection.

> The example purposefully uses simplified order creation and minimal product selection to keep the focus on Elastic Path payment mechanics.

---

## Prerequisites

Before running this example, you'll need:

1. **Elastic Path Commerce Cloud Store** with Elastic Path Payments enabled
2. **Stripe Account** - Elastic Path Payments is powered by Stripe
3. **Stripe Publishable Key** - Get this from your Stripe Dashboard

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

This generates an incomplete order ready for Elastic Path payment processing.

### 2. Elastic Path Payment Processing

`ElasticPathPayment` captures payment details and processes them using Stripe:

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

# Stripe (required for Elastic Path Payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
```

**Important**: Make sure you're using your **Stripe publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode).

3. **Configure Elastic Path Payments** in your Elastic Path store:

   - Enable Elastic Path Payments in your store settings
   - Connect your Stripe account
   - Ensure the payment gateway is configured properly

4. **Start Vite dev server**:

```bash
pnpm --filter spa-elastic-path-payments dev
```

The app will be available at `http://localhost:5173`

---

## Environment Variables Reference

| Variable                      | Required | Description                                         |
| ----------------------------- | -------- | --------------------------------------------------- |
| `VITE_APP_EPCC_ENDPOINT_URL`  | ✅       | Your Elastic Path Commerce Cloud store URL          |
| `VITE_APP_EPCC_CLIENT_ID`     | ✅       | Your Elastic Path store's client ID                 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅       | Your Stripe publishable key (from Stripe Dashboard) |

---

## Payment Flow

1. **Order Creation**: App creates a test order with sample products
2. **Payment Initialization**: Call Elastic Path to setup payment with `elastic_path_payments_stripe` gateway
3. **Stripe Elements**: Render Stripe Payment Element for secure payment collection
4. **Payment Submission**: Submit payment form using Stripe Elements
5. **Payment Confirmation**: Confirm payment with Stripe using client secret
6. **Order Confirmation**: Confirm completed payment with Elastic Path
7. **Success**: Display payment success and order completion

---

## Troubleshooting

### Common Issues

**"No client secret received"**

- Ensure Elastic Path Payments is enabled in your store
- Verify your Stripe account is connected to Elastic Path
- Check that the payment gateway configuration is correct

**"Payment system not ready"**

- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Ensure you're using the publishable key (not secret key)
- Check browser console for Stripe loading errors

**Payment fails**

- Check Stripe Dashboard for failed payment details
- Verify test card numbers if using test mode
- Ensure order amount and currency are valid

**404 Resource Not Found (Inventory/Products)**

- Ensure you have products in your Elastic Path Commerce Cloud store
- Make sure products are published and not just in draft state
- Check that your store has at least one simple product (not just base products with variants)
- Verify your `VITE_APP_EPCC_ENDPOINT_URL` and `VITE_APP_EPCC_CLIENT_ID` are correct

**"No products available in your store"**

- Add at least one product to your Elastic Path Commerce Cloud store
- Ensure the product is published and available
- If you only have base products, create some child products or simple products

## Learn More

- [Elastic Path Payments Documentation](https://elasticpath.dev/docs/developer-tools/fundamentals/checkout/payments/elastic-path-payments/implement-payments)
- [Stripe Payment Element Guide](https://stripe.com/docs/payments/payment-element)
- [Elastic Path Commerce Cloud Docs](https://elasticpath.dev/docs)
