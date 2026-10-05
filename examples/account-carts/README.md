# Account carts

A shopper signs in with an email address and a password, adds a product, and sees it in their account's cart. Signing in on another browser shows the same cart, because the cart belongs to the account and not to a browser.

The shopper can save the cart under a name and carry on with an empty one. A saved carts page lists the account's other carts with name, item count, total and the date each one expires. The shopper can rename a saved cart, delete it, or resume it, which makes it the active cart.

This example is the base for account-level cart features. It shows the part everything else depends on: how a storefront finds the one cart that is "the account's cart".

## What the example shows

### The active cart

An account can hold many carts. The active cart is the account's most recently updated cart that is not a quote. If the account holds no such cart, the example creates one and associates it with the account.

`src/lib/active-cart.ts` makes this choice as a pure function. It returns, in order:

1. the cart named by the cart cookie, if the account still holds it and it is not a quote;
2. else the account's most recently updated cart that is not a quote;
3. else "create one".

`src/lib/cart-service.ts` applies that choice. Reading the cart page never creates a cart. Adding a product creates one when the account has none.

### Save for later

On the cart page, the shopper names the cart and chooses Save for later. The example does three things, in this order:

1. renames the active cart to the name the shopper gave;
2. creates a new, empty cart with the account token and associates it with the account;
3. makes the new cart the active cart, by setting the cart cookie.

The request each step sends is built by a pure function in `src/lib/cart-requests.ts` (`renameCartRequest`, `createCartRequest`, `associateCartRequest`), so the headers, path and body are tested without a network. `src/lib/save-for-later.ts` runs the steps against the cart port. It saves nothing, and creates nothing, when the name is not usable, when the account holds no cart, or when the active cart is empty.

The steps are not one transaction. If the rename succeeds and the new cart cannot be created, the renamed cart stays the active cart and the shopper sees a failed save. Saving again renames it again.

The API reference says a cart name cannot contain whitespace characters. The example passes the name through as typed, and a name Elastic Path refuses shows up as a failed save with nothing renamed.

### Saved carts

`/saved-carts` lists every cart the account holds except the active cart and quotes, most recently changed first. Each row shows the cart's name, its item count in units, its total and its expiry date. The list comes from the account's cart list and is filtered in code, for the reason under "Why the example lists carts and filters in code". The item count and total come from one read per saved cart, because the cart list names a cart's items but carries no quantities.

The page is given a `handle` for each cart and never the cart id. A handle is a hash of the cart id (`cartHandle` in `src/lib/saved-carts.ts`). The server turns a handle back into a cart id with `resolveCartHandle`, which looks only among the carts the account holds, so a handle for someone else's cart finds nothing. Features that act on one saved cart should send a handle, not an id.

### Rename, delete and resume

Each row on `/saved-carts` has a Rename, a Delete and a Resume control. Each acts on the cart named by the row's handle. `src/lib/manage-saved-cart.ts` turns the handle into a cart id with `resolveCartHandle`, among the account's own carts that are not quotes, so a handle for a cart the account does not hold, or for a quote, answers "not found" and changes nothing.

**Rename** validates the name (`parseCartName`), then sends a `PUT` with only the new name. The row shows the new name at once (`useOptimistic`) and goes back to the old name, with a message, if the rename fails. Renaming is a write, so it moves the cart's expiry date.

**Resume** changes nothing in Elastic Path. The active cart is whichever cart the cart cookie names, so resuming checks that the account holds the cart, sets the cookie to it and opens `/cart`. The cart that was active is no longer named by the cookie, so it appears in the saved carts list on the next visit. Resuming sets the cookie in this browser only. Another browser keeps the cart its own cookie names, or the most recently updated cart if it has no cookie.

**Delete** removes the cart. The Carts API refuses to delete an account's last cart (400, titled "Last cart", "try disassociating instead"). `chooseDeletion` in `src/lib/delete-cart.ts` makes the choice as a pure function:

- the account holds another cart: delete the cart;
- the cart is the only cart the account holds: disassociate it from the account, delete it, then create a new empty cart and associate it, so the account always has an active cart. The example sets the cart cookie to the new cart;
- the only other carts are quotes: delete the cart, then create a new empty cart, because a quote cannot be the active cart.

