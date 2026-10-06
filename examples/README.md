# Examples

Composable Frontend is a minimal core plus a library of focused examples. Something enters either home only if it **teaches an Elastic Path capability**: how to use a platform API, model, or integration. Generic web patterns are declined however useful they are. Build cost is never an argument for entry: cheap to build is not cheap to own. A capability already demonstrated is not a gap. Declining is not refusing to help: each declined request gets a pointer to the mechanism it sits on.

`examples/core` is the reference **storefront**: shopper token only. Anything requiring a `client_credentials` token belongs in a focused example.

An example assumes a **declared minimal baseline** of the store behind it, written in its README: not a seeded demo store, and not an arbitrary store.

## The examples

| Example | What it teaches | Stack |
| --- | --- | --- |
| [account-carts](account-carts) | Account-scoped carts: one active cart per account across browsers, saved carts, and shareable cart links kept in Commerce Extensions. | Next.js |
| [algolia](algolia) | Faceted product search on Algolia, reading an index of Elastic Path catalog data, inside a storefront with cart and checkout. | Next.js |
| [all-product-types](all-product-types) | Standard, variation (parent and child) and bundle products on one product page, with multi-location inventory. | Next.js |
| [analytics-integration](analytics-integration) | Sending a Google Analytics event when a shopper adds a product to the cart. | Next.js |
| [authentication-local-storage](authentication-local-storage) | Implicit-token authentication with the token kept in browser local storage, and the security trade-off of doing so. | Next.js |
| [authentication-server-cookie](authentication-server-cookie) | Implicit-token authentication with the token kept in a server-set cookie and refreshed in middleware. | Next.js |
| [commerce-essentials](commerce-essentials) | A storefront with Klevu search and recommendations, Elastic Path Payments (Stripe) checkout, product PDF files and one-time-token password reset. | Next.js |
| [commerce-extensions-saved-list](commerce-extensions-saved-list) | Account-scoped custom data on Commerce Extensions: a Custom API whose entries one shopper cannot read or change for another. | Next.js |
| [core](core) | The reference storefront on a shopper token only: catalog navigation, variations and bundles, Catalog Search with facets, cart, checkout, accounts and multi-location inventory. | Next.js |
| [list-products](list-products) | Product listing and detail pages with multi-location inventory. | Next.js |
| [next-account-checkout](next-account-checkout) | Checkout with an account token on the server: a cart tied to the account, shipping options and order creation. | Next.js |
| [payments](payments) | Paying for an order with Elastic Path Payments, powered by Stripe, in a storefront checkout. | Next.js |
| [payments-paypal-express](payments-paypal-express) | Paying for an order with the PayPal Express Checkout gateway, including cancellation and order completion. | Next.js |
| [pdf-viewer](pdf-viewer) | Showing PDF files attached to products through the Files API: in a new tab, in an iframe, or with PDF.js. | Next.js |
| [recommendations](recommendations) | Related products on the product page, read from a product's custom relationship. | Next.js |
| [seat-count](seat-count) | Selling by the seat: a per-product limit kept in product shopper attributes and enforced on the server, because the Cart API does not know it. | Next.js |
| [shopper-accounts-authentication](shopper-accounts-authentication) | Shopper account authentication: registration, login, and password reset with a one-time token, using the account member token in cookies. | Next.js |
| [simple](simple) | A starter storefront on the shopper SDK: catalog browsing by hierarchy, cart, checkout with the manual payment gateway, and shopper accounts. | Next.js |
| [spa-authentication](spa-authentication) | Implicit-token authentication with the token kept in browser local storage and attached by SDK interceptors. | React single-page app (Vite) |
| [spa-cart](spa-cart) | Cart management: a persistent cart, item changes, promotion codes and cart totals. | React single-page app (Vite) |
| [spa-elastic-path-payments](spa-elastic-path-payments) | Paying for an order with Elastic Path Payments, powered by Stripe, using the Stripe Payment Element. | React single-page app (Vite) |
| [spa-guest-checkout](spa-guest-checkout) | Guest checkout: converting a cart to an order with billing and shipping addresses and no customer account. | React single-page app (Vite) |
| [spa-manual-payments](spa-manual-payments) | Recording payment against an order with the manual payment gateway. | React single-page app (Vite) |
| [spa-search](spa-search) | Catalog Search from a plain search box, through the shopper SDK's multi-search call. | React single-page app (Vite) |
| [spa-search-instantsearch](spa-search-instantsearch) | Catalog Search through the Elastic Path InstantSearch adapter, with facets, autocomplete and pagination. | React single-page app (Vite) |
| [subscriptions](subscriptions) | Subscriptions: offerings with plans and pricing options added to the cart, paid through Stripe, and cancelled or updated from the account. | Next.js |

A pull request that adds, removes, renames or retitles an example updates this list.
