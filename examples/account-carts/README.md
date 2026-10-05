# Account carts

A shopper signs in with an email address and a password, adds a product, and sees it in their account's cart. Signing in on another browser shows the same cart, because the cart belongs to the account and not to a browser.

The shopper can save the cart under a name and carry on with an empty one. A saved carts page lists the account's other carts with name, item count, total and the date each one expires. The shopper can rename a saved cart, delete it, or resume it, which makes it the active cart.

The shopper can share a saved cart. Sharing makes a link that carries a random token, never the cart's id. The shopper sees the links they have made and can revoke any of them. Whoever opens a link, after signing in, can add the shared cart's items to their own cart.

This example is the base for account-level cart features. It shows the part everything else depends on: how a storefront finds the one cart that is "the account's cart".

## What the example shows

### The active cart

An account can hold many carts. The active cart is the account's most recently updated cart that is not a quote. If the account holds no such cart, the example creates one and associates it with the account.

`src/lib/active-cart.ts` makes this choice as a pure function. It returns, in order:

1. the cart named by the cart cookie, if the account still holds it and it is not a quote;
2. else the account's most recently updated cart that is not a quote;
3. else "create one".

`src/lib/cart-service.ts` applies that choice. Reading the cart page never creates a cart. Adding a product creates one when the account has none. A product the store cannot add (for example, one that is out of stock) shows a message beside it, not an error page.

### Save for later

On the cart page, the shopper names the cart and chooses Save for later. The example does three things, in this order:

1. renames the active cart to the name the shopper gave;
2. creates a new, empty cart with the account token and associates it with the account;
3. makes the new cart the active cart, by setting the cart cookie.

The request each step sends is built by a pure function in `src/lib/cart-requests.ts` (`renameCartRequest`, `createCartRequest`, `associateCartRequest`), so the headers, path and body are tested without a network. `src/lib/save-for-later.ts` runs the steps against the cart port. It saves nothing, and creates nothing, when the name is not usable, when the account holds no cart, or when the active cart is empty.

The steps are not one transaction. If the rename succeeds and the new cart cannot be created, the renamed cart stays the active cart and the shopper sees a failed save. Saving again renames it again.

A cart name may contain spaces. Elastic Path accepted a name with spaces on create and on rename, checked live. The example passes the name through as typed, and a name Elastic Path refuses shows up as a failed save with nothing renamed.

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

**Refusals become messages.** `describeFailure` in `src/lib/cart-failure.ts` turns any failure into a sentence for the shopper: a missing cart (404), a cart the account may not change (403), a refused name (400 or 422 on rename), a refused add (out of stock, or any other refusal of the add), the last-cart refusal, rate limiting (429), and any server error or network failure. Anything it does not recognise gets a generic sentence for that action. The page never shows the API's own text.

**Checkout does not switch the active cart.** This example has no checkout. A cart stays the active cart until the shopper resumes another, saves it for later or deletes it, including after a checkout you add. Do that switch yourself, for example by saving or deleting the cart when the order is placed.

### Share a saved cart

On `/saved-carts`, a shopper chooses Share on a cart. The example writes a share entry and lists the link under Share links, where the shopper can copy it or revoke it. A shopper can make more than one link for a cart, and each link is revoked on its own.

#### Why a link never carries a cart id

A cart id on its own is enough to read and change the cart in Elastic Path, and reading a cart by id creates an empty cart when the id does not exist. A link that carried the id would hand its holder that power for as long as the cart lives, and nobody could take it back without deleting the cart.

A link carries a random token instead (`/share/<token>`). The token is 32 random bytes, written as 43 URL-safe characters (`generateShareToken` in `src/lib/shares.ts`). It names a share entry and nothing else. The server turns the token into a cart id, and revoking the entry makes the token worthless while the cart stays as it was. The browser is never given a cart id: the Share button sends a cart handle (see "Saved carts"), and the share list shows the cart's name.

#### How shares are stored

A share is an entry in a Custom API with the slug `cart-shares`. Each entry holds four string fields:

