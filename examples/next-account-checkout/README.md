# Account Checkout Next.js Example

This example showcases how to implement an **account checkout** flow with **Elastic Path Commerce Cloud** in a Next.js application with server-side authentication.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fnext-account-checkout&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL,NEXT_PUBLIC_PASSWORD_PROFILE_ID&project-name=ep-next-account-checkout)

> **Heads-up:** This project can be considered a **hybrid** of the [Shopper Accounts Authentication Example](../shopper-accounts-authentication) and [Guest Checkout SPA Example](../spa-guest-checkout). It combines account authentication with cart management and checkout—providing a more secure, server-side approach to e-commerce checkout flows.

Key capabilities demonstrated:

1. **Account Authentication** – sign-in with an account member's username and password. The account member token is stored in a cookie.
2. **Protected Account Pages** – middleware redirects `/account` to the login page when the token cookie is missing, malformed or expired.
3. **Cart Creation** – the browser creates a cart with the Shopper SDK and an implicit token. The cart is not linked to the account; the account is used only at checkout.
4. **Cart Operations as Server Actions** – add, update, remove, clear, promotion codes and shipping options all run in Next.js server actions.
5. **Account Checkout Form** – captures billing and shipping addresses:
   • _Same as billing_ toggle  
   • Optional _Delivery Instructions_ field (shipping only)  
   • Required-field validation in the browser
6. **Order Creation** – the checkout server action sends the signed-in account's id and its account member token with the checkout request.
7. **Shipping Options** – two fixed options, added to the cart as custom items.
8. **Event-driven Cart Refresh** – operations dispatch a `cart:updated` window event, and the cart provider and cart view listen for it.
9. **Centralized Server-Side API Client Configuration** – `configureClient()` sets the base URL and adds the implicit token from a cookie to each server-side request.

> **Security Considerations:** Checkout needs the account member token, so the example is a Next.js app and sends the checkout request from a server action. The token cookie is not `HttpOnly`, so browser scripts can read it. The example does not use that to call the API from the browser, but a production storefront should set `httpOnly` on the cookie.

---

## Project Structure

```
next-account-checkout/
├── src/
│   ├── app/
│   │   ├── (auth)/login/     # Login page and form
│   │   ├── account/          # Account page (name, email, logout)
│   │   ├── actions.ts        # Server actions for login, cart and checkout
│   │   ├── constants.ts      # Cookie names and endpoint constant
│   │   ├── layout.tsx        # Root layout with CartProvider
│   │   └── page.tsx          # Fetches products and renders the home page
│   ├── components/
│   │   ├── cart-checkout-wrapper.tsx  # Switches between cart and checkout
│   │   ├── cart-provider.tsx    # Creates the cart in the browser and tracks its item count
│   │   ├── cart-view.tsx        # Cart listing, promo codes & shipping options
│   │   ├── checkout-view.tsx    # Checkout form (billing + shipping)
│   │   ├── home-page-content.tsx # Product list beside the cart
│   │   └── product-grid.tsx     # Product display with add-to-cart
│   ├── hooks/
│   │   └── use-auth.ts          # Reads the account member cookie in the browser
│   ├── lib/
│   │   ├── api-client.ts        # Server-side API client configuration
│   │   ├── auth.ts              # Account member cookie helpers and expiry check
│   │   └── return-url.ts        # Validates the post-login return path
│   └── middleware.ts            # Implicit token cookie and /account protection
└── README.md                    # ← you are here
```

## How It Works

### 1. Two Tokens

The example uses two tokens:

- An **implicit token**, issued by `src/middleware.ts` and stored in the `_store_ep_credentials` cookie. Server-side calls such as listing products and cart operations send it as the bearer token (`src/lib/api-client.ts`). The middleware requests a new one when the cookie is missing or expired.
- An **account member token**, issued when a member signs in and stored in the `_store_account_member_token` cookie. The example does not refresh it. Once it expires, `/account` redirects to the login page.

### 2. Cart Initialization

`CartProvider` runs in the browser. It adds the SDK's local storage interceptor, calls the SDK's `initializeCart()`, and reads the cart id back with `getCartId()`. The cart belongs to the implicit token, not to the account.

```tsx
// src/components/cart-provider.tsx
await sdkInitializeCart()
const cartId = getCartId()
```

### 3. Server-Side Cart Operations

Cart operations are Next.js server actions that take the cart id from the browser:

```ts
// src/app/actions.ts
export async function addToCart(productId: string, cartId: string) {
  // calls manageCarts with the implicit token from the cookie
}
```

### 4. Checkout Form

`CheckoutView` manages a structured form state using direct SDK types:

```ts
{
  customer: { email },
  billing_address: { first_name, last_name, line_1, city, region, postcode, country, ... },
  shipping_address: { first_name, last_name, line_1, city, region, postcode, country, instructions, ... },
  sameAsBilling: true
}
```

The form checks required fields before it submits, and uses `satisfies` to keep the address objects aligned with the SDK types. The contact name sent with the order is the billing first and last name. A shopper who is not signed in sees a login prompt instead of the form.

### 5. Shipping Integration