A saved cart always has the active cart beside it, so the last-cart path is not reached from the saved carts page unless another session has deleted the account's other carts in the meantime. The rule lives in `deleteSavedCart`, not in the page, so any caller that deletes an account's active cart gets it too. A rare race, where another session deletes the other cart between the list and the delete, makes Elastic Path refuse, and the shopper sees "That was the only cart in your account..." and can try again.

The steps of the last-cart path are not one transaction. If the disassociation succeeds and the delete fails, the cart is no longer the account's and lapses on its expiry date, and the account has no cart until the next add creates one.

**Refusals become messages.** `describeFailure` in `src/lib/cart-failure.ts` turns any failure into a sentence for the shopper: a missing cart (404), a cart the account may not change (403), a refused name (400 or 422 on rename), the last-cart refusal, rate limiting (429), and any server error or network failure. Anything it does not recognise gets a generic sentence for that action. The page never shows the API's own text.

**Checkout does not switch the active cart.** This example has no checkout. A cart stays the active cart until the shopper resumes another, saves it for later or deletes it, including after a checkout you add. Do that switch yourself, for example by saving or deleting the cart when the order is placed.

### How long a cart lasts

Elastic Path deletes a cart a set number of days after it was last changed. That number is the store's `cart_expiry_days` cart setting. The default is 7 days, and the setting accepts up to 365.