| Field         | What it holds                                        |
| ------------- | ---------------------------------------------------- |
| `share_token` | The random token the link carries                    |
| `cart_id`     | The cart the link points to                          |
| `account_id`  | The account that made the link                       |
| `shared_at`   | When the link was made, as an ISO 8601 date and time |

Every read and write of an entry runs on the server with the server-only key (`src/lib/shares-store.ts`). The browser never calls the Custom API. The Custom API is created by `pnpm provision`, and the app finds it by slug at runtime.

#### Who may see and revoke which share

The store key can read and write every entry, so the storefront decides. `src/lib/shares.ts` holds the rules, and `src/lib/shares.test.ts` runs them against an in-memory store:

1. The account id comes from the signed-in session, never from the request.
2. Listing asks the API for `eq(account_id,<id>)`, then drops in memory any entry whose `account_id` differs. A store that ignores the filter still cannot leak another account's share.
3. Revoking reads the entry first and compares its `account_id` with the session's. A share that belongs to someone else, a share that does not exist and an id that is malformed all get the same answer, so the response does not reveal which ids exist.
4. An id is checked against `^[A-Za-z0-9_-]{1,64}$`, and a token against `^[A-Za-z0-9_-]{43}$`, before it enters a filter. The API does not escape filter values, so an id carrying filter syntax would change the query.
5. Only a saved cart can be shared: the cart handle is resolved among the account's saved carts, so the active cart, a quote and another account's cart find nothing.

#### Looking a share up by its token

Opening a link starts with a lookup: `lookupShareByToken(token)` in `src/lib/shares-store.ts` returns the share entry, or `null` when no share holds the token or the token is malformed. It throws `SharesUnavailableError` when the Custom API cannot be read, so an outage never reads as an unknown token. The lookup is not scoped to an account, because the person opening a link is not the person who made it. The link path comes from `shareLinkPath` in `src/lib/share-link.ts`.

#### What a link does not give you

A link reveals the share, and anyone who holds it can use it until it is revoked. A share is not tied to a recipient, and it has no expiry of its own. The cart behind it is deleted when the store's cart expiry passes. A share whose cart is gone stays in the list marked "Cart no longer exists", so the shopper can still revoke it.

### Open a shared cart

A recipient opens the link, `/share/<token>`.

1. Signed out, the recipient goes to sign in and comes back to the same link afterwards (`returnUrl`, checked by `safeReturnPath`).
2. The page shows the items the shared cart holds now, with their quantities and the total.
3. The recipient chooses Add these items to my cart. The example merges the shared cart into the recipient's active cart in one request and opens `/cart`.

The merge adds to the recipient's current cart. Whatever is in that cart stays, and the shared items come on top of it. If the recipient has no cart, the example creates one first. The recipient gets the items the shared cart holds when they open the link, not the items it held when the sender made the link. The sender's cart is the source of the merge, and the example never writes to it.

Adding is a button, not something the page does when it loads. Opening a page should not change a cart: a reload, a link preview or a prefetch would add the items again.

If the shared cart is already the recipient's active cart, for example the sender opens their own link after resuming that cart, the example says so and merges nothing, because merging a cart into itself would double its items.

#### What the server does

`src/lib/open-share.ts` runs the steps against two small interfaces, so `src/lib/open-share.test.ts` runs them with no network:

1. `lookupShareByToken` turns the token into a share entry (see "Looking a share up by its token").
2. The shared cart is read with the server-only key (`src/lib/shared-cart-reader.ts`), not with the recipient's tokens. That read sends no account token, so it cannot attach anything to the recipient's account.
3. The recipient's active cart is chosen with the same `chooseActiveCart` as every other page.
4. The merge is sent with the recipient's tokens.

The cart id stays on the server. The page is given the cart's lines, and the Add button sends the token back, never an id. The server looks the token up again when the button is chosen, so a link revoked after the page loaded does not merge.

#### The merge request

`mergeCartRequest` in `src/lib/cart-requests.ts` builds the request as a pure function. It posts to the recipient's cart with one merge object that names the shared cart as the source, and it sets `add_all_or_nothing` to `true` explicitly, so the example never relies on the API default of `false`:

```json
{
  "data": { "type": "cart_items", "cart_id": "<shared cart>" },
  "options": { "add_all_or_nothing": true }
}
```

