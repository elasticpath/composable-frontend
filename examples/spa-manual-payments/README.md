# Manual Payment Processing SPA Example

This example showcases how to implement **manual payment gateway processing** with **Elastic Path Commerce Cloud** in a Single-Page Application (SPA) written in React.

> **Heads-up:** This project focuses **exclusively** on manual payment processing workflows. It creates minimal test orders solely to demonstrate payment handling—cart management, product catalogs, customer accounts, etc. are kept deliberately simple and are not the focus.

Key capabilities demonstrated:

1. **Test Order Creation** – automatically creates incomplete orders with test products for payment processing demonstration.
2. **Manual Payment Gateway** – processes payments using Elastic Path's manual payment gateway for scenarios like:
   • Bank transfers  
   • Cash payments  
   • Check payments  
   • Custom payment workflows
3. **Order State Management** – converts incomplete orders to complete orders after manual payment recording.
4. **Payment Status Tracking** – displays real-time order and payment status updates with proper UI indicators.

> The example purposefully uses simplified order creation and minimal product selection to keep the focus on manual payment mechanics.

---

## Project Structure

```
spa-manual-payments/
├── index.html                    # Vite entry point
├── src/
│   ├── App.tsx                   # Main application with stepper UI
│   ├── components/
│   │   ├── OrderCreator.tsx      # Creates test orders for payment demo
│   │   ├── ManualPayment.tsx     # Manual payment processing form
│   │   └── OrderStatus.tsx       # Order & payment status display
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

This generates an incomplete order ready for manual payment processing.

### 2. Manual Payment Processing

`ManualPayment` captures payment details and processes them:

```tsx
const paymentData = {
  gateway: "manual",
  method: "purchase",
  // if the user supplies a reference
  paymentmethod_meta: {
    custom_reference: paymentReference,
    name: "Manual Payment",
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

2. **Set environment variables** – create a `.env` file in `examples/spa-manual-payments` (or export in your shell):

```
VITE_APP_EPCC_ENDPOINT_URL=https://YOUR_EP_DOMAIN.elasticpath.com
VITE_APP_EPCC_CLIENT_ID=YOUR_CLIENT_ID
```

3. **Start Vite dev server**:

```bash
pnpm --filter spa-manual-payments dev
```

## Learn More

- [Manual Payment Gateway Documentation](https://elasticpath.dev/docs/api/carts/cart-management)
- [Order Management with Elastic Path](https://elasticpath.dev/docs/api/carts/cart-management)
- [Payment Processing APIs](https://elasticpath.dev/docs/api/carts/cart-management)
