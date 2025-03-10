# @epcc-sdk/sdks-shopper SDK

Below you’ll find instructions on how to install, set up, and use the client, along with a list of available operations.

## Features

- type-safe response data and errors
- response data validation and transformation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology

---

## Installation

```bash
npm install @epcc-sdk/sdks-shopper
# or
pnpm install @epcc-sdk/sdks-shopper
# or
yarn add @epcc-sdk/sdks-shopper
```

---

## Client Usage


Clients are responsible for sending the actual HTTP requests.

The Fetch client is built as a thin wrapper on top of Fetch API, extending its functionality. If you're already familiar with Fetch, configuring your client will feel like working directly with Fetch API.

You can configure the client in two ways:

- Configuring the internal `client` instance directly
- Using the `createClient` function

**When using the operation function to make requests, by default the global client will be used unless another is provided.**


### 1. Configure the internal `client` instance directly

This is the simpler approach. You can call the setConfig() method at the beginning of your application or anytime you need to update the client configuration. You can pass any Fetch API configuration option to setConfig(), and even your own Fetch implementation.

```ts
import { client } from "@epcc-sdk/sdks-shopper";

client.setConfig({
// set default base url for requests
baseUrl: 'https://euwest.api.elasticpath.com',

// set default headers for requests
headers: {
Authorization: 'Bearer YOUR_AUTH_TOKEN',
},
});
```

The disadvantage of this approach is that your code may call the client instance before it's configured for the first time. Depending on your use case, you might need to use the second approach.

### 2. Using the `createClient` function

This is useful when you want to use a different instance of the client for different parts of your application or when you want to use different configurations for different parts of your application.

```ts
import { createClient } from "@epcc-sdk/sdks-shopper";

// Create the client with your API base URL.
const client = createClient({
    // set default base url for requests
    baseUrl: "https://euwest.api.elasticpath.com",
    /**
    * Set default headers only for requests made by this client.
    */
    headers: {
        "Custom-Header": 'My Value',
    },
});
```

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/sdks-shopper>".

```ts
const response = await getByContextProduct({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getByContextProduct({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/sdks-shopper";

// Supports async functions
client.interceptors.request.use(async (request) => {
    // do something
    return request;
});

client.interceptors.request.eject((request) => {
    // do something
    return request;
});

```

and an example response interceptor

```ts
import { client } from "@epcc-sdk/sdks-shopper";

client.interceptors.response.use((response) => {
    // do something
    return response;
});

client.interceptors.response.eject((response) => {
    // do something
    return response;
});
```

> **_Tip:_** To eject, you must provide a reference to the function that was passed to use().

## Authentication

We are working to provide helpers to handle auth easier for you but for now using an interceptor is the easiest method.

```ts
import { client } from "@epcc-sdk/sdks-shopper";

client.interceptors.request.use((request, options) => {
  request.headers.set('Authorization', 'Bearer MY_TOKEN');
  return request;
});
```

## Build URL

If you need to access the compiled URL, you can use the buildUrl() method. It's loosely typed by default to accept almost any value; in practice, you will want to pass a type hint.

```ts
type FooData = {
  path: {
    fooId: number;
  };
  query?: {
    bar?: string;
  };
  url: '/foo/{fooId}';
};

const url = client.buildUrl<FooData>({
  path: {
    fooId: 1,
  },
  query: {
    bar: 'baz',
  },
  url: '/foo/{fooId}',
});
console.log(url); // prints '/foo/1?bar=baz'
```


---





## Operation Usage
The following examples demonstrate how to use the operation function to make requests.

```ts
import { getByContextProduct } from "@epcc-sdk/sdks-shopper";

const product = await getByContextProduct({
  // client: localClient, // optional if you have a client instance you want to use otherwise the global client will be used
  path: {
    ...
  },
  query: {
    ...
  },
});
```

---



## Available Operations



- **`getByContextRelease`** (`GET /catalog`)

- **`getByContextAllHierarchies`** (`GET /catalog/hierarchies`)

- **`getByContextHierarchy`** (`GET /catalog/hierarchies/{hierarchy_id}`)

- **`getByContextHierarchyNodes`** (`GET /catalog/hierarchies/{hierarchy_id}/nodes`)

- **`getByContextHierarchyChildNodes`** (`GET /catalog/hierarchies/{hierarchy_id}/children`)

- **`getByContextAllNodes`** (`GET /catalog/nodes`)

- **`getByContextNode`** (`GET /catalog/nodes/{node_id}`)

- **`getByContextChildNodes`** (`GET /catalog/nodes/{node_id}/relationships/children`)

- **`getByContextAllProducts`** (`GET /catalog/products`)

- **`getByContextProduct`** (`GET /catalog/products/{product_id}`)

- **`getByContextComponentProductIds`** (`GET /catalog/products/{product_id}/relationships/component_products`)

- **`getByContextChildProducts`** (`GET /catalog/products/{product_id}/relationships/children`)

