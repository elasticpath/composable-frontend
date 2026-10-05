# Seat count

A shopper buys a product by the seat, for example a licence sold per user. The product page has a seat control and shows the total price. Each product sets its own seat limit in store data, so a merchant can change the limit without a storefront release.

## What the shopper sees

- A slider with a number box beside it, from 1 seat up to the product's seat limit. The arrow keys move the slider one seat at a time. A screen reader announces the count as "N of L seats".
- The number of seats and the total price for them. The total updates as the count changes.
- An add to cart button that sends the number of seats as the cart quantity.
- Above the limit, a message instead of the button. If a shopper types a number above the limit, the control stops at the limit. The message says that larger orders go through customer service, and links to the contact address in `CUSTOMER_SERVICE_URL`.
- A read-only cart page that shows each line, its number of seats and the cart total.

## How the seat limit works

The limit is the product's `shopper_attributes.max_seats`. Shopper attributes are key-value pairs on a product that the catalog returns to shoppers. They need no template and no search or index setup.

The API returns every shopper attribute value as a string, so the example parses `max_seats` and does not trust it:

| `max_seats`                                  | Seat limit  |
| -------------------------------------------- | ----------- |
| Not set                                      | 20          |
| A positive whole number, such as `"5"`       | That number |
| `"0"`, a negative number, a decimal, or text | 20          |

To give a product its own limit, set `max_seats` in the product's shopper attributes, for example with `PUT /pcm/products/{id}`, then publish the catalog. The shopper sees the new limit once the catalog is published.

All of these rules are in one module, `src/lib/seat-rules.ts`. It takes the catalog product and a requested seat count. It returns:

- the seat limit;
- the seat count to show, kept between 1 and the limit;
- whether the request was above the limit;
- whether the request was a whole number from 1 to the limit;
- the total price, which is the display price multiplied by the seat count.

The product page and the add to cart action both use this module, so the limit is checked in one place.

## The Cart API does not know the limit

`max_seats` is storefront data. The Cart API does not read it. A guest cart accepts 25 seats of a product whose limit here is 20.

For this reason, the limit is checked on the server as well as in the browser. The add to cart server action, in `src/app/actions.ts`, reads the product from the catalog again. It does not use a limit sent by the browser. Then it applies the seat rules before it calls the cart. A request above the limit, or a count that is not a whole number from 1 to the limit, gets an error message and adds nothing.

The limit covers the whole cart, not one request. Adding a product that is already in the cart raises that line's quantity, so two adds of 20 seats would make 40. The action reads the cart first and refuses an add that would take the product past its limit. Two adds sent at the same moment can both pass that read; a storefront that must rule this out needs the check in a service that serialises writes to the cart.

If your storefront has more than one way to add to the cart, every one of them must apply the same check.

## Store Setup Requirements

The store must hold the following before the example runs.

| Requirement                                                                                | Why                                                       | How to get it                                  |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------------- |
| A published catalog that the shopper can read                                              | The products for sale                                     | Publish a catalog in Commerce Manager          |
| At least one standard product in that catalog with a price in the store's default currency | Only these can be bought by the seat here                 | Add a price in the catalog's price book        |
| Optionally, `shopper_attributes.max_seats` on products that need a limit other than 20     | The per-product seat limit                                | See "How the seat limit works", then republish |
| A store API key                                                                            | The example asks for an implicit token with its client id | Commerce Manager, Application Keys             |

The home page lists only standard products that have a price, from the first 100 products in the catalog. Parent products, child products and bundles are left out, because they need choices this example does not make.

## Configuration

Copy `.env.example` to `.env.local` and fill it in:

```
NEXT_PUBLIC_EPCC_ENDPOINT_URL=https://euwest.api.elasticpath.com
NEXT_PUBLIC_EPCC_CLIENT_ID=your_client_id
CUSTOMER_SERVICE_URL=mailto:sales@example.com
```

| Variable                        | What it is                                                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_EPCC_ENDPOINT_URL` | The store's API base URL. Use the absolute URL, with `https://`. A bare host name is reported as a problem.                  |
| `NEXT_PUBLIC_EPCC_CLIENT_ID`    | The client id of a store API key. The example asks only for an implicit (shopper) token with it, and never uses a secret.    |
| `CUSTOMER_SERVICE_URL`          | Where the "Contact customer service" link goes for orders above the limit. An absolute `http(s)` URL or a `mailto:` address. |

`NEXT_PUBLIC_` values are fixed when the example is built. After you change one, build again. `CUSTOMER_SERVICE_URL` is read on the server for each request, so a restart is enough.

The example's cookies start with `_seat_count`. Browsers share `localhost` cookies across ports, so a prefix shared with another example, such as core's `_store`, would pick up that example's token and cart.

## When something is missing

- A missing or unusable environment variable sends every page to `/configuration-error`, which names the variable and says what to set it to.
- If every variable is set but the store does not issue a token or the catalog cannot be read, the same page lists what to check in the store.
- A catalog with no standard, priced products shows a message on the home page instead of an empty list.
- A product id that is not in the catalog shows the not-found page.
- A cart that does not accept the seats shows the store's error message under the button. Nothing is added.

## Running it

```bash
pnpm install
pnpm dev
```

Then:

1. Open <http://localhost:3000> and choose a product.
2. Move the slider, or type a number of seats. The total changes with it.
3. Add to cart. The cart page shows the line and the number of seats.
4. Type a number above the product's limit. The control stops at the limit, and the contact link replaces add to cart.

## What this example does not do

- Volume or tiered pricing per seat. The total is the display price multiplied by the seat count.
- Named seats, account members or invitations.
- Subscriptions and renewals.
- Quotes, or any flow for large orders other than the contact link.
- Editing the seat count in the cart. The cart page is read-only.
- Signed-in accounts, checkout and payment. The example uses a guest cart and a shopper token only.

## Tests

```bash
pnpm test
```

- `src/lib/seat-rules.test.ts` covers the seat rules: `max_seats` missing, valid, zero, negative, a decimal and text; a requested count below 1, at the limit, above the limit and not a number; the total for 1 seat and for the limit; and whether an add still fits with the seats already in the cart.
- `src/lib/store-requirements.test.ts` covers the checks behind the configuration page.

The add to cart action is checked against a live store, not with a mocked cart. A mocked cart test would only prove the mock.