Shipping options are fixed in `src/components/cart-view.tsx`, and `applyShippingOption` adds the chosen one to the cart as a custom item, replacing any earlier shipping item:

```ts
const SHIPPING_OPTIONS = [
  { id: "standard", name: "Standard Shipping", description: "Delivery in 5-7 business days", price_cents: 500 },
  { id: "express", name: "Express Shipping", description: "Delivery in 1-2 business days", price_cents: 1500 },
]
```

### 6. Order Creation

`checkoutWithAccountToken` reads the account id and token from the member cookie, then calls the checkout endpoint with `account: { id }` and the `EP-Account-Management-Authentication-Token` header:

```ts
await checkoutWithAccountToken(cartId, {
  contact: { name, email },
  billing_address,
  shipping_address,
})
```

### 7. Event-Driven Updates

After successful operations, the app broadcasts cart updates:

```ts
window.dispatchEvent(new Event("cart:updated"))
```

`CartProvider` and `CartView` listen for the event and reload the cart.

---

## Store Setup Requirements

### Required

- **A store API key that can issue an implicit token.** The middleware asks for an implicit token and keeps it in a cookie, and the browser initialises the cart with the same client id (`src/middleware.ts`, `src/components/cart-provider.tsx`). Create it in Commerce Manager, Application Keys, and set `NEXT_PUBLIC_EPCC_CLIENT_ID` to its client id. It needs no secret. A missing client id, or a token the store refuses, fails the request with a 500.
- **A published catalog with products that have prices.** The home page reads `getByContextAllProducts` (`src/app/page.tsx`), and the cart and checkout show `meta.display_price.with_tax.formatted`. The SDK returns an `{ error }` and the page does not read it, so an unpublished catalog and a failed call both show "Storefront not authenticated" with no products.
- **A password profile on an authentication realm.** Sign-in calls `postV2AccountMembersTokens` with the password mechanism and `NEXT_PUBLIC_PASSWORD_PROFILE_ID` (`src/app/actions.ts`). Create the profile in Commerce Manager and copy its id. A missing id or profile appears as "Failed to login, make sure your email and password are correct", because the sign-in does not read the API's error.
- **An account with at least one account member.** The member signs in, and the account id from the token goes into the checkout (`src/app/actions.ts`). The example takes the first token the sign-in returns. Create the account and member in Commerce Manager.

### Optional

- **A promotion with a code.** Only if the shopper enters a code does the cart apply a `promotion_item` (`src/app/actions.ts`). Without a promotion, a code is rejected and the cart view shows the API's message.
- **Shipping.** The two shipping options, standard and express, are fixed in the example (`src/components/cart-view.tsx`) and added to the cart as custom items. They need nothing from the store.
- **A payment gateway.** Not needed. Checkout creates the order with `account: { id }` and the member's account token (`src/app/actions.ts`) and leaves it unpaid; there is no payment step. A failed checkout shows "Failed to create order".

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
```

- `NEXT_PUBLIC_EPCC_ENDPOINT_URL`: the store's API base URL, passed to the SDK as its base URL, so it must include `https://`. This differs from `examples/core`, which expects a bare host name.
- `NEXT_PUBLIC_EPCC_CLIENT_ID`: the client id of an implicit store API key. It has no secret.
- `NEXT_PUBLIC_PASSWORD_PROFILE_ID`: the id of the password profile members sign in against. If it is empty, every sign-in fails.

Next.js inlines `NEXT_PUBLIC_` values when it builds. After you change one, rebuild before `next start`.

3. **Start Next.js dev server**:

```bash
pnpm --filter next-account-checkout dev
```

## Key Components

- `CartProvider`: Creates the cart in the browser and keeps the cart id and item count
- `CartView`: Displays cart contents, shipping options, and promotion code management
- `CheckoutView`: Checkout form with browser-side required-field checks
- `ProductGrid`: Product display with add-to-cart through a server action
- Server Actions: Cart operations with the implicit token, and checkout and address lookup with the account member token

## Authentication Flow

1. **Login**: the `login` server action calls `postV2AccountMembersTokens` with the password mechanism and the password profile id.
2. **Token Storage**: the action stores the first returned token, with account id, email and name, in the `_store_account_member_token` cookie until the token expires.
3. **Route Protection**: `src/middleware.ts` redirects `/account` to `/login?returnUrl=...` when the cookie is missing, unparseable or expired.
4. **Checkout**: the home page passes whether the cookie exists to `CheckoutView`. Without it the checkout shows a login prompt. With it, the checkout server action sends the account id and token.
5. **Logout**: the `logout` server action deletes the cookie.

## Security Considerations

- The account member token cookie is set without `httpOnly` and `secure`, so browser scripts can read it. Set both for production.
- The cookie uses `sameSite: "strict"`.
- Checkout reads the token on the server and sends it from the server action.
- The post-login return path must start with `/` and stay on the same origin (`src/lib/return-url.ts`).
- Validation is limited to browser-side required-field checks. The server action does not validate the addresses.

## Learn More

To learn more about EPCC account authentication, visit the [Elastic Path documentation](https://documentation.elasticpath.com/commerce-cloud/docs/developer/authentication/index.html).