- **`getByContextProductsForHierarchy`** (`GET /catalog/hierarchies/{hierarchy_id}/products`)

- **`getByContextProductsForNode`** (`GET /catalog/nodes/{node_id}/relationships/products`)

- **`configureByContextProduct`** (`POST /catalog/products/{product_id}/configure`)

- **`getCatalogs`** (`GET /catalogs`)

- **`createCatalog`** (`POST /catalogs`)

- **`deleteCatalogById`** (`DELETE /catalogs/{catalog_id}`)

- **`getCatalogById`** (`GET /catalogs/{catalog_id}`)

- **`updateCatalog`** (`PUT /catalogs/{catalog_id}`)

- **`deleteReleases`** (`DELETE /catalogs/{catalog_id}/releases`)

- **`getReleases`** (`GET /catalogs/{catalog_id}/releases`)

- **`publishRelease`** (`POST /catalogs/{catalog_id}/releases`)

- **`deleteReleaseById`** (`DELETE /catalogs/{catalog_id}/releases/{release_id}`)

- **`getReleaseById`** (`GET /catalogs/{catalog_id}/releases/{release_id}`)

- **`getRules`** (`GET /catalogs/rules`)

- **`createRule`** (`POST /catalogs/rules`)

- **`deleteRuleById`** (`DELETE /catalogs/rules/{catalog_rule_id}`)

- **`getRuleById`** (`GET /catalogs/rules/{catalog_rule_id}`)

- **`updateRule`** (`PUT /catalogs/rules/{catalog_rule_id}`)

- **`getAllHierarchies`** (`GET /catalogs/{catalog_id}/releases/{release_id}/hierarchies`)

- **`getHierarchy`** (`GET /catalogs/{catalog_id}/releases/{release_id}/hierarchies/{hierarchy_id}`)

- **`getHierarchyNodes`** (`GET /catalogs/{catalog_id}/releases/{release_id}/hierarchies/{hierarchy_id}/nodes`)

- **`getHierarchyChildNodes`** (`GET /catalogs/{catalog_id}/releases/{release_id}/hierarchies/{hierarchy_id}/children`)

- **`getAllNodes`** (`GET /catalogs/{catalog_id}/releases/{release_id}/nodes`)

- **`getNode`** (`GET /catalogs/{catalog_id}/releases/{release_id}/nodes/{node_id}`)

- **`getChildNodes`** (`GET /catalogs/{catalog_id}/releases/{release_id}/nodes/{node_id}/relationships/children`)

- **`getAllProducts`** (`GET /catalogs/{catalog_id}/releases/{release_id}/products`)

- **`getProduct`** (`GET /catalogs/{catalog_id}/releases/{release_id}/products/{product_id}`)

- **`getComponentProductIds`** (`GET /catalogs/{catalog_id}/releases/{release_id}/products/{product_id}/relationships/component_products`)

- **`getChildProducts`** (`GET /catalogs/{catalog_id}/releases/{release_id}/products/{product_id}/relationships/children`)

- **`getProductsForHierarchy`** (`GET /catalogs/{catalog_id}/releases/{release_id}/hierarchies/{hierarchy_id}/products`)

- **`getProductsForNode`** (`GET /catalogs/{catalog_id}/releases/{release_id}/nodes/{node_id}/relationships/products`)

- **`getCarts`** (`GET /v2/carts`)

- **`createACart`** (`POST /v2/carts`)

- **`deleteACart`** (`DELETE /v2/carts/{cartID}`)

- **`getCart`** (`GET /v2/carts/{cartID}`)

- **`updateACart`** (`PUT /v2/carts/{cartID}`)

- **`deleteAllCartItems`** (`DELETE /v2/carts/{cartID}/items`)

- **`getCartItems`** (`GET /v2/carts/{cartID}/items`)

- **`manageCarts`** (`POST /v2/carts/{cartID}/items`)

- **`bulkUpdateItemsInCart`** (`PUT /v2/carts/{cartID}/items`)

- **`deleteACartItem`** (`DELETE /v2/carts/{cartID}/items/{cartitemID}`)

- **`updateACartItem`** (`PUT /v2/carts/{cartID}/items/{cartitemID}`)

- **`deleteAccountCartAssociation`** (`DELETE /v2/carts/{cartID}/relationships/accounts`)

- **`createAccountCartAssociation`** (`POST /v2/carts/{cartID}/relationships/accounts`)

- **`deleteCustomerCartAssociation`** (`DELETE /v2/carts/{cartID}/relationships/customers`)

- **`createCustomerCartAssociation`** (`POST /v2/carts/{cartID}/relationships/customers`)

- **`deleteAPromotionViaPromotionCode`** (`DELETE /v2/carts/{cartID}/discounts/{promoCode}`)

- **`addTaxItemToCart`** (`POST /v2/carts/{cartID}/items/{cartitemID}/taxes`)

