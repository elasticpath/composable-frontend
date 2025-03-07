# @epcc-sdk/sdks-subscriptions SDK

**Version:** `0.0.1`

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
npm install @epcc-sdk/sdks-subscriptions
# or
pnpm install @epcc-sdk/sdks-subscriptions
# or
yarn add @epcc-sdk/sdks-subscriptions
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
import { client } from "@epcc-sdk/sdks-subscriptions";

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
import { createClient } from "@epcc-sdk/sdks-subscriptions";

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

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/sdks-subscriptions>".

```ts
const response = await getProduct({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getProduct({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/sdks-subscriptions";

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
import { client } from "@epcc-sdk/sdks-subscriptions";

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
import { client } from "@epcc-sdk/sdks-subscriptions";

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
import { getProduct } from "@epcc-sdk/sdks-subscriptions";

const product = await getProduct({
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



- **`listProducts`** (`GET /subscriptions/products`)

- **`createProduct`** (`POST /subscriptions/products`)

- **`deleteProduct`** (`DELETE /subscriptions/products/{product_uuid}`)

- **`getProduct`** (`GET /subscriptions/products/{product_uuid}`)

- **`updateProduct`** (`PUT /subscriptions/products/{product_uuid}`)

- **`listPlans`** (`GET /subscriptions/plans`)

- **`createPlan`** (`POST /subscriptions/plans`)

- **`deletePlan`** (`DELETE /subscriptions/plans/{plan_uuid}`)

- **`getPlan`** (`GET /subscriptions/plans/{plan_uuid}`)

- **`updatePlan`** (`PUT /subscriptions/plans/{plan_uuid}`)

- **`listOfferings`** (`GET /subscriptions/offerings`)

- **`createOffering`** (`POST /subscriptions/offerings`)

- **`buildOffering`** (`POST /subscriptions/offerings/build`)

- **`deleteOffering`** (`DELETE /subscriptions/offerings/{offering_uuid}`)

- **`getOffering`** (`GET /subscriptions/offerings/{offering_uuid}`)

- **`updateOffering`** (`PUT /subscriptions/offerings/{offering_uuid}`)

- **`deleteOfferingFeature`** (`DELETE /subscriptions/offerings/{offering_uuid}/features/{feature_uuid}`)

- **`updateOfferingFeature`** (`PUT /subscriptions/offerings/{offering_uuid}/features/{feature_uuid}`)

- **`attachOfferingFeature`** (`POST /subscriptions/offerings/{offering_uuid}/features/attach`)

- **`listOfferingPlans`** (`GET /subscriptions/offerings/{offering_uuid}/plans`)

- **`attachOfferingPlan`** (`POST /subscriptions/offerings/{offering_uuid}/plans/attach`)

- **`deleteOfferingPlan`** (`DELETE /subscriptions/offerings/{offering_uuid}/plans/{plan_uuid}`)

- **`updateOfferingPlan`** (`PUT /subscriptions/offerings/{offering_uuid}/plans/{plan_uuid}`)

- **`listOfferingFeatures`** (`GET /subscriptions/offerings/{offering_uuid}/features`)

- **`listOfferingProducts`** (`GET /subscriptions/offerings/{offering_uuid}/products`)

- **`attachOfferingProduct`** (`POST /subscriptions/offerings/{offering_uuid}/products/attach`)

- **`replaceOfferingProduct`** (`PUT /subscriptions/offerings/{offering_uuid}/products/replace`)

- **`deleteOfferingProduct`** (`DELETE /subscriptions/offerings/{offering_uuid}/products/{product_uuid}`)

- **`updateOfferingProduct`** (`PUT /subscriptions/offerings/{offering_uuid}/products/{product_uuid}`)

- **`listSubscriptions`** (`GET /subscriptions/subscriptions`)

- **`createSubscription`** (`POST /subscriptions/subscriptions`)

- **`deleteSubscription`** (`DELETE /subscriptions/subscriptions/{subscription_uuid}`)

- **`getSubscription`** (`GET /subscriptions/subscriptions/{subscription_uuid}`)

- **`updateSubscription`** (`PUT /subscriptions/subscriptions/{subscription_uuid}`)

- **`listSubscriptionProducts`** (`GET /subscriptions/subscriptions/{subscription_uuid}/products`)

- **`manageSubscriptionProducts`** (`PUT /subscriptions/subscriptions/{subscription_uuid}/products`)

- **`listSubscriptionPlans`** (`GET /subscriptions/subscriptions/{subscription_uuid}/plans`)

- **`listSubscriptionStates`** (`GET /subscriptions/subscriptions/{subscription_uuid}/states`)

- **`createSubscriptionState`** (`POST /subscriptions/subscriptions/{subscription_uuid}/states`)

- **`getSubscriptionState`** (`GET /subscriptions/subscriptions/{subscription_uuid}/states/{state_uuid}`)

- **`listJobs`** (`GET /subscriptions/jobs`)

- **`createJob`** (`POST /subscriptions/jobs`)

- **`deleteJob`** (`DELETE /subscriptions/jobs/{job_uuid}`)

- **`getJob`** (`GET /subscriptions/jobs/{job_uuid}`)

- **`listImportJobs`** (`GET /subscriptions/imports`)

- **`createImport`** (`POST /subscriptions/imports`)

- **`getImport`** (`GET /subscriptions/imports/{import_uuid}`)

- **`getImportErrors`** (`GET /subscriptions/imports/{import_uuid}/errors`)

- **`listSubscriptionInvoices`** (`GET /subscriptions/subscriptions/{subscription_uuid}/invoices`)

- **`listSubscriptionInvoicePayments`** (`GET /subscriptions/subscriptions/{subscription_uuid}/invoices/{invoice_uuid}/payments`)

- **`getSubscriptionInvoicePayment`** (`GET /subscriptions/subscriptions/{subscription_uuid}/invoices/{invoice_uuid}/payments/{payment_uuid}`)

- **`getSubscriptionInvoice`** (`GET /subscriptions/subscriptions/{subscription_uuid}/invoices/{invoice_uuid}`)

- **`listInvoices`** (`GET /subscriptions/invoices`)

- **`getInvoice`** (`GET /subscriptions/invoices/{invoice_uuid}`)

- **`listInvoicePayments`** (`GET /subscriptions/invoices/{invoice_uuid}/payments`)

- **`getInvoicePayment`** (`GET /subscriptions/invoices/{invoice_uuid}/payments/{payment_uuid}`)

- **`updateInvoicePayment`** (`PUT /subscriptions/invoices/{invoice_uuid}/payments/{payment_uuid}`)

- **`listSchedules`** (`GET /subscriptions/schedules`)

- **`createSchedule`** (`POST /subscriptions/schedules`)

- **`deleteSchedule`** (`DELETE /subscriptions/schedules/{schedule_uuid}`)

- **`getSchedule`** (`GET /subscriptions/schedules/{schedule_uuid}`)

- **`updateSchedule`** (`PUT /subscriptions/schedules/{schedule_uuid}`)

- **`listSubscribers`** (`GET /subscriptions/subscribers`)

- **`createSubscriber`** (`POST /subscriptions/subscribers`)

- **`deleteSubscriber`** (`DELETE /subscriptions/subscribers/{subscriber_uuid}`)

- **`getSubscriber`** (`GET /subscriptions/subscribers/{subscriber_uuid}`)

- **`updateSubscriber`** (`PUT /subscriptions/subscribers/{subscriber_uuid}`)

- **`listDunningRules`** (`GET /subscriptions/dunning-rules`)

- **`createDunningRule`** (`POST /subscriptions/dunning-rules`)

- **`deleteDunningRule`** (`DELETE /subscriptions/dunning-rules/{dunning_rule_uuid}`)

- **`getDunningRule`** (`GET /subscriptions/dunning-rules/{dunning_rule_uuid}`)

- **`updateDunningRule`** (`PUT /subscriptions/dunning-rules/{dunning_rule_uuid}`)

- **`listProrationPolicies`** (`GET /subscriptions/proration-policies`)

- **`createProrationPolicy`** (`POST /subscriptions/proration-policies`)

- **`deleteProrationPolicy`** (`DELETE /subscriptions/proration-policies/{proration_policy_uuid}`)

- **`getProrationPolicy`** (`GET /subscriptions/proration-policies/{proration_policy_uuid}`)

- **`updateProrationPolicy`** (`PUT /subscriptions/proration-policies/{proration_policy_uuid}`)

- **`listFeatures`** (`GET /subscriptions/features`)

- **`createFeature`** (`POST /subscriptions/features`)

- **`deleteFeature`** (`DELETE /subscriptions/features/{feature_uuid}`)

- **`getFeature`** (`GET /subscriptions/features/{feature_uuid}`)

- **`updateFeature`** (`PUT /subscriptions/features/{feature_uuid}`)



---