All or nothing means one refused item stops the whole merge, and the recipient's cart stays as it was.

#### When Elastic Path refuses the merge

`describeMergeFailure` in `src/lib/merge-failure.ts` turns the refusal into a message. It is its own module, so the wording of a refused merge is tested apart from the wording of a refused rename, delete or resume in `cart-failure.ts`.

- A refusal of one or more products (400, 404 or 422) gives "Nothing was added to your cart." and one line for each refused product, in the form `Mug: not enough stock`. The product is named from the shared cart's lines, matched on either the product id or the cart item id that the API echoes. A refusal with no id, or with an id that is not in the shared cart, reads "A shared product".
- The reason is one of three plain phrases: `not enough stock`, `no longer available` (404) or `could not be added`. The page never shows the API's own title or detail.
- A server error, a network failure or an unreadable answer gives "We could not confirm whether your cart changed. Check your cart before trying again." It does not say the cart is unchanged and does not say to try again, because the merge may have been applied and a second try would add the items twice.
- A 403 or 429 is explained by `describeFailure`, with the same sentences the saved carts page uses.

#### A link that does not work

A token that was never issued, a malformed token, a revoked share and a share whose cart has expired all show one message, so a link does not reveal which shares exist. `openShare` returns the same `unavailable` answer for all four, and `open-share.test.ts` checks that. A failure to reach Elastic Path or the Custom API is a different message, so an outage is not mistaken for a dead link.

A share has no expiry of its own. It stops working once the shared cart expires, because Elastic Path deletes the cart `cart_expiry_days` after its last change (see "How long a cart lasts"). The share entry stays until the sender revokes it.

Reading a cart that does not exist makes Elastic Path answer with an empty cart instead of a 404, so the example treats a shared cart with no items as gone, and a 404 as gone too. The shared cart is read with the server-only key, which carries no account, so an empty cart made by that read is not linked to any account.

Any signed-in member of the store can open a link. A link is not tied to a recipient.

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

Reading the store's cart settings, reading and writing share entries, and reading a shared cart are store-level calls, so the example uses a store API key with a secret, through the `client_credentials` grant:

- The variables are `EPCC_CLIENT_ID` and `EPCC_CLIENT_SECRET`. Neither has a `NEXT_PUBLIC_` prefix, so Next.js never sends them to the browser.
- They are read only in `src/lib/server-credentials.ts`, which imports `server-only`. Importing that module from client code fails the build.
- `/configuration` names both variables when either is missing. A missing key does not stop the cart pages, which need only shopper tokens. Sharing a cart tells the shopper the key is missing.

This key can do more than the example needs. Elastic Path store keys are not scoped to endpoints, so the key is not limited to reading cart settings and the share entries. Create a key for this example only, keep it out of source control, and do not reuse a key that an admin tool or another service holds.

### Where the cart id lives

The active cart's id is kept only in an `httpOnly` cookie. No page renders it, and no client script can read it. The cookie is a hint, not a credential. The server checks every time that the account still holds the cart it names, so a stale or edited cookie falls back to the most recently updated cart.

This matters because a cart id on its own is enough to read and change a cart in Elastic Path. Keep the id out of URLs, page markup and client state.

### Why the example lists carts and filters in code

The API reference says the `filter` parameter is ignored when the caller holds an account token, so all of the account's carts come back. Checked live, that is not what happens: listing an account's carts with a name filter returned none of them. A filter on this list is unreliable either way, so the example sends none. It pages through the whole list (100 per page) and filters on the storefront.

### Why the example never relies on a bare cart read

Reading a cart by id creates an empty cart when the id does not exist, so a successful read does not prove the account holds the cart. The example confirms membership against the account's cart list first.

### Quotes

The example treats a cart as a quote when the cart response carries `is_quote: true`. The shopper SDK types do not declare that field, so the example reads it from the untyped response. The store used to build this example held no quotes, so this behaviour is covered by tests but has not been confirmed against a store that holds one.

### Errors

Every call checks `error`, not only whether data came back. The shopper client returns `{ error }` for an HTTP failure and throws on a network failure. The example turns both into one failure (`CartsUnavailableError`), so an outage never reads as an account with no carts. A failed sign-in lookup is told apart from a wrong password: a rejection shows "Check your email address and password", a server or network failure shows "unavailable".

