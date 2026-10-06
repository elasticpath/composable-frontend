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

### Required

- **An application key (client ID) for implicit authentication.** `src/auth/StorefrontProvider.tsx` authenticates with it. The app shows "Storefront not authenticated" and disables order creation until the catalog returns at least one product (`src/hooks/useAppInitialization.ts`). Create the key in Commerce Manager (Application Keys) and copy its client ID and the API endpoint for your region.
- **A published catalog with at least one product that can be added to a cart.** `src/hooks/useOrderCreation.ts` lists products with `getByContextAllProducts` and skips base products unless they are variation children. Each product needs a price. Learn how to publish a catalog [in the docs](https://elasticpath.dev/docs/commerce-manager/product-experience-manager/catalogs/catalog-configuration). The example reports "No products available" when the catalog is empty or every product is a base product. It also reports that when the product call fails, because it does not read the SDK `error`. A cart add that fails is also silent and shows up later as "Failed to create order".
- **The Carts and Orders APIs.** `useOrderCreation.ts` creates a cart, adds a product, and checks out as a guest with a placeholder customer and a US test address. No store setting is needed beyond the application key.
- **The `manual` payment gateway, enabled.** `src/components/ManualPayment.tsx` calls `paymentSetup` with gateway `manual` and method `purchase`, plus an optional `custom_reference`. Enable it in Commerce Manager (Payment Gateways). A failed call shows a generic "Payment processing failed" and drops the API's detail. The example marks the order `complete` and `paid` in the browser after the call succeeds, and does not re-fetch the order.

### Optional

- **Inventory (stock levels) for products.** `useOrderCreation.ts` calls `getStock` for each candidate product. A product with no stock record, or a failed stock call, counts as in stock. A product whose `available` is 0 is skipped, and if every addable product is out of stock the example reports "No products available with sufficient stock". Configure stock in Commerce Manager with the Inventories API.

### Common Setup Issues

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
VITE_APP_EPCC_ENDPOINT_URL=https://useast.api.elasticpath.com
VITE_APP_EPCC_CLIENT_ID=YOUR_CLIENT_ID
```

- `VITE_APP_EPCC_ENDPOINT_URL` (required): the API host for your store's region, including `https://`. The SDK uses it as the base URL for every request, so a bare host without the scheme is fetched as a relative URL and fails.
- `VITE_APP_EPCC_CLIENT_ID` (required): the client ID of the application key described above.

Vite inlines `VITE_` variables at build time. Restart the dev server or rebuild after you change them.

3. **Start Vite dev server**:

```bash
pnpm --filter spa-manual-payments dev
```

## Learn More

- [Manual Payment Gateway Documentation](https://elasticpath.dev/docs/api/carts/cart-management)
- [Order Management with Elastic Path](https://elasticpath.dev/docs/api/carts/cart-management)
- [Payment Processing APIs](https://elasticpath.dev/docs/api/carts/cart-management)
