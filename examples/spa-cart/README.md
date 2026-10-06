# Shopping Cart Management Example

This example demonstrates how to implement a complete shopping cart management system for Elastic Path Commerce Cloud. It builds upon the authentication approach shown in the [SPA Authentication Example](../spa-authentication) by adding cart persistence and management functionality.

## Overview

This example focuses on:

- **Cart Initialization**: Automatically creating or retrieving a persistent cart
- **Cart Operations**: Adding, updating, and removing items from the cart
- **Promotions Management**: Applying and removing promotion codes
- **Cart Totals**: Displaying subtotals, taxes, discounts, and shipping costs

## Cart Utilities

The example uses several cart utilities from the `@epcc-sdk/sdks-shopper` package:

1. **Initialize Cart**: Automatically creates a new cart or retrieves an existing one.

   ```typescript
   // src/auth/CartProvider.tsx
   useEffect(() => {
     initializeCart()
   }, [])
   ```

2. **Get Cart ID**: Retrieves the current cart ID from local storage.

   ```typescript
   const cartId = getCartId()
   ```

## Cart Operations

### Adding Items to Cart

```typescript
// Add an item to cart
await manageCarts({
  path: { cartID: cartId },
  body: {
    data: {
      type: "cart_item",
      id: productId,
      quantity: 1,
    },
  },
})
```

### Updating Item Quantities

```typescript
// Update an item quantity
await updateACartItem({
  path: { cartID: cartId, cartitemID: itemId },
  body: {
    data: {
      id: itemId,
      quantity: newQuantity,
    },
  },
})
```

### Removing Items

```typescript
// Remove an item from cart
await deleteACartItem({
  path: { cartID: cartId, cartitemID: itemId },
})
```

## Promotion Management

### Applying a Promotion Code

```typescript
// Apply a promotion code
await manageCarts({
  path: { cartID: cartId },
  body: {
    data: {
      type: "promotion_item",
      code: promoCode,
    },
  },
})
```

### Removing a Promotion

```typescript
// Remove a promotion
await deleteAPromotionViaPromotionCode({
  path: { cartID: cartId, promoCode: code },
})
```

## Cart State Management

This example uses a custom event system to refresh the cart state after operations:

```typescript
// Define custom event
const CART_UPDATED_EVENT = "cart:updated"

// Dispatch event after cart operations
window.dispatchEvent(new Event(CART_UPDATED_EVENT))

// Listen for cart update events
useEffect(() => {
  window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate)
  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate)
  }
}, [])
```

## Cart Data Fetching

The example fetches cart data with included relationships:

```typescript
const response = await getCart({
  path: {
    cartID: cartId,
  },
  query: {
    include: ["items"],
  },
})
```

## Cart Pricing Information

The example extracts and displays comprehensive pricing information from the cart response:

```typescript
const pricing = cart.data.meta.display_price

return {
  total: pricing.with_tax?.formatted || "$0.00",
  subtotal: pricing.without_discount?.formatted || "$0.00",
  discount: pricing.discount?.formatted || "$0.00",
  tax: pricing.tax?.formatted || "$0.00",
  shipping: pricing.shipping?.formatted || "$0.00",
  hasDiscount: (pricing.discount?.amount || 0) < 0,
}
```

## Key Components

- `CartProvider`: Initializes the cart on application load
- `CartView`: Displays cart contents and manages cart operations
- Cart utilities from SDK: `initializeCart`, `getCartId`

## Store Setup Requirements

### Required

- **An application key (client ID) for implicit authentication.** `src/auth/StorefrontProvider.tsx` throws "Missing storefront client id" if `VITE_APP_EPCC_CLIENT_ID` is unset, which leaves a blank page. Create the key in Commerce Manager (Application Keys) and copy its client ID.
- **A published catalog with products that have a price in the shopper's currency.** `src/App.tsx` lists products with `getByContextAllProducts` and adds one to the cart with `manageCarts` as a `cart_item`. `src/components/CartView.tsx` renders totals from the cart's `meta.display_price`. Publish a catalog and set prices in Commerce Manager, or with the Catalogs and Pricebooks APIs.
- **The Carts API.** `initializeCart` in `src/auth/CartProvider.tsx` creates a cart named "Storefront cart" and keeps its ID in local storage. `CartView.tsx` reads the cart with its items and updates or deletes items. No store setting is needed beyond the application key.

### Optional

- **A promotion with a promotion code** (a rule promotion or a standard promotion). `CartView.tsx` applies a code as a `promotion_item` and removes it with `deleteAPromotionViaPromotionCode`. Without a matching promotion, entering a code changes nothing: the SDK returns an `error` that the example does not read, so the input clears as if the code had worked and the "Invalid promotion code" message does not appear.
- **Tax and shipping configuration.** The example sets up neither. The tax and shipping lines show whatever the cart's `display_price` carries and fall back to "$0.00" when absent.

## Getting Started

### Environment Variables

Create a file named `.env` in the root of the `examples/spa-cart` directory with these variables:

```bash
VITE_APP_EPCC_ENDPOINT_URL=https://useast.api.elasticpath.com
VITE_APP_EPCC_CLIENT_ID=your_client_id
```

- `VITE_APP_EPCC_ENDPOINT_URL` (required): the API host for your store's region, including `https://`. The SDK uses it as the base URL for every request, so a bare host without the scheme is fetched as a relative URL and fails.
- `VITE_APP_EPCC_CLIENT_ID` (required): the client ID of the application key described above.

These are the same variables as in the [SPA Authentication Example](../spa-authentication). Vite inlines `VITE_` variables at build time, so restart the dev server or rebuild after you change them.

## Learn More

- [Cart Management with Elastic Path](https://elasticpath.dev/docs/api/carts/cart-management)
- [Promotions in Elastic Path](https://elasticpath.dev/docs/api/promotions-builder/rule-promotions-api)
