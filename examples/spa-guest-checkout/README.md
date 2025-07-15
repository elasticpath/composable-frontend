# Guest Checkout SPA Example

This example showcases how to implement a **guest checkout** flow with **Elastic Path Commerce Cloud** in a Single-Page Application (SPA) written in React + Vite.

> **Heads-up:** This project **extends** the [Shopping Cart Management Example](../spa-cart). We only cover the additional checkout logic here—cart creation, item manipulation, promotions, etc. are documented in that README.

Key capabilities demonstrated:

1. **Cart Persistence** – automatically creates / retrieves a cart via the Shopper SDK.
2. **Guest Checkout Form** – captures billing & shipping addresses in a single component with:
   • _Same as billing_ toggle  
   • Optional _Delivery Instructions_ field (shipping only)
3. **Order Creation** – converts a cart to an order using `checkoutApi` _without_ requiring a customer account or payment integration.
4. **Event-driven Cart Refresh** – broadcasts a `cart:updated` custom event so any part of the app can update after checkout.

> The example purposefully omits payment collection to keep the focus on the guest checkout mechanics. After an order is created the cart is cleared and a lightweight confirmation screen is displayed.

---

## Project Structure

```
spa-guest-checkout/
├── index.html            # Vite entry point
├── src/
│   ├── App.tsx           # Routes between Cart ↔︎ Checkout
│   ├── components/
│   │   ├── CartView.tsx  # Cart listing & promo code support
│   │   └── CheckoutView.tsx # Guest checkout form (billing + shipping)
│   └── auth/CartProvider.tsx # Initializes / persists cart
└── README.md             # ← you are here
```

## How It Works

### 1. Cart Initialization

`initializeCart()` from `@epcc-sdk/sdks-shopper` is executed on app load. If a cart already exists in local-storage its ID is reused, otherwise a new cart is created.

```tsx
// src/auth/CartProvider.tsx
useEffect(() => {
  initializeCart()
}, [])
```

### 2. Collecting Guest Details

`CheckoutView` keeps a nested `form` state:

```ts
{
  billing: { firstName, lastName, email, line1, city, region, postcode, country },
  shipping: { firstName, lastName, line1, city, region, postcode, country, instructions },
  sameAsBilling: true
}
```

If **Same as billing** is checked the shipping fields are hidden and the billing address is re-used.

### 3. Converting Cart → Order

Upon submit the component calls:

```ts
await checkoutApi({
  path: { cartID },
  body: {
    data: {
      customer: { email, name },
      billing_address: { ... },
      shipping_address: { ... }
    }
  }
})
```

The resulting order ID, total, and status are shown on a confirmation screen.

### 4. Clearing Cart & Refreshing UI

After a successful checkout:

```ts
window.dispatchEvent(new Event("cart:updated"))
```

Any listeners (e.g. `CartView`) reload their data ensuring an empty cart is reflected immediately.

---

## Running the Example Locally

1. **Install deps** (from the repo root):

```bash
pnpm i   # or npm install / yarn
```

2. **Set environment variables** – create a `.env` file in `examples/spa-guest-checkout` (or export in your shell):

```
VITE_APP_EPCC_ENDPOINT_URL=https://YOUR_EP_DOMAIN.elasticpath.com
VITE_APP_EPCC_CLIENT_ID=YOUR_CLIENT_ID
```

3. **Start Vite dev server**:

```bash
pnpm --filter spa-guest-checkout dev
```

## Key Components

- `CartProvider`: Initializes the cart on application load
- `CartView`: Displays cart contents and manages cart operations
- Cart utilities from SDK: `initializeCart`, `getCartId`

## Getting Started

Follow the setup instructions in the [SPA Authentication Example](../spa-authentication) README for authentication configuration.

### Environment Variables

This example uses the same environment variables as the SPA Authentication example:

```
VITE_APP_EPCC_ENDPOINT_URL=your_endpoint_url
VITE_APP_EPCC_CLIENT_ID=your_client_id
```

## Learn More

- [Cart Management with Elastic Path](https://elasticpath.dev/docs/api/carts/cart-management)
- [Promotions in Elastic Path](https://elasticpath.dev/docs/api/promotions-builder/rule-promotions-api)
