# @epcc-sdk/sdks-metrics SDK

A TypeScript client for the Elastic Path Metrics API, with order and product summaries and time series. Below you'll find instructions on how to install, set up, and use the client, along with a list of available operations.


## Features

- type-safe response data and errors
- response data validation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology

---


## Installation

```bash
npm install @epcc-sdk/sdks-metrics
# or
pnpm install @epcc-sdk/sdks-metrics
# or
yarn add @epcc-sdk/sdks-metrics
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
import { client } from "@epcc-sdk/sdks-metrics";

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
import { createClient } from "@epcc-sdk/sdks-metrics";

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

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/sdks-metrics".

```ts
const response = await getOrdersMetricsSummary({
    client: myClient,
    query: {
        start_date: "2025-01-01T00:00:00.000Z",
        end_date: "2025-01-31T23:59:59.999Z",
        currency: "USD",
    },
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getOrdersMetricsSummary({
    baseUrl: 'https://example.com', // <-- override default configuration
    query: {
        start_date: "2025-01-01T00:00:00.000Z",
        end_date: "2025-01-31T23:59:59.999Z",
        currency: "USD",
    },
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/sdks-metrics";

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
import { client } from "@epcc-sdk/sdks-metrics";

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

`createMetricsClient` is the short way. It returns a client that holds a caching token
source, sets the `auth` hook, refreshes and replays once on a 401, and backs off on a 429.

```ts
import {
  createMetricsClient,
  getOrdersMetricsSummary,
} from "@epcc-sdk/sdks-metrics";

const client = createMetricsClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
});

const { data } = await getOrdersMetricsSummary({
  client,
  query: {
    start_date: "2025-01-01T00:00:00.000Z",
    end_date: "2025-01-31T23:59:59.999Z",
    currency: "USD",
  },
});
```

Credentials come from `source`, `provider`, `token`, `clientId` plus `clientSecret`, or
`clientId` alone for the implicit grant. `retry`, `storage`, `leewaySeconds`, `fetch` and
`config` tune the rest. `config` is merged last, so anything the factory chose can be
overridden.

Pass the client to every operation. The module-level `client` exported by this package
carries no credentials, so an operation called without `{ client }` gets a 401.

To assemble the stack by hand, `createTokenSource`, `createAuthenticatedFetch`,
`createRetryFetch` and `createConfiguredClient` are re-exported from this package, so you
still install only `@epcc-sdk/sdks-metrics`. Do not authenticate with a request
interceptor: an interceptor cannot see the response, so it can never retry a 401.

## Validation schemas

Zod schemas for every query, path and response are published under the `/zod`
subpath. `zod` is an optional peer dependency (3.x), so the root entry never imports it.

```ts
import { zGetOrdersMetricsSummaryResponse } from "@epcc-sdk/sdks-metrics/zod";

const summary = zGetOrdersMetricsSummaryResponse.parse(data);
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





## Dates and amounts

Every operation takes `start_date`, `end_date` and `currency`. The time series operations also
take `interval`, and `timezone` is optional on them.

- **Dates need millisecond precision.** Send `2025-01-01T00:00:00.000Z`. A date without
  milliseconds, such as `2025-01-01T00:00:00Z`, gets a 400. `start_date` is inclusive,
  `end_date` is exclusive and must be after `start_date`.
- **`currency`** is a three-letter code such as `USD`.
- **`interval`** is `"1hr"`, `"1d"` or `"1wk"`. Any other value is a compile error.
- **`timezone`** sets the starting hour of a day or week, for example `America/New_York`.
- **`filter`** is available on the order operations. It supports `product_ids`,
  `product_skus`, `promotion_ids` and `promotion_codes` with the `contains` operator, for
  example `contains(product_ids,3fa85f64-5717-4562-b3fc-2c963f66afa6)`.
- **Values are in the currency's smallest unit**, for example cents for `USD`. Counts and
  amounts are typed as `number`.
- **Time series buckets** carry `start_date` and the measured value: `count`, `discount`,
  `value` or `units_sold`, depending on the operation.

---

## Operation Usage
The following examples demonstrate how to use the operation functions to make requests.

```ts
import {
  createMetricsClient,
  getOrdersCountTimeSeries,
  getProductMetricsSummary,
} from "@epcc-sdk/sdks-metrics";

const client = createMetricsClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
});

const daily = await getOrdersCountTimeSeries({
  client,
  query: {
    start_date: "2025-01-01T00:00:00.000Z",
    end_date: "2025-01-31T23:59:59.999Z",
    currency: "USD",
    interval: "1d",
    timezone: "America/New_York",
  },
});

const product = await getProductMetricsSummary({
  client,
  path: { "product-id": "3fa85f64-5717-4562-b3fc-2c963f66afa6" },
  query: {
    start_date: "2025-01-01T00:00:00.000Z",
    end_date: "2025-01-31T23:59:59.999Z",
    currency: "USD",
  },
});
```

A 400 response carries the API's own detail in `error.errors[].detail`.

---

## Available Operations

- **`getOrdersMetricsSummary`** (`GET /v2/metrics/orders/summary`)

- **`getOrdersCountTimeSeries`** (`GET /v2/metrics/orders/timeseries/count`)

- **`getOrdersDiscountTimeSeries`** (`GET /v2/metrics/orders/timeseries/discount`)

- **`getOrdersValueTimeSeries`** (`GET /v2/metrics/orders/timeseries/value`)

- **`getProductMetricsSummary`** (`GET /v2/metrics/products/{product-id}/summary`)

- **`getProductUnitsSoldTimeSeries`** (`GET /v2/metrics/products/{product-id}/timeseries/units-sold`)

- **`getProductValueTimeSeries`** (`GET /v2/metrics/products/{product-id}/timeseries/value`)
