# PayPal Express Checkout Example

This example demonstrates how to integrate **PayPal Express Checkout** with **Elastic Path Commerce Cloud** in a Next.js storefront. It showcases a complete checkout flow with PayPal as the payment method.

## Key Features

- **PayPal Express Integration** – seamless checkout using PayPal's Express Checkout API
- **Server Actions** – secure payment processing using Next.js server actions
- **Complete Checkout Flow** – from cart to order confirmation with PayPal payment
- **Error Handling** – comprehensive error states for payment failures and cancellations
- **Order Status Management** – automatic order completion after successful PayPal payment

## Tech Stack

- [Elastic Path](https://www.elasticpath.com/products): Composable commerce platform
- [PayPal SDK](https://developer.paypal.com/sdk/js/): PayPal's JavaScript SDK for Express Checkout
- [Next.js](https://nextjs.org/): React framework with server-side capabilities
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework

## Store Setup Requirements

Nothing in this repository provisions the store for this example. Set up each item in Commerce Manager or through the Elastic Path APIs.

### Required

- **An application key with a client ID.** `src/lib/middleware/implicit-auth-middleware.ts` requests an implicit access token with `NEXT_PUBLIC_EPCC_CLIENT_ID` and keeps it in a cookie. Without the variable every page redirects to `/configuration-error`. Create an application key in Commerce Manager and copy its client ID. The browser and the middleware need only the client ID. The secret is the next entry.
- **A client secret for the same application key, held on the server.** After PayPal sends the shopper back, `src/app/(checkout)/checkout/payment/[orderId]/actions.ts` and `src/app/(checkout)/checkout/payment/success/page.tsx` request a `client_credentials` token with `NEXT_PUBLIC_EPCC_CLIENT_ID` and `EPCC_CLIENT_SECRET`. They use it to list the order's transactions, find the PayPal transaction and read an anonymous order's items. Copy the secret from the same application key in Commerce Manager. Elastic Path store keys are not scoped to endpoints, so this key can do more than the example needs. Keep it out of anything the browser can see.
- **A published catalog with priced products.** The product list, the product page, the search page and the navigation menu all read the shopper catalog (`getByContextAllProducts` and `getByContextProduct` in `src/app/(store)/search/[[...node]]/page.tsx` and `src/app/(store)/products/[productId]/page.tsx`, `getByContextAllHierarchies` in `src/lib/build-site-navigation.ts`), so they see only what a published catalog exposes. Publish a catalog in Commerce Manager. Prices come from the price book the catalog uses.
- **Multi-location inventory with stock for each product.** The client adds the `EP-Inventories-Multi-Location: true` header to every request (`src/lib/create-elastic-path-client.ts`), and the product page calls `getStock`. `SimpleProductContent.tsx`, `VariationProductContent.tsx` and `BundleProductContent.tsx` disable Add to Cart when the response has no `locations` or the chosen location has less than one available. Create stock locations and set stock for each product in Commerce Manager.
- **The PayPal Express Checkout gateway enabled and connected to a PayPal account.** Checkout converts the cart to an order and calls `paymentSetup` with `gateway: "paypal_express_checkout"` and return and cancel URLs (`src/app/(checkout)/checkout/actions.ts`). The return page then calls `confirmPayment` with the same gateway. Enable the gateway in Commerce Manager under payment settings and enter the credentials of a PayPal account there. For testing, use a PayPal sandbox account. The example reads no PayPal credential itself.
- **A currency in the store whose code matches `NEXT_PUBLIC_DEFAULT_CURRENCY_CODE`.** Checkout calls `getAllCurrencies` (`src/app/(checkout)/checkout/page.tsx`) and looks the currency up by that code (`CheckoutSidebar.tsx`, `ConfirmationSidebar.tsx`) to format the shipping amount and the order total with shipping. The code defaults to `USD`. Without a match, the total with shipping does not render. Add the currency in Commerce Manager.

### Optional

- **A hierarchy with nodes in the catalog.** `buildSiteNavigation` builds the header menu from the first four hierarchies and their child nodes, and the search page builds its node menu from the same data. Without hierarchies the menu has no entries, the Category heading above the node menu is hidden, and the search page still lists every product in the catalog. Create hierarchies and nodes in Commerce Manager and include them in the catalog.
- **Account sign-in and registration.** `NEXT_PUBLIC_PASSWORD_PROFILE_ID` is the ID of a password profile on an authentication realm (`src/app/(auth)/actions.ts`). The sign-in page, the registration page and the "create an account" option at guest checkout use it. The account pages (summary, addresses, orders) need a signed-in shopper. Without the ID the pages still render, but sign-in and registration fail and the guest checkout option fails to register the shopper. Browsing, the cart and guest checkout without an account work. Create a password profile in Commerce Manager and copy its ID.
- **Product main images.** `Hit.tsx` and the featured products show the product's main image. A product without one shows a placeholder icon.
- **Variation and bundle products.** The product page picks its layout from the product type (`meta.product_types[0]` in `src/app/(store)/products/[productId]/page.tsx`): standard, bundle, parent or child. A catalog with only standard products works, and the variation and bundle layouts never render.
- **Product extensions.** `ProductExtensions.tsx` lists the entries in a product's `extensions` attribute. A product without extensions shows no such section.
- **Promotions.** The cart sidebar has a promotion code field that adds the code with `manageCarts` (`src/components/checkout-sidebar/actions.ts`). Without a matching promotion in the store the code is not applied. The action does not check the response, so the shopper still sees a success message.

## Environment variables

Set these in `.env.local` or in your host's environment settings. The repository has no `.env.example` for this example. `NEXT_PUBLIC_` variables are inlined at build time, so rebuild after changing one.

| Variable | Needed | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_EPCC_CLIENT_ID` | Yes | Client ID of an application key. Read in `src/lib/middleware/implicit-auth-middleware.ts`. |
| `NEXT_PUBLIC_EPCC_ENDPOINT_URL` | Yes | The API host without a scheme, for example `useast.api.elasticpath.com`. The code adds `https://` itself (`src/lib/create-elastic-path-client.ts`), so a value that starts with `https://` produces a broken URL. |
| `NEXT_PUBLIC_PASSWORD_PROFILE_ID` | For sign-in | ID of the password profile used for sign-in, registration and account creation at checkout. |
| `NEXT_PUBLIC_SITE_NAME` | No | Site name used in the page title of the checkout and sign-in pages and in the logo's accessible label. |
| `SITE_NAME` | No | Site name used in the page title of the store pages (`src/app/(store)/layout.tsx`). It has no `NEXT_PUBLIC_` prefix, so it is separate from `NEXT_PUBLIC_SITE_NAME`. Set both to the same value. |
| `NEXT_PUBLIC_COOKIE_PREFIX_KEY` | No | Prefix of the cookie names (`<prefix>_ep_credentials`, `<prefix>_ep_cart`, `<prefix>_ep_account_member_token`). Defaults to `_store`. |
| `NEXT_PUBLIC_DEFAULT_CURRENCY_CODE` | No | Currency code the checkout formats totals in. Defaults to `USD`. A `<prefix>_ep_currency` cookie, if present, overrides it. |
| `NEXT_PUBLIC_VERCEL_URL` | No | Set by Vercel. The deployment host without a scheme, used as `metadataBase`. Defaults to `http://localhost:3000`. |
| `EPCC_CLIENT_SECRET` | Yes | Client secret of the application key. Server only: it has no `NEXT_PUBLIC_` prefix and must stay out of browser code. |
| `NEXT_PUBLIC_SITE_URL` | No | Origin used for the PayPal return and cancel URLs when the request headers give no origin, for example `https://shop.example.com` (with a scheme, unlike the endpoint). Defaults to `http://localhost:3000`. |

## Implementation Highlights

### Payment Flow

1. **Checkout Initiation** – User proceeds to checkout with items in cart
2. **PayPal Order Creation** – Server creates a PayPal order matching the Elastic Path order
3. **PayPal Authorization** – User authorizes payment through PayPal
4. **Payment Capture** – Server captures the authorized payment
5. **Order Completion** – Elastic Path order is marked as complete

### Key Components

- `checkout/payment/[orderId]/page.tsx` – PayPal payment interface
- `checkout/actions.ts` – Server actions for payment processing
- `checkout/payment/[orderId]/actions.ts` – Handles PayPal payment confirmation

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and add items to cart to test the PayPal checkout flow.

## Current Feature Set

| **Feature**                  | **Status** | **Notes**                                           |
|------------------------------|------------|-----------------------------------------------------|
| PayPal Express Checkout      | ✅          | Full integration with order creation and capture    |
| Guest Checkout               | ✅          | No account required for purchase                    |
| Account Checkout             | ✅          | Registered users can checkout with saved details    |
| Error Handling               | ✅          | Comprehensive error states and user feedback        |
| Order Confirmation           | ✅          | Success page with order details                     |
| Payment Status Tracking      | ✅          | Real-time updates during payment process            |