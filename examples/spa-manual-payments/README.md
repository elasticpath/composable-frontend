# Elastic Path Payment Processing SPA Example

This example showcases how to implement **Elastic Path payment gateway processing** with **Elastic Path Commerce Cloud** in a Single-Page Application (SPA) written in React. It builds on the `spa-guest-checkout` example, although omits a number of its features.

> **Heads-up:** This project focuses **exclusively** on Elastic Path payment processing workflows. It creates minimal test orders solely to demonstrate payment handling—cart management, product catalogs, customer accounts, etc. are kept deliberately simple and are not the focus.

Key capabilities demonstrated:

1. **Test Order Creation** – automatically creates incomplete orders with test products for payment processing demonstration.
2. **Elastic Path Payment Gateway** – processes payments using Elastic Path's payment gateway for scenarios like:
   • Credit card payments  
   • Digital wallet payments  
   • Alternative payment methods  
   • Custom payment workflows
3. **Order State Management** – converts incomplete orders to complete orders after Elastic Path payment processing.
4. **Payment Status Tracking** – displays real-time order and payment status updates with proper UI indicators.

> The example purposefully uses simplified order creation and minimal product selection to keep the focus on Elastic Path payment mechanics.

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
│   │   ├── ElasticPathPayment.tsx # Elastic Path payment processing form
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

`ElasticPathPayment` captures payment details and processes them:

```tsx
const paymentData = {
  gateway: "manual",
  method: "purchase",
  // if the user supplies a reference
  paymentmethod_meta: {
    custom_reference: paymentReference,
    name: "Elastic Path Payment",
  },
}

await paymentSetup({
  path: { orderID: order.id },
  body: { data: paymentData },
})
```

### 3. Status Display

`OrderStatus` shows order and payment status.

---

## Running the Example Locally

1. **Install deps** (from the repo root):

```bash
pnpm i   # or npm install / yarn
```

2. **Set environment variables** – create a `.env` file in `examples/spa-elastic-path-payments` (or export in your shell):

```
VITE_APP_EPCC_ENDPOINT_URL=https://YOUR_EP_DOMAIN.elasticpath.com
VITE_APP_EPCC_CLIENT_ID=YOUR_CLIENT_ID
```

3. **Start Vite dev server**:

```bash
pnpm --filter spa-elastic-path-payments dev
```

## Learn More

- [Elastic Path Payment Gateway Documentation](https://elasticpath.dev/docs/api/carts/cart-management)
- [Order Management with Elastic Path](https://elasticpath.dev/docs/api/carts/cart-management)
- [Payment Processing APIs](https://elasticpath.dev/docs/api/carts/cart-management)