- **`bulkDeleteTaxItemsFromCart`** (`DELETE /v2/carts/{cartID}/taxes`)

- **`bulkAddTaxItemsToCart`** (`POST /v2/carts/{cartID}/taxes`)

- **`deleteATaxItem`** (`DELETE /v2/carts/{cartID}/items/{cartitemID}/taxes/{taxitemID}`)

- **`updateATaxItem`** (`PUT /v2/carts/{cartID}/items/{cartitemID}/taxes/{taxitemID}`)

- **`bulkDeleteCustomDiscountsFromCart`** (`DELETE /v2/carts/{cartID}/custom-discounts`)

- **`bulkAddCustomDiscountsToCart`** (`POST /v2/carts/{cartID}/custom-discounts`)

- **`deleteCustomDiscountFromCart`** (`DELETE /v2/carts/{cartID}/custom-discounts/{customdiscountID}`)

- **`updateCustomDiscountForCart`** (`PUT /v2/carts/{cartID}/custom-discounts/{customdiscountID}`)

- **`addCustomDiscountToCartItem`** (`POST /v2/carts/{cartID}/items/{cartitemID}/custom-discounts`)

- **`deleteCustomDiscountFromCartItem`** (`DELETE /v2/carts/{cartID}/items/{cartitemID}/custom-discounts/{customdiscountID}`)

- **`updateCustomDiscountForCartItem`** (`PUT /v2/carts/{cartID}/items/{cartitemID}/custom-discounts/{customdiscountID}`)

- **`createCartPaymentIntent`** (`POST /v2/carts/{cartID}/payments`)

- **`checkoutApi`** (`POST /v2/carts/{cartID}/checkout`)

- **`getCustomerOrders`** (`GET /v2/orders`)

- **`getAnOrder`** (`GET /v2/orders/{orderID}`)

- **`updateAnOrder`** (`PUT /v2/orders/{orderID}`)

- **`getOrderItems`** (`GET /v2/orders/{orderID}/items`)

- **`anonymizeOrders`** (`POST /v2/orders/anonymize`)

- **`paymentSetup`** (`POST /v2/orders/{orderID}/payments`)

- **`confirmPayment`** (`POST /v2/orders/{orderID}/transactions/{transactionID}/confirm`)

- **`captureATransaction`** (`POST /v2/orders/{orderID}/transactions/{transactionID}/capture`)

- **`refundATransaction`** (`POST /v2/orders/{orderID}/transactions/{transactionID}/refund`)

- **`getOrderTransactions`** (`GET /v2/orders/{orderID}/transactions`)

- **`getATransaction`** (`GET /v2/orders/{orderID}/transactions/{transactionID}`)

- **`cancelATransaction`** (`POST /v2/orders/{orderID}/transactions/{transactionID}/cancel`)

- **`getSubscriptionProduct`** (`GET /v2/subscriptions/products/{product_uuid}`)

- **`getPlan`** (`GET /v2/subscriptions/plans/{plan_uuid}`)

- **`listOfferings`** (`GET /v2/subscriptions/offerings`)

- **`getOffering`** (`GET /v2/subscriptions/offerings/{offering_uuid}`)

- **`listOfferingPlans`** (`GET /v2/subscriptions/offerings/{offering_uuid}/plans`)

- **`listOfferingFeatures`** (`GET /v2/subscriptions/offerings/{offering_uuid}/features`)

- **`listOfferingProducts`** (`GET /v2/subscriptions/offerings/{offering_uuid}/products`)

- **`getFeature`** (`GET /v2/subscriptions/features/{feature_uuid}`)

- **`getStock`** (`GET /v2/inventories/{product_uuid}`)

- **`listLocations`** (`GET /v2/inventories/locations`)

- **`createAnAccessToken`** (`POST /oauth/access_token`)

- **`getV2AccountAddresses`** (`GET /v2/accounts/{accountID}/addresses`)

- **`deleteV2AccountAddress`** (`DELETE /v2/accounts/{accountID}/addresses/{addressID}`)

- **`getV2AccountAddress`** (`GET /v2/accounts/{accountID}/addresses/{addressID}`)

- **`postV2AccountAddress`** (`POST /v2/accounts/{accountID}/addresses/{addressID}`)

- **`putV2AccountAddress`** (`PUT /v2/accounts/{accountID}/addresses/{addressID}`)

- **`getV2Accounts`** (`GET /v2/accounts`)

- **`getV2AccountsAccountId`** (`GET /v2/accounts/{accountID}`)

- **`getV2AccountMembers`** (`GET /v2/account-members`)

- **`getV2AccountMembersAccountMemberId`** (`GET /v2/account-members/{accountMemberID}`)

- **`getV2AccountsAccountIdAccountMemberships`** (`GET /v2/accounts/{accountID}/account-memberships`)

- **`postV2AccountMembersTokens`** (`POST /v2/account-members/tokens`)



---