## What this example does not do

- It does not let a shopper choose an account. Elastic Path issues one token per account that a member belongs to. A member of two accounts receives two tokens at sign-in, and this example takes the first. Account switching is a separate feature.
- It does not handle guest carts or merge one into an account at sign-in.
- It uses the server-only key for three things: reading the cart settings, reading and writing share entries, and reading a shared cart. Everything else runs on the shopper's account token and an implicit token.
- It does not let a share expire on its own, and it does not tie a link to a recipient.
- It merges a shared cart as a whole. The recipient cannot leave out items, and the quantities are the shared cart's.
- It does not change the cart expiry setting. It only reads it.
- The cookie prefix is `_account_carts`, not the `_store` prefix other examples in this repository use, so this example does not read another example's cookies when both run on `localhost`.

## Store Setup Requirements

The store must hold the following before the example runs.

| Requirement                                                       | Why                                                                                                | How to get it                                       |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| A published catalog with a standard product that has a price      | The products a shopper can add                                                                     | Publish a catalog in Commerce Manager               |
| A password profile on an authentication realm                     | Shoppers sign in with an email address and a password                                              | Commerce Manager, then copy the id of the profile   |
| Two accounts, each with at least one member on that realm         | A member signs in, and the account holds the cart. Sharing needs a second account to open the link | Create the accounts and members in Commerce Manager |
| A store API key (an implicit key, no secret needed)               | Reads the catalog and talks to carts                                                               | Create a key in Commerce Manager                    |
| A second store API key, with a secret                             | Reads the cart settings and stores share links, on the server only                                 | Create a key in Commerce Manager                    |
| The `cart-shares` Custom API with its four fields                 | Holds one entry per share link                                                                     | Run `pnpm provision`                                |
| `cart_expiry_days` raised to however long saved carts should last | Carts are deleted this many days after their last change                                           | See "How long a cart lasts"                         |

Only standard products with a price are listed. Parent, child and bundle products need variation or component choices that a bare product id cannot carry, so the example leaves them out.

The app checks the environment variables when it starts. A missing store variable, or an endpoint without a scheme, sends every page to `/configuration-error`, which names each missing or unusable variable and what to do about it. The server key's variables are checked on `/configuration`, which names them when they are missing. If every variable is fine, that page lists the two things the app cannot check by itself: the catalog is published with a priced standard product, and the password profile exists and each of the two accounts has a member.

The server key's variables and the `cart-shares` Custom API are checked on `/configuration`, which names whichever is missing. A cart page does not depend on either. Choosing Share without them shows the shopper what is missing instead of failing.

The app cannot check the store ahead of time. A password profile that does not exist shows up as a failed sign-in. A catalog that is not published shows up as the configuration page.

### Provisioning

`pnpm provision` creates the `cart-shares` Custom API and its four fields. It writes to the store, so it needs admin credentials, which it reads from the shell and never from `.env.local`:

```bash
export EP_ENDPOINT_URL=https://euwest.api.elasticpath.com
export EP_ADMIN_CLIENT_ID=...
export EP_ADMIN_CLIENT_SECRET=...

pnpm provision --dry-run
pnpm provision
```

`--dry-run` looks up what exists and prints what it would create, and writes nothing. Run the script twice and the second run reports that everything already exists. The example needs no id in its environment, because it looks the Custom API up by slug.

Use a key with a secret that can manage Commerce Extensions. Elastic Path store keys are not scoped to endpoints, so use a key that you do not keep around for the app.

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
12. Open Configuration. It shows the store's `cart_expiry_days`, and whether the `cart-shares` Custom API exists.
13. On Saved carts, choose Share on a cart. A link appears under Share links, with the cart's name and the date it was made. Copy it.
14. Sign in as a member of another account. Saved carts shows none of the first account's links.
15. Open the link you copied in a private window. You are sent to sign in. Sign in as a member of another account, and you return to the link, which lists the shared cart's items.
16. Choose Add these items to my cart. The cart page opens with the shared items on top of what the cart already held. Saved carts for the first account is unchanged.
17. As the first account, choose Revoke. Open the link again as the second account. It shows "This link does not work".

