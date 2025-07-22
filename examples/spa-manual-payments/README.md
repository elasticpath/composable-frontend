# Manual Payment Processing SPA Example

This example showcases how to implement **manual payment gateway processing** with **Elastic Path Commerce Cloud** in a Single-Page Application (SPA) written in React. It builds on the `spa-guest-checkout` example, although omits a number of its features.

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
│   ├── App.tsx                   # Main app orchestration & state management
│   ├── components/
│   │   ├── AppHeader.tsx         # Authentication status & cart ID display
│   │   ├── StepIndicator.tsx     # Multi-step progress indicator
│   │   ├── OrderCreator.tsx      # Creates test orders for payment demo
│   │   ├── ManualPayment.tsx     # Manual payment processing form
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

---

## Store Setup Requirements

To use this example, your **Elastic Path Commerce Cloud store** must be properly configured:

### 🔌 **Payment Gateway Configuration**

1. **Enable Manual Gateway** in Commerce Manager:

   - Go to **Settings** → **Payments**
   - Configure **Manual** gateway
   - Enable the gateway

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

### 🚨 **Common Setup Issues**

**"No products available" Error**:

- **Cause**: No products in published catalog, catalog not published, or all products are base products
- **Solution**: Create and publish a catalog with at least one simple product

**404 Inventory Errors**:

- **Cause**: Product inventory not configured
- **Solution**: Either configure inventory or ignore (example handles gracefully)

---

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
