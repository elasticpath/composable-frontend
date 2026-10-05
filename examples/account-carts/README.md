# Account carts

A shopper signs in with an email address and a password, adds a product, and sees it in their account's cart. Signing in on another browser shows the same cart, because the cart belongs to the account and not to a browser.

This example is the base for account-level cart features. It shows the part everything else depends on: how a storefront finds the one cart that is "the account's cart".

## What the example shows

### The active cart

An account can hold many carts. The active cart is the account's most recently updated cart that is not a quote. If the account holds no such cart, the example creates one and associates it with the account.

`src/lib/active-cart.ts` makes this choice as a pure function. It returns, in order:

1. the cart named by the cart cookie, if the account still holds it and it is not a quote;
2. else the account's most recently updated cart that is not a quote;
3. else "create one".

`src/lib/cart-service.ts` applies that choice. Reading the cart page never creates a cart. Adding a product creates one when the account has none.

### Where the cart id lives

The active cart's id is kept only in an `httpOnly` cookie. No page renders it, and no client script can read it. The cookie is a hint, not a credential. The server checks every time that the account still holds the cart it names, so a stale or edited cookie falls back to the most recently updated cart.

This matters because a cart id on its own is enough to read and change a cart in Elastic Path. Keep the id out of URLs, page markup and client state.

### Why the example lists carts and filters in code

Elastic Path does not filter the cart list when the caller holds an account token. The API reference states that the `filter` parameter is ignored for account tokens and all of the account's carts come back. The example therefore pages through the list (100 per page) and chooses in code.

### Why the example never relies on a bare cart read

Reading a cart by id creates an empty cart when the id does not exist, so a successful read does not prove the account holds the cart. The example confirms membership against the account's cart list first.

### Quotes

The example treats a cart as a quote when the cart response carries `is_quote: true`. The shopper SDK types do not declare that field, so the example reads it from the untyped response. The store used to build this example held no quotes, so this behaviour is covered by tests but has not been confirmed against a store that holds one.

### Errors

Every call checks `error`, not only whether data came back. The shopper client returns `{ error }` for an HTTP failure and throws on a network failure. The example turns both into one failure (`CartsUnavailableError`), so an outage never reads as an account with no carts. A failed sign-in lookup is told apart from a wrong password: a rejection shows "Check your email address and password", a server or network failure shows "unavailable".

## What this example does not do

- It does not let a shopper choose an account. Elastic Path issues one token per account that a member belongs to. A member of two accounts receives two tokens at sign-in, and this example takes the first. Account switching is a separate feature.
- It does not handle guest carts or merge one into an account at sign-in.
- It does not use a server-side key with a secret. Everything runs on the shopper's account token and an implicit token. Later features in this example series add a server key where they need one, and they say so in their own setup notes.
- The cookie prefix is `_account_carts`, not the `_store` prefix other examples in this repository use, so this example does not read another example's cookies when both run on `localhost`.

## Store Setup Requirements

The store must hold the following before the example runs.

| Requirement                                                  | Why                                                   | How to get it                                     |
| ------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------- |
| A published catalog with a standard product that has a price | The products a shopper can add                        | Publish a catalog in Commerce Manager             |
| A password profile on an authentication realm                | Shoppers sign in with an email address and a password | Commerce Manager, then copy the id of the profile |
| An account with at least one member on that realm            | The member signs in, and the account holds the cart   | Create the account and member in Commerce Manager |
| A store API key (an implicit key, no secret needed)          | Reads the catalog and talks to carts                  | Create a key in Commerce Manager                  |

Only standard products with a price are listed. Parent, child and bundle products need variation or component choices that a bare product id cannot carry, so the example leaves them out.

The app checks the environment variables when it starts. A missing variable, or an endpoint without a scheme, sends every page to `/configuration-error`, which names each missing or unusable variable and what to do about it. If every variable is fine, that page lists the two things the app cannot check by itself: the catalog is published with a priced standard product, and the password profile exists and the account has a member.

The app cannot check the store ahead of time. A password profile that does not exist shows up as a failed sign-in. A catalog that is not published shows up as the configuration page.

## Configuration

Copy `.env.example` to `.env.local` and fill it in.

| Variable                          | Where it is used      | What it is                                                                                  |
| --------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_EPCC_ENDPOINT_URL`   | Server and middleware | The store's API base URL, with the scheme, for example `https://euwest.api.elasticpath.com` |
| `NEXT_PUBLIC_EPCC_CLIENT_ID`      | Server and middleware | The client id of an implicit store API key. It has no secret                                |
| `NEXT_PUBLIC_PASSWORD_PROFILE_ID` | Server and middleware | The id of the password profile shoppers sign in against                                     |

Next.js inlines `NEXT_PUBLIC_` values when it builds. After you change one, rebuild with `pnpm build` before `pnpm start`. `pnpm dev` picks changes up on restart.

The endpoint must include `https://`. This differs from `examples/core`, which expects a bare host name.

## Running it

```bash
pnpm install
pnpm dev
```

1. Open `http://localhost:3000`. You are sent to sign in.
2. Sign in as the account's member. You return to the page you asked for.
3. Add a product.
4. Open the cart page. The line, its quantity and the total appear.
5. Sign in as the same member in another browser. The same cart appears.

The packages this example imports must be built first. From the repository root, run `pnpm build:packages` before `pnpm dev`.

## Tests

```bash
pnpm test
pnpm type:check
pnpm build
```

| File                                 | What it proves                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `src/lib/active-cart.test.ts`        | The choice of active cart: cookie cart, most recently updated, quotes skipped, create when none               |
| `src/lib/cart-service.test.ts`       | Adding creates a cart only when needed, reading never creates, and a failure stops the add                    |
| `src/lib/carts-port.test.ts`         | Every call sends both tokens and checks `error`; network failures and refusals never read as an empty account |
| `src/lib/cart-view.test.ts`          | The cart response becomes lines, a unit count and a total, and `is_quote` is read from the untyped response   |
| `src/lib/sign-in.test.ts`            | A wrong password and an outage are told apart, and the account token is returned                              |
| `src/lib/account-session.test.ts`    | The account comes from the token, exactly one account is accepted, and an outage is not a sign-out            |
| `src/lib/listable-products.test.ts`  | Only standard, priced products are listed                                                                     |
| `src/lib/return-url.test.ts`         | Sign-in returns only to a path on this site                                                                   |
| `src/lib/store-requirements.test.ts` | Every environment variable is named when missing or unusable                                                  |