The packages this example imports must be built first. From the repository root, run `pnpm build:packages` before `pnpm dev`.

## Tests

```bash
pnpm test
pnpm type:check
pnpm build
```

| File                                 | What it proves                                                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `src/lib/cart-name.test.ts`          | A cart name is trimmed, and an empty, over-long or control-character name is refused                             |
| `src/lib/cart-requests.test.ts`      | The headers, path and body of the rename, delete, disassociate, create and associate requests                    |
| `src/lib/save-for-later.test.ts`     | Rename, then create; nothing is saved for an empty cart, a bad name or a quote; a failed rename creates nothing  |
| `src/lib/delete-cart.test.ts`        | The delete-or-disassociate decision: another cart held, the last cart, and a quote as the only other cart        |
| `src/lib/manage-saved-cart.test.ts`  | Rename, delete and resume act only on a cart the handle names; the last-cart order of calls; nothing on a quote  |
| `src/lib/cart-failure.test.ts`       | Each refusal, outage and unknown failure becomes a message, and the API's own text is never shown                |
| `src/lib/saved-carts.test.ts`        | Saved carts exclude the active cart and quotes; the page gets handles, never cart ids                            |
| `src/lib/shares.test.ts`             | A shopper lists and revokes only their own shares; ids and tokens are validated before a filter; lookup by token |
| `src/lib/shared-carts.test.ts`       | Only a saved cart can be shared; the list shows cart names and never a cart id                                   |
| `src/lib/shares-store.test.ts`       | A failed read or write throws and never reads as no shares; a 404 is the only "not found"                        |
| `src/lib/share-link.test.ts`         | A link is the site's address, `/share/` and the token, and nothing else                                          |
| `src/lib/open-share.test.ts`         | Revoked, expired, unknown and malformed links answer alike; the merge goes into the active cart and nothing else |
| `src/lib/merge-failure.test.ts`      | A refused merge names each product and reason; an unconfirmed merge never says the cart is unchanged             |
| `src/lib/shared-cart.test.ts`        | The shared cart response becomes lines with product ids, a unit count and a total                                |
| `src/lib/shared-cart-reader.test.ts` | The shared cart is read with the server token and no account; a missing or empty cart is gone, an outage is not  |
| `src/lib/expiry-date.test.ts`        | The expiry date is shown in UTC, and a missing date says so                                                      |
| `src/lib/cart-settings.test.ts`      | `cart_expiry_days` is read with the server token; an error or outage is never read as "not set"                  |
| `src/lib/server-credentials.test.ts` | The server token uses `client_credentials`, is cached, and is never mixed up with the implicit token             |
| `src/lib/active-cart.test.ts`        | The choice of active cart: cookie cart, most recently updated, quotes skipped, create when none                  |
| `src/lib/cart-service.test.ts`       | Adding creates a cart only when needed, reading never creates, and a failure stops the add                       |
| `src/lib/carts-port.test.ts`         | Every call sends both tokens and checks `error`; network failures and refusals never read as an empty account    |
| `src/lib/cart-view.test.ts`          | The cart response becomes lines, a unit count and a total, and `is_quote` is read from the untyped response      |
| `src/lib/sign-in.test.ts`            | A wrong password and an outage are told apart, and the account token is returned                                 |
| `src/lib/account-session.test.ts`    | The account comes from the token, exactly one account is accepted, and an outage is not a sign-out               |
| `src/lib/listable-products.test.ts`  | Only standard, priced products are listed                                                                        |
| `src/lib/return-url.test.ts`         | Sign-in returns only to a path on this site                                                                      |
| `src/lib/store-requirements.test.ts` | Every environment variable is named when missing or unusable                                                     |
| `src/lib/store-env.test.ts`          | The shopper pages read only the three public variables, never the whole environment                              |
| `src/lib/server-key-env.test.ts`     | The server key's id and secret are read in one server-only module, and nothing else comes with them              |
| `src/lib/refusal.test.ts`            | Elastic Path's refusals are read the same way for a failed rename, delete, resume and merge                      |
