# Account Checkout Next.js Example

This example showcases how to implement an **account checkout** flow with **Elastic Path Commerce Cloud** in a Next.js application with server-side authentication.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fnext-account-checkout&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL,NEXT_PUBLIC_PASSWORD_PROFILE_ID,NEXT_PUBLIC_APP_URL&project-name=ep-next-account-checkout)

> **Heads-up:** This project can be considered a **hybrid** of the [Shopper Accounts Authentication Example](../shopper-accounts-authentication) and [Guest Checkout SPA Example](../spa-guest-checkout). It combines account authentication with cart management and checkout—providing a more secure, server-side approach to e-commerce checkout flows.

Key capabilities demonstrated:

1. **Account Authentication** – secure login with server-side token management using HttpOnly cookies.
2. **User Login** – complete authentication flow with EPCC's account members API.
3. **Protected Account Pages** – route protection ensuring authenticated access to account features.
4. **Session Management** – automatic token refresh and secure session handling with cookies.
5. **Cart Persistence** – automatically creates / retrieves a cart via the Shopper SDK with account association.
6. **Account Checkout Form** – captures billing & shipping addresses with account token security:
   • _Same as billing_ toggle  
   • Optional _Delivery Instructions_ field (shipping only)
   • **Server-side validation** and checkout processing
7. **Order Creation** – converts a cart to an order using account tokens for enhanced security.
8. **Shipping Options** – integrated shipping selection with real-time pricing updates.
9. **Event-driven Cart Refresh** – broadcasts a `cart:updated` custom event so any part of the app can update after operations.
10. **Centralized API Client Configuration** – server-side API calls with consistent authentication patterns.

> **Security Considerations:** Unlike the SPA guest checkout example, this is a Next.js implementation. This is because account checkout necessarily uses account tokens. Account tokens have elevated permissions compared to implicit tokens, so using them server-side only via Next.js server actions, is safer.

---

## Project Structure

```
next-account-checkout/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication pages (login/register/password-reset)
│   │   ├── account/          # Account management pages
│   │   ├── api/webhooks/     # Webhook endpoints for notifications
│   │   ├── actions.ts        # Server actions for cart/checkout operations
│   │   ├── layout.tsx        # Root layout with CartProvider
│   │   └── page.tsx          # Main page with product grid + cart
│   ├── components/
│   │   ├── cart-provider.tsx    # Initializes / persists cart with account context
│   │   ├── cart-view.tsx        # Cart listing, promo codes & shipping options
│   │   ├── checkout-view.tsx    # Account checkout form (billing + shipping)
│   │   ├── product-grid.tsx     # Product display with add-to-cart
│   │   └── ui.tsx              # Reusable UI components
│   └── lib/
│       ├── auth.ts             # Authentication helpers
│       ├── auth-client.tsx     # Client-side auth context
│       └── api-client.ts       # Server-side API client configuration
└── README.md                   # ← you are here
```

## How It Works

### 1. Account Authentication & Cart Initialization

The app combines account authentication with cart management. On app load, if a user is authenticated, their account token is used to create/retrieve a cart with enhanced permissions:

```tsx
// src/components/cart-provider.tsx
useEffect(() => {
  initializeCart() // Uses account token if available
}, [])
```

Account tokens provide elevated security compared to implicit tokens, enabling secure checkout operations.

### 2. Server-Side Cart Operations

All cart operations use Next.js server actions with account token authentication:

```ts
// src/app/actions.ts
export async function addToCart(productId: string, quantity: number = 1) {
  // Server-side operation with account token security
}
```

### 3. Account Checkout Form

`CheckoutView` manages a structured form state using direct SDK types:

```ts
{
  customer: { email },
  billing_address: { first_name, last_name, line_1, city, region, postcode, country },
  shipping_address: { first_name, last_name, line_1, city, region, postcode, country, instructions },
  sameAsBilling: true
}
```

The form uses SDK field names directly with `satisfies` validation for type safety.

### 4. Shipping Integration

Shipping options are managed as custom cart items, for example purposes:

```ts
const SHIPPING_OPTIONS = [
  { id: "standard", name: "Standard Shipping", price_cents: 500 },
  { id: "express", name: "Express Shipping", price_cents: 1500 },
]
```

### 5. Secure Order Creation

Account checkout uses the account token:

```ts
await checkoutWithAccountToken({
  cartId,
  customer: form.customer,
  billing_address: form.billing_address,
  shipping_address: finalShippingAddress,
})
```

### 6. Event-Driven Updates

