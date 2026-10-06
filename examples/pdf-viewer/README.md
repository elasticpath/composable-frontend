# PDF Viewer Example for Elastic Path

This example demonstrates how to implement PDF file viewing for product documentation in an Elastic Path storefront. It showcases three different viewing modes (new tab, iframe modal, and PDF.js) with secure URL validation to prevent SSRF attacks.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fpdf-viewer&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL,NEXT_PUBLIC_SITE_NAME,NEXT_PUBLIC_PASSWORD_PROFILE_ID&envDescription=Api%20keys%20can%20be%20found%20in%20your%20keys%20section%20of%20commerce%20manager&envLink=https%3A%2F%2Felasticpath.dev%2Fdocs%2Fdeveloper-tools%2Fcomposable-starter%2Fdeploy%2Fstorefront-deploy&project-name=elastic-path-pdf-viewer&repository-name=elastic-path-pdf-viewer)

## PDF Viewing Modes

1. **Tab Mode** - Opens PDFs in new browser tab
2. **iFrame Mode** - Displays PDFs in modal using browser's PDF viewer
3. **PDF.js Mode** - Custom PDF viewer with pagination controls

## Security

The PDF proxy validates URLs against an allowlist to prevent SSRF attacks:

```typescript
// src/app/api/pdf-proxy/route.ts
const ALLOWED_DOMAINS = [
  'd1s4tacif4dym4.cloudfront.net',
  // Add your trusted domains here
];
```

## Usage

1. **Upload PDFs** to products in Elastic Path Commerce Manager
2. **PDFs appear** automatically in "Reference Material" section on product pages
3. **Configure display mode** in `SimpleProductContent.tsx`:

```typescript
<ProductFiles
  files={otherFiles}
  pdfDisplayStyle={PDFDisplayStyle.pdfJs} // or .tab, .iframe
/>
```

## Store Setup Requirements

Nothing in this repository provisions the store for this example. Set up each item in Commerce Manager or through the Elastic Path APIs.

### Required

- **An application key with a client ID.** `src/lib/middleware/implicit-auth-middleware.ts` requests an implicit access token with `NEXT_PUBLIC_EPCC_CLIENT_ID` and keeps it in a cookie. Without the variable every page redirects to `/configuration-error`. Create an application key in Commerce Manager and copy its client ID. The example never reads a client secret.
- **A published catalog with priced products.** The product list, the product page, the search page and the navigation menu all read the shopper catalog (`getByContextAllProducts` and `getByContextProduct` in `src/app/(store)/search/[[...node]]/page.tsx` and `src/app/(store)/products/[productId]/page.tsx`, `getByContextAllHierarchies` in `src/lib/build-site-navigation.ts`), so they see only what a published catalog exposes. Publish a catalog in Commerce Manager. Prices come from the price book the catalog uses.
- **Multi-location inventory with stock for each product.** The client adds the `EP-Inventories-Multi-Location: true` header to every request (`src/lib/create-elastic-path-client.ts`), and the product page calls `getStock`. `SimpleProductContent.tsx`, `VariationProductContent.tsx` and `BundleProductContent.tsx` disable Add to Cart when the response has no `locations` or the chosen location has less than one available. Create stock locations and set stock for each product in Commerce Manager.
- **The manual payment gateway enabled.** Checkout converts the cart to an order and pays it with `paymentSetup` using `gateway: "manual"` (`src/app/(checkout)/checkout/actions.ts`). Enable the Manual gateway in Commerce Manager under payment settings.
- **A currency in the store whose code matches `NEXT_PUBLIC_DEFAULT_CURRENCY_CODE`.** Checkout calls `getAllCurrencies` (`src/app/(checkout)/checkout/page.tsx`) and looks the currency up by that code (`CheckoutSidebar.tsx`, `ConfirmationSidebar.tsx`) to format the shipping amount and the order total with shipping. The code defaults to `USD`. Without a match, the total with shipping does not render. Add the currency in Commerce Manager.

### Optional

- **PDF files attached to products.** The product page requests `include: ["main_image", "files", "component_products"]` (`src/app/(store)/products/[productId]/page.tsx`), and `ProductFiles.tsx` keeps the files whose `mime_type` is `application/pdf`. Upload the files with the Files API or Commerce Manager and attach them to a product. A product with no PDF shows no "Reference Material" heading. Only standard products list files: `SimpleProductContent.tsx` is the only product layout that renders them.
- **PDF files served from a host the proxy allows.** `PDFDisplayStyle.pdfJs`, the mode `SimpleProductContent.tsx` uses, loads each PDF through `/api/pdf-proxy`, which answers 403 for any URL whose host is not in `ALLOWED_DOMAINS` in `src/app/api/pdf-proxy/route.ts`. Add the host of your store's file links to that list. The `tab` and `iframe` modes open the file link directly and do not use the proxy.
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

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Tech Stack

- **Next.js** - React framework
- **react-pdf** - PDF rendering library
- **Elastic Path Commerce** - Product and file management
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling