# Subscription Elastic Path storefront starter

This storefront accelerates the development of a subscription-based ecommerce experience using Elastic Path and Stripe. It demonstrates how to browse subscription offerings, purchase them via Stripe, and manage active subscriptions from an account dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fsubscriptions&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL,PASSWORD_PROFILE_ID,EPCC_CLIENT_SECRET,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,NEXT_PUBLIC_STRIPE_ACCOUNT_ID,STRIPE_RESTRICTED_KEY&project-name=elastic-path-subscription-storefront&repository-name=elastic-path-subscription-storefront)

## Tech Stack

- [Elastic Path](https://www.elasticpath.com/products): A family of composable products for businesses that need to quickly & easily create unique experiences and next-level customer engagements that drive revenue.

- [Elastic Path Gen 2 Sdk](https://www.npmjs.com/package/@epcc-sdk/sdks-shopper): A set of SDKs that provide a simple way to interact with Elastic Path Commerce Cloud APIs.

- [Stripe](https://stripe.com/): Payment processing platform used for purchasing subscriptions, managing recurring billing, and updating payment methods via Elastic Path Payments powered by Stripe.

- [Next.js](https://nextjs.org/): a React framework for building static and server-side rendered applications

- [Tailwind CSS](https://tailwindcss.com/): enabling you to get started with a range of out the box components that are
  easy to customize

- [Radix UI Primitives](https://www.radix-ui.com/primitives): Unstyled, accessible, open source React primitives for high-quality web apps and design systems.

- [Typescript](https://www.typescriptlang.org/): a typed superset of JavaScript that compiles to plain JavaScript

## Store Setup Requirements

Nothing here is provisioned by the example: it has no provisioning script and no `.env.example`. It reads no catalog, so it needs no published catalog or products.

### Required

- **One store API key whose secret works for both the implicit and the client_credentials grants.** `NEXT_PUBLIC_EPCC_CLIENT_ID` and `EPCC_CLIENT_SECRET` hold it. The implicit token reads subscription offerings (`src/middleware.ts`). The client_credentials token creates the guest cart, associates carts with accounts, updates the account's Stripe customer id, sets the payment intent at checkout and updates a subscription's payment authority (`src/middleware.ts`, `src/app/login/actions.ts`, `src/app/register/actions.ts`, `src/app/register/sync-ep-payments.ts`, `src/app/api/checkout/route.ts`, `src/app/account/actions.ts`). Create it in Commerce Manager, Application Keys. A missing client id fails every request with a 500. A missing or wrong secret makes the middleware throw on the first request that has no cart cookie.
- **Subscription offerings with plans and pricing options.** `/subscriptions` lists the first offering with its plans, pricing options and features (`src/app/subscriptions/page.tsx`). The Subscriptions feature must be available on the store. With no offering, or one without plans, the page shows "No subscription plans are currently available" and nothing can be bought. Create them in Commerce Manager or through the Subscriptions API.
- **A password profile that allows self sign-up, on an authentication realm.** Sign-in uses the `password` mechanism and registration uses `self_signup` with the profile in `PASSWORD_PROFILE_ID` (`src/app/login/actions.ts`, `src/app/register/actions.ts`). Create it in Commerce Manager and copy its id. If the variable is empty, login and registration show "Server configuration error".
- **A `stripe-account-id` field on accounts, holding a string.** Registration writes the shopper's Stripe customer id to it, and checkout, the payment method update and the setup intent read it (`src/app/register/sync-ep-payments.ts`, `src/app/api/checkout/route.ts`, `src/app/api/setup-intent/route.ts`, `src/app/account/actions.ts`). Add the field to accounts in the store before anyone registers. If it is missing, whether the write errors or drops the id cannot be told from the code. Without a stored id, the setup intent returns "No Stripe customer found" and the payment method update fails.
- **Elastic Path Payments powered by Stripe, with the `elastic_path_payments_stripe` gateway enabled and connected to a Stripe account.** Checkout and the payment method update create their payment intents through it (`src/app/api/checkout/route.ts`, `src/app/account/actions.ts`). A payment error comes back as the API's message. Set up the gateway in Commerce Manager, then put the connected account's id in `NEXT_PUBLIC_STRIPE_ACCOUNT_ID`.
- **The cart, account and order features.** The example uses account-associated carts, account checkout, `confirmOrder`, account orders and subscription state changes (`src/app/api/checkout/route.ts`, `src/app/account/page.tsx`). They need no store setting beyond the above. After checkout the example polls `listSubscriptions` up to six times for each subscription offering in the cart. If none appears in time it returns "Request timed out", even though the order exists.

### Optional

None. Every feature of this example needs the requirements above.

## Environment variables

Set these in `.env.local`. The example has no `.env.example`.

| Variable                             | Where it is used      | What it is                                                                                                                                                                                                                                       |
| ------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_EPCC_ENDPOINT_URL`      | Server and middleware | The store's API base URL. It is the SDK base URL and the start of a raw subscription request, so it must include `https://`, for example `https://euwest.api.elasticpath.com`. This differs from `examples/core`, which expects a bare host name |
| `NEXT_PUBLIC_EPCC_CLIENT_ID`         | Server and middleware | The client id of the store API key, used for both the implicit and the client_credentials grants                                                                                                                                                 |
| `EPCC_CLIENT_SECRET`                 | Server only           | The secret of that same key. Never prefix it with `NEXT_PUBLIC_`                                                                                                                                                                                 |
| `PASSWORD_PROFILE_ID`                | Server only           | The id of the password profile for sign-in and registration. It has no `NEXT_PUBLIC_` prefix, unlike the same setting in the other account examples                                                                                              |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser               | The Stripe publishable key, `pk_...`, for Stripe.js on the checkout and account pages                                                                                                                                                            |
| `NEXT_PUBLIC_STRIPE_ACCOUNT_ID`      | Browser and server    | The id of the Stripe account connected to Elastic Path Payments, `acct_...`                                                                                                                                                                      |
| `STRIPE_RESTRICTED_KEY`              | Server only           | A Stripe restricted key, `rk_...`, that can create customers and setup intents                                                                                                                                                                   |
| `NEXT_PUBLIC_SITE_NAME`              | Browser               | Optional. The text of the logo's accessible label. If it is unset the label reads "undefined logo"                                                                                                                                               |

Next.js inlines `NEXT_PUBLIC_` values when it builds. After you change one, rebuild before `next start`.
## Getting Started

Run the development server:

```bash
pnpm dev
# or
yarn dev
# or
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page will hot reload as you edit the file.

## Deployment

Deployment is typical for a Next.js site. We recommend using a provider
like [Netlify](https://www.netlify.com/blog/2020/11/30/how-to-deploy-next.js-sites-to-netlify/)
or [Vercel](https://vercel.com/docs/frameworks/nextjs) to get full Next.js feature support.

## How It Works

### `/subscriptions` — Browse Offerings

The subscriptions page fetches subscription offerings from the EPCC [Subscriptions API](https://elasticpath.dev/docs/api/subscriptions/subscriptions-introduction) including their plans, pricing options, and features:

```typescript
const response = await listOfferings({
    query: {
        include: ['plans', 'pricing_options', 'features'] as const
    }
});

const offerings = response.error ? null : {
    data: response.data?.data?.[0],
    included: response.data?.included
};
```

This implementation picks the first offering returned by the API, which works well for a demo store with a single offering configured. In a real-world storefront you might display the full list of offerings and allow the subscriber to pick one — `listOfferings` already returns all available offerings, so you can pass the full `data` array to your UI and let the user choose before proceeding to plans and pricing.

Helper functions in `src/lib/offering-helpers.ts` extract and format the included data — `getPlans()`, `getPricingOptions()`, `getFeatures()`, and price formatting utilities.

### `/cart` — Subscription Cart

**Adding a subscription to the cart** uses `manageCarts()` with the special `subscription_item` type. The `subscription_configuration` ties the item to a specific plan and pricing option:

```typescript
const body = {
    data: {
        type: 'subscription_item' as const,
        quantity: 1,
        id: offeringId,
        subscription_configuration: {
            plan: planId,
            pricing_option: pricingOptionId
        }
    }
};

await manageCarts({
    path: { cartID: cartId },
    body
});
```

**Rendering the cart** fetches the cart with included items, then calls `getOffering()` for each subscription item to resolve human-readable plan and pricing option names:

```typescript
const response = await getACart({
    path: { cartID: cartId },
    query: {
        include: ['items', 'tax_items', 'custom_discounts', 'promotions'] as const
    }
});
```

### `/checkout` — Stripe Payment & Order Creation

Checkout uses [Elastic Path Payments powered by Stripe](https://elasticpath.dev/docs/payments/ep-payments/ep-payments-overview). On the client side, Stripe Elements collects payment and billing address details. The `setup_future_usage: "off_session"` flag enables recurring billing for subscription renewals.

The server-side checkout flow (`src/app/api/checkout/route.ts`) orchestrates multiple steps:

**Step 1 — Create a payment intent on the cart:**

```typescript
await createCartPaymentIntent({
    path: { cartID: cartId },
    body: {
        data: {
            gateway: "elastic_path_payments_stripe",
            method: "purchase",
            options: {
                automatic_payment_methods: { enabled: true },
                confirm: true,
                confirmation_token: confirmationTokenId,
                receipt_email: memberEmail,
                customer: stripeCustomerId,
                setup_future_usage: "off_session",
            }
        }
    }
});
```

**Step 2 — Checkout the cart to create an order:**

```typescript
await checkoutApi({
    path: { cartID: cartId },
    body: {
        data: {
            account: { id: accountId, member_id: memberId },
            contact: { email: memberEmail, name: memberName },
            billing_address: { /* ... */ },
            shipping_address: { /* ... */ }
        }
    }
});
```

**Step 3 — Confirm the order** to sync with Elastic Path Payments:

```typescript
await confirmOrder({
    path: { orderID: orderId },
    body: {
        data: {
            options: {
                metadata: {
                    order_id: orderId,
                    statement_descriptor: "Confirmed intent"
                }
            }
        }
    }
});
```

**Steps 4-7** handle cart cleanup (dissociate, delete, create new cart), poll `listSubscriptions()` until the subscription is active, and refresh the account member token.

### `/account` — Manage Subscriptions

The account page fetches the user's subscriptions and order history:

```typescript
const subscriptions = await listSubscriptions({
    query: {
        include: ["plans", "pricing_options"]
    }
});

const ordersResponse = await getCustomerOrders({
    query: {
        include: ['items'] as const,
        sort: '-created_at',
        page: { limit: 10 }
    }
});
```

**Cancelling a subscription** creates a subscription state change:

```typescript
await createSubscriptionState({
    path: { subscription_uuid: subscriptionId },
    body: {
        data: {
            type: 'subscription_state',
            attributes: {
                action: 'cancel'
            }
        }
    }
});
```

**Updating a payment method** is a multi-step process involving both Stripe and EPCC:

1. The server creates a Stripe SetupIntent for the customer:

```typescript
const stripe = new Stripe(process.env.STRIPE_RESTRICTED_KEY!, {
    stripeAccount: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID!,
});

const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    automatic_payment_methods: { enabled: true },
    usage: 'off_session',
});
```

2. The client collects the new card via Stripe's `PaymentElement` and confirms with `stripe.confirmSetup()`.

3. The server updates the subscription's payment authority with the new payment method:

```typescript
await fetch(`${baseUrl}/v2/subscriptions/subscriptions/${subscriptionId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
        data: {
            id: subscriptionId,
            type: 'subscription',
            attributes: {
                payment_authority: {
                    type: 'elastic_path_payments_stripe',
                    customer_id: stripeCustomerId,
                    card_id: paymentMethodId,
                }
            }
        }
    })
});
```

## Current feature set reference

| **Feature**                              | **Notes**                                                                                     |
|------------------------------------------|-----------------------------------------------------------------------------------------------|
| PDP                                      | Product Display Pages                                                                         |
| PLP                                      | Product Listing Pages                                                                         |
| EPCC PXM product variations              | [Learn more](https://elasticpath.dev/docs/pxm/products/pxm-product-variations/pxm-variations) |
| EPCC PXM bundles                         | [Learn more](https://elasticpath.dev/docs/pxm/products/pxm-bundles/pxm-bundles)               |
| EPCC PXM hierarchy-based navigation menu | Main site nav driven directly from your store's hierarchy and node structure                  |
| Checkout                                 | [Learn more](https://elasticpath.dev/docs/commerce-cloud/checkout/checkout-workflow)          |
| Cart                                     | [Learn more](https://elasticpath.dev/docs/commerce-cloud/carts/carts)                         |
| Accounts                                 | [Learn more](https://elasticpath.dev/docs/api/accounts/account-management-introduction)       |
| Account Orders                           | [Learn more](https://elasticpath.dev/docs/api/carts/get-customer-orders)                      |
| Subscription offerings                   | [Learn more](https://elasticpath.dev/docs/api/subscriptions/subscriptions-introduction)       |
| Subscription management                  | Cancel and update payment method for active subscriptions                                     |
| Stripe payment processing                | [Learn more](https://elasticpath.dev/docs/payments/ep-payments/ep-payments-overview)          |