After successful operations, the app broadcasts cart updates:

```ts
window.dispatchEvent(new Event("cart:updated"))
```

Any listeners automatically refresh their data, ensuring UI consistency.

---

## Store Setup Requirements

### Required

- **A store API key that can issue an implicit token.** The middleware asks for an implicit token and keeps it in a cookie, and the browser initialises the cart with the same client id (`src/middleware.ts`, `src/components/cart-provider.tsx`). Create it in Commerce Manager, Application Keys, and set `NEXT_PUBLIC_EPCC_CLIENT_ID` to its client id. It needs no secret. A missing client id, or a token the store refuses, fails the request with a 500.
- **A published catalog with products that have prices.** The home page reads `getByContextAllProducts` (`src/app/page.tsx`), and the cart and checkout show `meta.display_price.with_tax.formatted`. The SDK returns an `{ error }` and the page does not read it, so an unpublished catalog and a failed call both show "Storefront not authenticated" with no products.
- **A password profile on an authentication realm.** Sign-in calls `postV2AccountMembersTokens` with the password mechanism and `NEXT_PUBLIC_PASSWORD_PROFILE_ID` (`src/app/actions.ts`). Create the profile in Commerce Manager and copy its id. A missing id or profile appears as "Failed to login, make sure your email and password are correct", because the sign-in does not read the API's error.
- **An account with at least one account member.** The member signs in, and the account id from the token goes into the checkout (`src/app/actions.ts`). The example takes the first token the sign-in returns. Create the account and member in Commerce Manager.
- **The cart and checkout endpoints.** The example creates a cart, adds, updates and removes items, and checks out with `account: { id }` and the member's account token (`src/app/actions.ts`). They need no store setting. A failed checkout shows "Failed to create order". There is no payment step: the order is created and left unpaid, so no payment gateway is needed.

### Optional

- **A promotion with a code.** Only if the shopper enters a code does the cart apply a `promotion_item` (`src/app/actions.ts`). Without a promotion, a code is rejected and the cart view shows the API's message.
- **Shipping.** The two shipping options, standard and express, are fixed in the example (`src/components/cart-view.tsx`) and added to the cart as custom items. They need nothing from the store.

## Running the Example Locally

1. **Install deps** (from the repo root):

```bash
pnpm i   # or npm install / yarn
```

2. **Set environment variables** – create a `.env.local` file in `examples/next-account-checkout`:

```
NEXT_PUBLIC_EPCC_ENDPOINT_URL=https://euwest.api.elasticpath.com
NEXT_PUBLIC_EPCC_CLIENT_ID=your_client_id
NEXT_PUBLIC_PASSWORD_PROFILE_ID=your_password_profile_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- `NEXT_PUBLIC_EPCC_ENDPOINT_URL`: the store's API base URL, passed to the SDK as its base URL, so it must include `https://`. This differs from `examples/core`, which expects a bare host name.
- `NEXT_PUBLIC_EPCC_CLIENT_ID`: the client id of an implicit store API key. It has no secret.
- `NEXT_PUBLIC_PASSWORD_PROFILE_ID`: the id of the password profile members sign in against. If it is empty, every sign-in fails.

Next.js inlines `NEXT_PUBLIC_` values when it builds. After you change one, rebuild before `next start`.

3. **Start Next.js dev server**:

```bash
pnpm --filter next-account-checkout dev
```

### Authentication Flow

## Key Components

- `CartProvider`: Initializes cart with account context and manages authentication state
- `CartView`: Displays cart contents, shipping options, and promotion code management
- `CheckoutView`: Account checkout form with server-side validation
- `ProductGrid`: Product display with secure add-to-cart operations
- Server Actions: Secure cart/checkout operations using account tokens

## Authentication Flow

1. **Login**: Users authenticate via account member API
2. **Token Storage**: Account tokens stored in HttpOnly cookies (server-side only)
3. **Cart Association**: Cart operations use account tokens for enhanced security
4. **Protected Checkout**: Checkout requires authentication and uses account privileges
5. **Session Management**: Automatic token refresh and secure session handling

## Security Considerations

- **Account tokens** provide elevated permissions compared to implicit tokens
- **Server-side operations** prevent token exposure to client
- **HttpOnly cookies** protect against XSS attacks
- **Server actions** ensure secure cart/checkout processing
- **Form validation** performed on both client and server

## Learn More

To learn more about EPCC account authentication, visit the [Elastic Path documentation](https://documentation.elasticpath.com/commerce-cloud/docs/developer/authentication/index.html).