- Every write to a cart, including renaming it, moves its expiry date to "now plus `cart_expiry_days`". Reading a cart does not move it, and neither does linking a cart to an account.
- The setting is store-wide. It applies to every cart in the store, not to one shopper or one cart, so a saved cart lasts only as long as the store's setting allows. Do not treat a cart as permanent storage.
- To make saved carts last longer, raise the setting. Either use Commerce Manager (see [Updating cart settings](https://developer.elasticpath.com/docs/commerce-manager/settings/general-settings#updating-cart-settings)) or call `PUT /v2/settings/cart` with an admin token:

  ```json
  { "data": { "type": "settings", "cart_expiry_days": 30 } }
  ```

  The endpoint is a `PUT`, so read the current settings first and send back the ones you want to keep.

`/configuration` reads the setting and shows it, so the person running the example can see how long saved carts last. The saved carts page shows each cart's own expiry date.

### The server-only key

Reading the store's cart settings is a store-level read, so the example uses a store API key with a secret, through the `client_credentials` grant:

- The variables are `EPCC_CLIENT_ID` and `EPCC_CLIENT_SECRET`. Neither has a `NEXT_PUBLIC_` prefix, so Next.js never sends them to the browser.
- They are read only in `src/lib/server-credentials.ts`, which imports `server-only`. Importing that module from client code fails the build.
- `/configuration` names both variables when either is missing. A missing key does not stop the cart pages, which need only shopper tokens.

This key can do more than the example needs. Elastic Path store keys are not scoped to endpoints, so the key is not limited to reading cart settings. Create a key for this example only, keep it out of source control, and do not reuse a key that an admin tool or another service holds.

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
- It uses the server-only key for one thing: reading the cart settings. Everything else runs on the shopper's account token and an implicit token.
- It does not share a cart. A later feature in this example series adds that.
- It does not change the cart expiry setting. It only reads it.
- The cookie prefix is `_account_carts`, not the `_store` prefix other examples in this repository use, so this example does not read another example's cookies when both run on `localhost`.

## Store Setup Requirements

The store must hold the following before the example runs.

| Requirement                                                       | Why                                                      | How to get it                                     |
| ----------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| A published catalog with a standard product that has a price      | The products a shopper can add                           | Publish a catalog in Commerce Manager             |
| A password profile on an authentication realm                     | Shoppers sign in with an email address and a password    | Commerce Manager, then copy the id of the profile |
| An account with at least one member on that realm                 | The member signs in, and the account holds the cart      | Create the account and member in Commerce Manager |
| A store API key (an implicit key, no secret needed)               | Reads the catalog and talks to carts                     | Create a key in Commerce Manager                  |
| A second store API key, with a secret                             | Reads the store's cart settings, on the server only      | Create a key in Commerce Manager                  |
| `cart_expiry_days` raised to however long saved carts should last | Carts are deleted this many days after their last change | See "How long a cart lasts"                       |

Only standard products with a price are listed. Parent, child and bundle products need variation or component choices that a bare product id cannot carry, so the example leaves them out.

The app checks the environment variables when it starts. A missing store variable, or an endpoint without a scheme, sends every page to `/configuration-error`, which names each missing or unusable variable and what to do about it. The server key's variables are checked on `/configuration`, which names them when they are missing. If every variable is fine, that page lists the two things the app cannot check by itself: the catalog is published with a priced standard product, and the password profile exists and the account has a member.

The app cannot check the store ahead of time. A password profile that does not exist shows up as a failed sign-in. A catalog that is not published shows up as the configuration page.

## Configuration

Copy `.env.example` to `.env.local` and fill it in.

| Variable                          | Where it is used      | What it is                                                                                  |
| --------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_EPCC_ENDPOINT_URL`   | Server and middleware | The store's API base URL, with the scheme, for example `https://euwest.api.elasticpath.com` |
| `NEXT_PUBLIC_EPCC_CLIENT_ID`      | Server and middleware | The client id of an implicit store API key. It has no secret                                |
| `NEXT_PUBLIC_PASSWORD_PROFILE_ID` | Server and middleware | The id of the password profile shoppers sign in against                                     |
| `EPCC_CLIENT_ID`                  | Server only           | The client id of a store API key that has a secret                                          |
| `EPCC_CLIENT_SECRET`              | Server only           | The secret of that key. Never prefix it with `NEXT_PUBLIC_`                                 |

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
6. On the cart page, name the cart and choose Save for later. The cart page now shows an empty cart.
7. Open Saved carts. The cart you saved is listed with its name, item count, total and expiry date.
8. Add a product. It goes into the new cart, and the saved cart is unchanged.
9. On Saved carts, choose Rename on a cart, type a name and save. The new name shows at once.
10. Choose Resume on a saved cart. The cart page opens with that cart, and the cart you left appears under Saved carts.
11. Choose Delete, then Confirm delete, on a saved cart. It leaves the list.
12. Open Configuration. It shows the store's `cart_expiry_days`.

The packages this example imports must be built first. From the repository root, run `pnpm build:packages` before `pnpm dev`.

## Tests

```bash
pnpm test
pnpm type:check
pnpm build
```

| File                                 | What it proves                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `src/lib/cart-name.test.ts`          | A cart name is trimmed, and an empty, over-long or control-character name is refused                            |
| `src/lib/cart-requests.test.ts`      | The headers, path and body of the rename, delete, disassociate, create and associate requests                   |
| `src/lib/save-for-later.test.ts`     | Rename, then create; nothing is saved for an empty cart, a bad name or a quote; a failed rename creates nothing |
| `src/lib/delete-cart.test.ts`        | The delete-or-disassociate decision: another cart held, the last cart, and a quote as the only other cart       |
| `src/lib/manage-saved-cart.test.ts`  | Rename, delete and resume act only on a cart the handle names; the last-cart order of calls; nothing on a quote |
| `src/lib/cart-failure.test.ts`       | Each refusal, outage and unknown failure becomes a message, and the API's own text is never shown               |
| `src/lib/saved-carts.test.ts`        | Saved carts exclude the active cart and quotes; the page gets handles, never cart ids                           |
| `src/lib/expiry-date.test.ts`        | The expiry date is shown in UTC, and a missing date says so                                                     |
| `src/lib/cart-settings.test.ts`      | `cart_expiry_days` is read with the server token; an error or outage is never read as "not set"                 |
| `src/lib/server-credentials.test.ts` | The server token uses `client_credentials`, is cached, and is never mixed up with the implicit token            |
| `src/lib/active-cart.test.ts`        | The choice of active cart: cookie cart, most recently updated, quotes skipped, create when none                 |
| `src/lib/cart-service.test.ts`       | Adding creates a cart only when needed, reading never creates, and a failure stops the add                      |
| `src/lib/carts-port.test.ts`         | Every call sends both tokens and checks `error`; network failures and refusals never read as an empty account   |
| `src/lib/cart-view.test.ts`          | The cart response becomes lines, a unit count and a total, and `is_quote` is read from the untyped response     |
| `src/lib/sign-in.test.ts`            | A wrong password and an outage are told apart, and the account token is returned                                |
| `src/lib/account-session.test.ts`    | The account comes from the token, exactly one account is accepted, and an outage is not a sign-out              |
| `src/lib/listable-products.test.ts`  | Only standard, priced products are listed                                                                       |
| `src/lib/return-url.test.ts`         | Sign-in returns only to a path on this site                                                                     |
| `src/lib/store-requirements.test.ts` | Every environment variable is named when missing or unusable                                                    |
