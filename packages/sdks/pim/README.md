# @epcc-sdk/sdks-pxm SDK

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
npm install @epcc-sdk/sdks-pxm
# or
pnpm install @epcc-sdk/sdks-pxm
# or
yarn add @epcc-sdk/sdks-pxm
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
import { client } from "@epcc-sdk/sdks-pxm";

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
import { createClient } from "@epcc-sdk/sdks-pxm";

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

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/sdks-pxm>".

```ts
const response = await getChildProducts({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getChildProducts({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/sdks-pxm";

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
import { client } from "@epcc-sdk/sdks-pxm";

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
import { client } from "@epcc-sdk/sdks-pxm";

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
import { getChildProducts } from "@epcc-sdk/sdks-pxm";

const product = await getChildProducts({
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



- **`getAllJobs`** (`GET /pcm/jobs`)

- **`getJob`** (`GET /pcm/jobs/{jobID}`)

- **`cancelJob`** (`POST /pcm/jobs/{jobID}/cancel`)

- **`getJobErrors`** (`GET /pcm/jobs/{jobID}/errors`)

- **`getAllProducts`** (`GET /pcm/products`)

- **`createProduct`** (`POST /pcm/products`)

- **`importProducts`** (`POST /pcm/products/import`)

- **`exportProducts`** (`POST /pcm/products/export`)

- **`deleteProduct`** (`DELETE /pcm/products/{productID}`)

- **`getProduct`** (`GET /pcm/products/{productID}`)

- **`updateProduct`** (`PUT /pcm/products/{productID}`)

- **`attachNodes`** (`POST /pcm/products/attach_nodes`)

- **`detachNodes`** (`POST /pcm/products/detach_nodes`)

- **`getProductsNodes`** (`GET /pcm/products/{productID}/nodes`)

- **`buildChildProducts`** (`POST /pcm/products/{productID}/build`)

- **`getChildProducts`** (`GET /pcm/products/{productID}/children`)

- **`deleteProductTemplateRelationship`** (`DELETE /pcm/products/{productID}/relationships/templates`)

- **`getProductTemplateRelationships`** (`GET /pcm/products/{productID}/relationships/templates`)

- **`createProductTemplateRelationship`** (`POST /pcm/products/{productID}/relationships/templates`)

- **`getProductComponentProductsRelationships`** (`GET /pcm/products/{productID}/relationships/component_products`)

- **`deleteProductFileRelationships`** (`DELETE /pcm/products/{productID}/relationships/files`)

- **`getProductFileRelationships`** (`GET /pcm/products/{productID}/relationships/files`)

- **`createProductFileRelationships`** (`POST /pcm/products/{productID}/relationships/files`)

- **`updateProductFileRelationships`** (`PUT /pcm/products/{productID}/relationships/files`)

- **`deleteProductVariationRelationships`** (`DELETE /pcm/products/{productID}/relationships/variations`)

- **`getProductVariationRelationships`** (`GET /pcm/products/{productID}/relationships/variations`)

- **`createProductVariationRelationships`** (`POST /pcm/products/{productID}/relationships/variations`)

- **`updateProductVariationRelationships`** (`PUT /pcm/products/{productID}/relationships/variations`)

- **`deleteProductMainImageRelationships`** (`DELETE /pcm/products/{productID}/relationships/main_image`)

- **`getProductMainImageRelationships`** (`GET /pcm/products/{productID}/relationships/main_image`)

- **`createProductMainImageRelationships`** (`POST /pcm/products/{productID}/relationships/main_image`)

- **`updateProductMainImageRelationships`** (`PUT /pcm/products/{productID}/relationships/main_image`)

- **`getAllVariations`** (`GET /pcm/variations`)

- **`createVariation`** (`POST /pcm/variations`)

- **`deleteVariation`** (`DELETE /pcm/variations/{variationID}`)

- **`getVariation`** (`GET /pcm/variations/{variationID}`)

- **`updateVariation`** (`PUT /pcm/variations/{variationID}`)

- **`getAllVariationOptions`** (`GET /pcm/variations/{variationID}/options`)

- **`createVariationOption`** (`POST /pcm/variations/{variationID}/options`)

- **`deleteVariationOption`** (`DELETE /pcm/variations/{variationID}/options/{optionID}`)

- **`getVariationOption`** (`GET /pcm/variations/{variationID}/options/{optionID}`)

- **`updateVariationOption`** (`PUT /pcm/variations/{variationID}/options/{optionID}`)

- **`getAllModifiers`** (`GET /pcm/variations/{variationID}/options/{optionID}/modifiers`)

- **`createModifier`** (`POST /pcm/variations/{variationID}/options/{optionID}/modifiers`)

- **`deleteModifier`** (`DELETE /pcm/variations/{variationID}/options/{optionID}/modifiers/{modifierID}`)

- **`getModifier`** (`GET /pcm/variations/{variationID}/options/{optionID}/modifiers/{modifierID}`)

- **`updateModifier`** (`PUT /pcm/variations/{variationID}/options/{optionID}/modifiers/{modifierID}`)

- **`getHierarchy`** (`GET /pcm/hierarchies`)

- **`createHierarchy`** (`POST /pcm/hierarchies`)

- **`deleteHierarchy`** (`DELETE /pcm/hierarchies/{hierarchyID}`)

- **`getHierarchyChild`** (`GET /pcm/hierarchies/{hierarchyID}`)

- **`updateHierarchy`** (`PUT /pcm/hierarchies/{hierarchyID}`)

- **`getAllNodesInHierarchy`** (`GET /pcm/hierarchies/{hierarchyID}/nodes`)

- **`createNode`** (`POST /pcm/hierarchies/{hierarchyID}/nodes`)

- **`deleteNode`** (`DELETE /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}`)

- **`getHierarchyNode`** (`GET /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}`)

- **`updateNode`** (`PUT /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}`)

- **`getAllChildren`** (`GET /pcm/hierarchies/{hierarchyID}/children`)

- **`createNodeChildRelationships`** (`POST /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/relationships/children`)

- **`getAllNodeChildren`** (`GET /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/children`)

- **`deleteNodeParent`** (`DELETE /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/relationships/parent`)

- **`updateNodeParent`** (`PUT /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/relationships/parent`)

- **`deleteNodeProductRelationships`** (`DELETE /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/relationships/products`)

- **`createNodeProductRelationship`** (`POST /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/relationships/products`)

- **`getNodeProducts`** (`GET /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/products`)

- **`duplicateHierarchy`** (`POST /pcm/hierarchies/{hierarchyID}/duplicate_job`)

- **`getAllProductTags`** (`GET /pcm/tags`)

- **`getProductTag`** (`GET /pcm/tags/{tagID}`)

- **`createCustomRelationship`** (`POST /pcm/custom_relationships`)

- **`updateCustomRelationship`** (`PUT /pcm/custom_relationships/{customRelationshipSlug}`)



---
