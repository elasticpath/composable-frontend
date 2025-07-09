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
