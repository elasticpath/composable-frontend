# @epcc-sdk/sdks-shopper SDK

Below you'll find instructions on how to install, set up, and use the client, along with a list of available operations.


## Authentication (Browser)

The SDK includes built-in authentication support for browser environments using Elastic Path's implicit authentication flow. It handles token management, automatic refresh, and storage.

### Quick Start

> **Note**: This authentication mechanism is designed for browser environments where state persistence (localStorage, cookies) is available. The built-in storage adapters and cross-tab synchronization features require browser APIs.

```typescript
import { configureClient } from "@epcc-sdk/sdks-shopper/auth/configure-client";

// Configure the singleton client with authentication
configureClient(
  { 
    baseUrl: "https://useast.api.elasticpath.com" 
  },
  {
    clientId: "your-client-id",
    storage: "localStorage" // or "cookie" or custom adapter
  }
);
```

### Storage Options

- **localStorage** (default): Tokens stored in browser localStorage with cross-tab synchronization
- **cookie**: Tokens stored in JavaScript-readable cookies
- **Custom adapter**: Implement your own storage mechanism

```typescript
// Cookie storage with options
configureClient(config, {
  clientId: "your-client-id",
  storage: "cookie",
  cookie: { 
    sameSite: "Strict",
    secure: true,
    maxAge: 3600 // 1 hour
  }
});
```

### Creating Standalone Clients

For multiple stores or isolated instances:

```typescript
import { createShopperClient } from "@epcc-sdk/sdks-shopper";

const { client, auth } = createShopperClient(
  { baseUrl: "https://useast.api.elasticpath.com" },
  { clientId: "your-client-id" }
);
```

### Manual Auth Control

Access the underlying auth instance for manual control:

```typescript
const { client, auth } = configureClient(config, authOptions);

// Check authentication status
if (auth.isAuthenticated()) {
  console.log("Authenticated!");
}

// Manually clear tokens
auth.clearToken();
```

### Features

- **Automatic token refresh**: Refreshes expired tokens automatically
- **Request retry**: Retries failed requests once after refreshing token
- **Cross-tab sync**: localStorage adapter syncs auth state across browser tabs
- **Type-safe**: Full TypeScript support with proper types
- **Flexible storage**: Built-in adapters or bring your own

## React Query Support

This SDK provides optional React Query hooks for React applications. To use them, you need to:

1. Install `@tanstack/react-query` as a peer dependency:
   ```bash
   npm install @tanstack/react-query
   # or
   pnpm install @tanstack/react-query
   # or
   yarn add @tanstack/react-query
   ```

2. Import hooks from the `/react-query` subpath:
   ```ts
   import { useGetByContextProduct } from "@epcc-sdk/sdks-shopper/react-query";
   ```

**Note**: If you're not using React or React Query, you can use the SDK without installing `@tanstack/react-query`. The main exports work independently.


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


### **`getByContextRelease`**

**Endpoint:** `GET /catalog`

**Summary:** Get the catalog release as shoppers

**Description:** Returns a list of all published releases of the specified catalog.

**TypeScript Example:**

```typescript
import { getByContextRelease, type GetByContextReleaseData, type GetByContextReleaseResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextReleaseData = {
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Channel": "web", // OPTIONAL
  },
};

const result: GetByContextReleaseResponse = await getByContextRelease(params);
```

---

### **`getByContextAllHierarchies`**

**Endpoint:** `GET /catalog/hierarchies`

**Summary:** Get all Hierarchies

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextAllHierarchies, type GetByContextAllHierarchiesData, type GetByContextAllHierarchiesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextAllHierarchiesData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Channel": "web", // OPTIONAL
  },
};

const result: GetByContextAllHierarchiesResponse = await getByContextAllHierarchies(params);
```

---

### **`getByContextHierarchy`**

**Endpoint:** `GET /catalog/hierarchies/{hierarchy_id}`

**Summary:** Get a Hierarchy

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextHierarchy, type GetByContextHierarchyData, type GetByContextHierarchyResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextHierarchyData = {
  path: {
    hierarchy_id: "12345678-1234-5678-9012-123456789012",
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Channel": "web", // OPTIONAL
  },
};

const result: GetByContextHierarchyResponse = await getByContextHierarchy(params);
```

---

### **`getByContextHierarchyNodes`**

**Endpoint:** `GET /catalog/hierarchies/{hierarchy_id}/nodes`

**Summary:** Get a Hierarchy&#39;s Nodes

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextHierarchyNodes, type GetByContextHierarchyNodesData, type GetByContextHierarchyNodesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextHierarchyNodesData = {
  path: {
    hierarchy_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "EP-Channel": "web", // OPTIONAL
    "EP-Context-Tag": "header-value", // OPTIONAL
  },
};

const result: GetByContextHierarchyNodesResponse = await getByContextHierarchyNodes(params);
```

---

### **`getByContextHierarchyChildNodes`**

**Endpoint:** `GET /catalog/hierarchies/{hierarchy_id}/children`

**Summary:** Get a Hierarchy&#39;s Children

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextHierarchyChildNodes, type GetByContextHierarchyChildNodesData, type GetByContextHierarchyChildNodesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextHierarchyChildNodesData = {
  path: {
    hierarchy_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "EP-Channel": "web", // OPTIONAL
    "EP-Context-Tag": "header-value", // OPTIONAL
  },
};

const result: GetByContextHierarchyChildNodesResponse = await getByContextHierarchyChildNodes(params);
```

---

### **`getByContextAllNodes`**

**Endpoint:** `GET /catalog/nodes`

**Summary:** Get all Nodes

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextAllNodes, type GetByContextAllNodesData, type GetByContextAllNodesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextAllNodesData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "EP-Channel": "web", // OPTIONAL
    "EP-Context-Tag": "header-value", // OPTIONAL
  },
};

const result: GetByContextAllNodesResponse = await getByContextAllNodes(params);
```

---

### **`getByContextNode`**

**Endpoint:** `GET /catalog/nodes/{node_id}`

**Summary:** Get a Node

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextNode, type GetByContextNodeData, type GetByContextNodeResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextNodeData = {
  path: {
    node_id: "12345678-1234-5678-9012-123456789012",
  },
  headers: {
    "EP-Channel": "web", // OPTIONAL
    "EP-Context-Tag": "header-value", // OPTIONAL
  },
};

const result: GetByContextNodeResponse = await getByContextNode(params);
```

---

### **`getByContextChildNodes`**

**Endpoint:** `GET /catalog/nodes/{node_id}/relationships/children`

**Summary:** Get a Node&#39;s Children

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextChildNodes, type GetByContextChildNodesData, type GetByContextChildNodesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextChildNodesData = {
  path: {
    node_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "EP-Channel": "web", // OPTIONAL
    "EP-Context-Tag": "header-value", // OPTIONAL
  },
};

const result: GetByContextChildNodesResponse = await getByContextChildNodes(params);
```

---

### **`getByContextAllProducts`**

**Endpoint:** `GET /catalog/products`

**Summary:** Get all Products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextAllProducts, type GetByContextAllProductsData, type GetByContextAllProductsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextAllProductsData = {
  query: {
    "include": ["files", "main_images"], // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Channel": "web", // OPTIONAL
  },
};

const result: GetByContextAllProductsResponse = await getByContextAllProducts(params);
```

---

### **`getByContextProduct`**

**Endpoint:** `GET /catalog/products/{product_id}`

**Summary:** Get a Product

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextProduct, type GetByContextProductData, type GetByContextProductResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextProductData = {
  path: {
    product_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Channel": "web", // OPTIONAL
  },
};

const result: GetByContextProductResponse = await getByContextProduct(params);
```

---

### **`getByContextAllRelatedProducts`**

**Endpoint:** `GET /catalog/products/{product_id}/relationships/{custom_relationship_slug}/products`

**Summary:** Get all Related Products of a Product

**Description:** Returns related products of the provided product ID from a catalog.


**TypeScript Example:**

```typescript
import { getByContextAllRelatedProducts, type GetByContextAllRelatedProductsData, type GetByContextAllRelatedProductsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextAllRelatedProductsData = {
  path: {
    product_id: "12345678-1234-5678-9012-123456789012",
    custom_relationship_slug: "product-slug",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Channel": "web", // OPTIONAL
  },
};

const result: GetByContextAllRelatedProductsResponse = await getByContextAllRelatedProducts(params);
```

---

### **`getByContextComponentProductIds`**

**Endpoint:** `GET /catalog/products/{product_id}/relationships/component_products`

**Summary:** Get a Bundle&#39;s Component Products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextComponentProductIds, type GetByContextComponentProductIdsData, type GetByContextComponentProductIdsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextComponentProductIdsData = {
  path: {
    product_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "EP-Channel": "web", // OPTIONAL
    "EP-Context-Tag": "header-value", // OPTIONAL
  },
};

const result: GetByContextComponentProductIdsResponse = await getByContextComponentProductIds(params);
```

---

### **`getByContextChildProducts`**

**Endpoint:** `GET /catalog/products/{product_id}/relationships/children`

**Summary:** Get a Parent Product&#39;s Child Products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextChildProducts, type GetByContextChildProductsData, type GetByContextChildProductsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextChildProductsData = {
  path: {
    product_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
  headers: {
    "EP-Channel": "web", // OPTIONAL
    "EP-Context-Tag": "header-value", // OPTIONAL
  },
};

const result: GetByContextChildProductsResponse = await getByContextChildProducts(params);
```

---

### **`getByContextProductsForHierarchy`**

**Endpoint:** `GET /catalog/hierarchies/{hierarchy_id}/products`

**Summary:** Get a Hierarchy&#39;s Products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextProductsForHierarchy, type GetByContextProductsForHierarchyData, type GetByContextProductsForHierarchyResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextProductsForHierarchyData = {
  path: {
    hierarchy_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Channel": "web", // OPTIONAL
  },
};

const result: GetByContextProductsForHierarchyResponse = await getByContextProductsForHierarchy(params);
```

---

### **`getByContextProductsForNode`**

**Endpoint:** `GET /catalog/nodes/{node_id}/relationships/products`

**Summary:** Get a Node&#39;s Products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getByContextProductsForNode, type GetByContextProductsForNodeData, type GetByContextProductsForNodeResponse } from "@epcc-sdk/sdks-shopper";

const params: GetByContextProductsForNodeData = {
  path: {
    node_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Channel": "web", // OPTIONAL
  },
};

const result: GetByContextProductsForNodeResponse = await getByContextProductsForNode(params);
```

---

### **`configureByContextProduct`**

**Endpoint:** `POST /catalog/products/{product_id}/configure`

**Summary:** Configure a Shopper Bundle

**Description:** POST operation

**TypeScript Example:**

```typescript
import { configureByContextProduct, type ConfigureByContextProductData, type ConfigureByContextProductResponse } from "@epcc-sdk/sdks-shopper";

const params: ConfigureByContextProductData = {
  path: {
    product_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Channel": "web", // OPTIONAL
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: ConfigureByContextProductResponse = await configureByContextProduct(params);
```

---

### **`getCatalogs`**

**Endpoint:** `GET /catalogs`

**Summary:** Gets all authorized catalogs

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getCatalogs, type GetCatalogsData, type GetCatalogsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetCatalogsData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
};

const result: GetCatalogsResponse = await getCatalogs(params);
```

---

### **`createCatalog`**

**Endpoint:** `POST /catalogs`

**Summary:** Creates a new catalog

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createCatalog, type CreateCatalogData, type CreateCatalogResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateCatalogData = {
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: CreateCatalogResponse = await createCatalog(params);
```

---

### **`deleteCatalogById`**

**Endpoint:** `DELETE /catalogs/{catalog_id}`

**Summary:** Deletes a catalog

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteCatalogById, type DeleteCatalogByIdData, type DeleteCatalogByIdResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteCatalogByIdData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteCatalogByIdResponse = await deleteCatalogById(params);
```

---

### **`getCatalogById`**

**Endpoint:** `GET /catalogs/{catalog_id}`

**Summary:** Get a catalog by ID

**Description:** Retrieves the specified catalog.

**TypeScript Example:**

```typescript
import { getCatalogById, type GetCatalogByIdData, type GetCatalogByIdResponse } from "@epcc-sdk/sdks-shopper";

const params: GetCatalogByIdData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetCatalogByIdResponse = await getCatalogById(params);
```

---

### **`updateCatalog`**

**Endpoint:** `PUT /catalogs/{catalog_id}`

**Summary:** Updates a catalog

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateCatalog, type UpdateCatalogData, type UpdateCatalogResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdateCatalogData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
  },
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: UpdateCatalogResponse = await updateCatalog(params);
```

---

### **`deleteReleases`**

**Endpoint:** `DELETE /catalogs/{catalog_id}/releases`

**Summary:** Deletes all releases

**Description:** Deletes all releases of the specified published catalog.

**TypeScript Example:**

```typescript
import { deleteReleases, type DeleteReleasesData, type DeleteReleasesResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteReleasesData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteReleasesResponse = await deleteReleases(params);
```

---

### **`getReleases`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases`

**Summary:** Gets all authorized catalog releases

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getReleases, type GetReleasesData, type GetReleasesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetReleasesData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
  },
};

const result: GetReleasesResponse = await getReleases(params);
```

---

### **`publishRelease`**

**Endpoint:** `POST /catalogs/{catalog_id}/releases`

**Summary:** Publishes a catalog

**Description:** POST operation

**TypeScript Example:**

```typescript
import { publishRelease, type PublishReleaseData, type PublishReleaseResponse } from "@epcc-sdk/sdks-shopper";

const params: PublishReleaseData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PublishReleaseResponse = await publishRelease(params);
```

---

### **`deleteReleaseById`**

**Endpoint:** `DELETE /catalogs/{catalog_id}/releases/{release_id}`

**Summary:** Deletes a release

**Description:** Deletes the specified published catalog release.

**TypeScript Example:**

```typescript
import { deleteReleaseById, type DeleteReleaseByIdData, type DeleteReleaseByIdResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteReleaseByIdData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteReleaseByIdResponse = await deleteReleaseById(params);
```

---

### **`getReleaseById`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}`

**Summary:** Get a catalog release by ID

**Description:** Retrieves the specified catalog release.

**TypeScript Example:**

```typescript
import { getReleaseById, type GetReleaseByIdData, type GetReleaseByIdResponse } from "@epcc-sdk/sdks-shopper";

const params: GetReleaseByIdData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
  },
};

const result: GetReleaseByIdResponse = await getReleaseById(params);
```

---

### **`getRules`**

**Endpoint:** `GET /catalogs/rules`

**Summary:** Gets all authorized catalog rules

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getRules, type GetRulesData, type GetRulesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetRulesData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
};

const result: GetRulesResponse = await getRules(params);
```

---

### **`createRule`**

**Endpoint:** `POST /catalogs/rules`

**Summary:** Creates a new catalog rule

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createRule, type CreateRuleData, type CreateRuleResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateRuleData = {
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: CreateRuleResponse = await createRule(params);
```

---

### **`deleteRuleById`**

**Endpoint:** `DELETE /catalogs/rules/{catalog_rule_id}`

**Summary:** Deletes a catalog rule

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteRuleById, type DeleteRuleByIdData, type DeleteRuleByIdResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteRuleByIdData = {
  path: {
    catalog_rule_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteRuleByIdResponse = await deleteRuleById(params);
```

---

### **`getRuleById`**

**Endpoint:** `GET /catalogs/rules/{catalog_rule_id}`

**Summary:** Get a catalog rule by ID

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getRuleById, type GetRuleByIdData, type GetRuleByIdResponse } from "@epcc-sdk/sdks-shopper";

const params: GetRuleByIdData = {
  path: {
    catalog_rule_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetRuleByIdResponse = await getRuleById(params);
```

---

### **`updateRule`**

**Endpoint:** `PUT /catalogs/rules/{catalog_rule_id}`

**Summary:** Updates a catalog rule

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateRule, type UpdateRuleData, type UpdateRuleResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdateRuleData = {
  path: {
    catalog_rule_id: "12345678-1234-5678-9012-123456789012",
  },
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: UpdateRuleResponse = await updateRule(params);
```

---

### **`getAllHierarchies`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/hierarchies`

**Summary:** Get all Hierarchies

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllHierarchies, type GetAllHierarchiesData, type GetAllHierarchiesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetAllHierarchiesData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
  },
};

const result: GetAllHierarchiesResponse = await getAllHierarchies(params);
```

---

### **`getHierarchy`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/hierarchies/{hierarchy_id}`

**Summary:** Get a Hierarchy

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getHierarchy, type GetHierarchyData, type GetHierarchyResponse } from "@epcc-sdk/sdks-shopper";

const params: GetHierarchyData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    hierarchy_id: "12345678-1234-5678-9012-123456789012",
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
  },
};

const result: GetHierarchyResponse = await getHierarchy(params);
```

---

### **`getHierarchyNodes`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/hierarchies/{hierarchy_id}/nodes`

**Summary:** Get a Hierarchy&#39;s Nodes

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getHierarchyNodes, type GetHierarchyNodesData, type GetHierarchyNodesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetHierarchyNodesData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    hierarchy_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
  },
};

const result: GetHierarchyNodesResponse = await getHierarchyNodes(params);
```

---

### **`getHierarchyChildNodes`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/hierarchies/{hierarchy_id}/children`

**Summary:** Get a Hierarchy&#39;s Children

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getHierarchyChildNodes, type GetHierarchyChildNodesData, type GetHierarchyChildNodesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetHierarchyChildNodesData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    hierarchy_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
  },
};

const result: GetHierarchyChildNodesResponse = await getHierarchyChildNodes(params);
```

---

### **`getAllNodes`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/nodes`

**Summary:** Get all Nodes

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllNodes, type GetAllNodesData, type GetAllNodesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetAllNodesData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
  },
};

const result: GetAllNodesResponse = await getAllNodes(params);
```

---

### **`getNode`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/nodes/{node_id}`

**Summary:** Get a Node

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getNode, type GetNodeData, type GetNodeResponse } from "@epcc-sdk/sdks-shopper";

const params: GetNodeData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    node_id: "12345678-1234-5678-9012-123456789012",
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
  },
};

const result: GetNodeResponse = await getNode(params);
```

---

### **`getChildNodes`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/nodes/{node_id}/relationships/children`

**Summary:** Get a Node&#39;s Children

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getChildNodes, type GetChildNodesData, type GetChildNodesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetChildNodesData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    node_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
  },
};

const result: GetChildNodesResponse = await getChildNodes(params);
```

---

### **`getAllProducts`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/products`

**Summary:** Get all Products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllProducts, type GetAllProductsData, type GetAllProductsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetAllProductsData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Pricebook-IDs-For-Price-Segmentation-Preview": "header-value", // OPTIONAL
  },
};

const result: GetAllProductsResponse = await getAllProducts(params);
```

---

### **`getProduct`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/products/{product_id}`

**Summary:** Get a Product

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getProduct, type GetProductData, type GetProductResponse } from "@epcc-sdk/sdks-shopper";

const params: GetProductData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    product_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Pricebook-IDs-For-Price-Segmentation-Preview": "header-value", // OPTIONAL
  },
};

const result: GetProductResponse = await getProduct(params);
```

---

### **`getAllRelatedProducts`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/products/{product_id}/relationships/{custom_relationship_slug}/products`

**Summary:** Get all Related Products of a Product

**Description:** Returns related products of the provided product ID from a published catalog.


**TypeScript Example:**

```typescript
import { getAllRelatedProducts, type GetAllRelatedProductsData, type GetAllRelatedProductsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetAllRelatedProductsData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    product_id: "12345678-1234-5678-9012-123456789012",
    custom_relationship_slug: "product-slug",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Pricebook-IDs-For-Price-Segmentation-Preview": "header-value", // OPTIONAL
  },
};

const result: GetAllRelatedProductsResponse = await getAllRelatedProducts(params);
```

---

### **`getComponentProductIds`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/products/{product_id}/relationships/component_products`

**Summary:** Get a Bundle&#39;s Component Products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getComponentProductIds, type GetComponentProductIdsData, type GetComponentProductIdsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetComponentProductIdsData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    product_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "EP-Pricebook-IDs-For-Price-Segmentation-Preview": "header-value", // OPTIONAL
  },
};

const result: GetComponentProductIdsResponse = await getComponentProductIds(params);
```

---

### **`getChildProducts`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/products/{product_id}/relationships/children`

**Summary:** Get a Parent Product&#39;s Child Products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getChildProducts, type GetChildProductsData, type GetChildProductsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetChildProductsData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    product_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
  headers: {
    "EP-Pricebook-IDs-For-Price-Segmentation-Preview": "header-value", // OPTIONAL
    "accept-language": "en-US", // OPTIONAL
  },
};

const result: GetChildProductsResponse = await getChildProducts(params);
```

---

### **`getProductsForHierarchy`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/hierarchies/{hierarchy_id}/products`

**Summary:** Get a Hierarchy&#39;s Products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getProductsForHierarchy, type GetProductsForHierarchyData, type GetProductsForHierarchyResponse } from "@epcc-sdk/sdks-shopper";

const params: GetProductsForHierarchyData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    hierarchy_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Pricebook-IDs-For-Price-Segmentation-Preview": "header-value", // OPTIONAL
  },
};

const result: GetProductsForHierarchyResponse = await getProductsForHierarchy(params);
```

---

### **`getProductsForNode`**

**Endpoint:** `GET /catalogs/{catalog_id}/releases/{release_id}/nodes/{node_id}/relationships/products`

**Summary:** Get a Node&#39;s Products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getProductsForNode, type GetProductsForNodeData, type GetProductsForNodeResponse } from "@epcc-sdk/sdks-shopper";

const params: GetProductsForNodeData = {
  path: {
    catalog_id: "12345678-1234-5678-9012-123456789012",
    release_id: "12345678-1234-5678-9012-123456789012",
    node_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "include": ["files", "main_images"], // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Pricebook-IDs-For-Price-Segmentation-Preview": "header-value", // OPTIONAL
  },
};

const result: GetProductsForNodeResponse = await getProductsForNode(params);
```

---

### **`getCarts`**

**Endpoint:** `GET /v2/carts`

**Summary:** Get Shopper Carts

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getCarts, type GetCartsData, type GetCartsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetCartsData = {
  headers: {
    "x-moltin-customer-token": "header-value", // OPTIONAL
  },
};

const result: GetCartsResponse = await getCarts(params);
```

---

### **`createACart`**

**Endpoint:** `POST /v2/carts`

**Summary:** Create a Cart

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createACart, type CreateACartData, type CreateACartResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateACartData = {
  headers: {
    "x-moltin-customer-token": "header-value", // OPTIONAL
  },
  body: {
    data: {
      type: "cart_item",
      quantity: 1,
      sku: "PRODUCT-SKU-001"
    }
  },
};

const result: CreateACartResponse = await createACart(params);
```

---

### **`deleteACart`**

**Endpoint:** `DELETE /v2/carts/{cartID}`

**Summary:** Delete a Cart

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteACart, type DeleteACartData, type DeleteACartResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteACartData = {
  path: {
    cartID: "cartID",
  },
};

const result: DeleteACartResponse = await deleteACart(params);
```

---

### **`getACart`**

**Endpoint:** `GET /v2/carts/{cartID}`

**Summary:** Get a Cart

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getACart, type GetACartData, type GetACartResponse } from "@epcc-sdk/sdks-shopper";

const params: GetACartData = {
  path: {
    cartID: "cartID",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
  },
};

const result: GetACartResponse = await getACart(params);
```

---

### **`updateACart`**

**Endpoint:** `PUT /v2/carts/{cartID}`

**Summary:** Update a Cart

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateACart, type UpdateACartData, type UpdateACartResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdateACartData = {
  path: {
    cartID: "cartID",
  },
  body: {
    data: {
      type: "cart_item",
      quantity: 1,
      sku: "PRODUCT-SKU-001"
    }
  },
};

const result: UpdateACartResponse = await updateACart(params);
```

---

### **`deleteAllCartItems`**

**Endpoint:** `DELETE /v2/carts/{cartID}/items`

**Summary:** Delete all Cart Items

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteAllCartItems, type DeleteAllCartItemsData, type DeleteAllCartItemsResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteAllCartItemsData = {
  path: {
    cartID: "cartID",
  },
};

const result: DeleteAllCartItemsResponse = await deleteAllCartItems(params);
```

---

### **`getCartItems`**

**Endpoint:** `GET /v2/carts/{cartID}/items`

**Summary:** Get Cart Items

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getCartItems, type GetCartItemsData, type GetCartItemsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetCartItemsData = {
  path: {
    cartID: "cartID",
  },
};

const result: GetCartItemsResponse = await getCartItems(params);
```

---

### **`manageCarts`**

**Endpoint:** `POST /v2/carts/{cartID}/items`

**Summary:** Add Items to Cart

**Description:** POST operation

**TypeScript Example:**

```typescript
import { manageCarts, type ManageCartsData, type ManageCartsResponse } from "@epcc-sdk/sdks-shopper";

const params: ManageCartsData = {
  path: {
    cartID: "cartID",
  },
  body: {
    data: {
      type: "cart_item",
      quantity: 1,
      sku: "PRODUCT-SKU-001"
    }
  },
};

const result: ManageCartsResponse = await manageCarts(params);
```

---

### **`bulkUpdateItemsInCart`**

**Endpoint:** `PUT /v2/carts/{cartID}/items`

**Summary:** Bulk Update Items in Cart

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { bulkUpdateItemsInCart, type BulkUpdateItemsInCartData, type BulkUpdateItemsInCartResponse } from "@epcc-sdk/sdks-shopper";

const params: BulkUpdateItemsInCartData = {
  path: {
    cartID: "cartID",
  },
  body: {
    data: [
      {
        type: "cart_item",
        quantity: 2,
        sku: "PRODUCT-SKU-001"
      }
    ]
  },
};

const result: BulkUpdateItemsInCartResponse = await bulkUpdateItemsInCart(params);
```

---

### **`deleteACartItem`**

**Endpoint:** `DELETE /v2/carts/{cartID}/items/{cartitemID}`

**Summary:** Delete a Cart Item

**Description:** Use this endpoint to delete a cart item.

**TypeScript Example:**

```typescript
import { deleteACartItem, type DeleteACartItemData, type DeleteACartItemResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteACartItemData = {
  path: {
    cartID: "cartID",
    cartitemID: "cartitemID",
  },
};

const result: DeleteACartItemResponse = await deleteACartItem(params);
```

---

### **`updateACartItem`**

**Endpoint:** `PUT /v2/carts/{cartID}/items/{cartitemID}`

**Summary:** Update a Cart Item

**Description:** You can easily update a cart item. A successful update returns the cart items.

**TypeScript Example:**

```typescript
import { updateACartItem, type UpdateACartItemData, type UpdateACartItemResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdateACartItemData = {
  path: {
    cartID: "cartID",
    cartitemID: "cartitemID",
  },
  body: {
    data: {
      type: "cart_item",
      quantity: 1,
      sku: "PRODUCT-SKU-001"
    }
  },
};

const result: UpdateACartItemResponse = await updateACartItem(params);
```

---

### **`deleteAccountCartAssociation`**

**Endpoint:** `DELETE /v2/carts/{cartID}/relationships/accounts`

**Summary:** Delete Account Cart Association

**Description:** You can delete an association between an account and a cart.

**TypeScript Example:**

```typescript
import { deleteAccountCartAssociation, type DeleteAccountCartAssociationData, type DeleteAccountCartAssociationResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteAccountCartAssociationData = {
  path: {
    cartID: "cartID",
  },
};

const result: DeleteAccountCartAssociationResponse = await deleteAccountCartAssociation(params);
```

---

### **`createAccountCartAssociation`**

**Endpoint:** `POST /v2/carts/{cartID}/relationships/accounts`

**Summary:** Create an Account Cart Association

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createAccountCartAssociation, type CreateAccountCartAssociationData, type CreateAccountCartAssociationResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateAccountCartAssociationData = {
  path: {
    cartID: "cartID",
  },
  body: {
    data: {
      type: "cart_item",
      quantity: 1,
      sku: "PRODUCT-SKU-001"
    }
  },
};

const result: CreateAccountCartAssociationResponse = await createAccountCartAssociation(params);
```

---

### **`deleteCustomerCartAssociation`**

**Endpoint:** `DELETE /v2/carts/{cartID}/relationships/customers`

**Summary:** Delete Customer Cart Association

**Description:** You can delete an association between a customer and a cart.

**TypeScript Example:**

```typescript
import { deleteCustomerCartAssociation, type DeleteCustomerCartAssociationData, type DeleteCustomerCartAssociationResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteCustomerCartAssociationData = {
  path: {
    cartID: "cartID",
  },
  headers: {
    "x-moltin-customer-token": "header-value", // OPTIONAL
  },
};

const result: DeleteCustomerCartAssociationResponse = await deleteCustomerCartAssociation(params);
```

---

### **`createCustomerCartAssociation`**

**Endpoint:** `POST /v2/carts/{cartID}/relationships/customers`

**Summary:** Create a Customer Cart Association

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createCustomerCartAssociation, type CreateCustomerCartAssociationData, type CreateCustomerCartAssociationResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateCustomerCartAssociationData = {
  path: {
    cartID: "cartID",
  },
  headers: {
    "x-moltin-customer-token": "header-value", // OPTIONAL
  },
  body: {
    data: {
      type: "cart_item",
      quantity: 1,
      sku: "PRODUCT-SKU-001"
    }
  },
};

const result: CreateCustomerCartAssociationResponse = await createCustomerCartAssociation(params);
```

---

### **`deleteAPromotionViaPromotionCode`**

**Endpoint:** `DELETE /v2/carts/{cartID}/discounts/{promoCode}`

**Summary:** Delete a Promotion via Promotion Code

**Description:** You can remove promotion code from a cart if it was applied manually. This endpoint does not work if the promotion is applied automatically.

**TypeScript Example:**

```typescript
import { deleteAPromotionViaPromotionCode, type DeleteAPromotionViaPromotionCodeData, type DeleteAPromotionViaPromotionCodeResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteAPromotionViaPromotionCodeData = {
  path: {
    cartID: "cartID",
    promoCode: "promoCode",
  },
};

const result: DeleteAPromotionViaPromotionCodeResponse = await deleteAPromotionViaPromotionCode(params);
```

---

### **`addTaxItemToCart`**

**Endpoint:** `POST /v2/carts/{cartID}/items/{cartitemID}/taxes`

**Summary:** Add Tax Item to Cart

**Description:** 
Use this endpoint to add a tax item to a cart.

:::note

There is a soft limit of 5 unique tax items per cart item at any one time.

:::


**TypeScript Example:**

```typescript
import { addTaxItemToCart, type AddTaxItemToCartData, type AddTaxItemToCartResponse } from "@epcc-sdk/sdks-shopper";

const params: AddTaxItemToCartData = {
  path: {
    cartID: "cartID",
    cartitemID: "cartitemID",
  },
  body: {
    data: {
      type: "custom_discount",
      name: "Discount Name",
      amount: {
        amount: 1000,
        currency: "USD"
      }
    }
  },
};

const result: AddTaxItemToCartResponse = await addTaxItemToCart(params);
```

---

### **`bulkDeleteTaxItemsFromCart`**

**Endpoint:** `DELETE /v2/carts/{cartID}/taxes`

**Summary:** Bulk Delete Tax Items from Cart

**Description:** Use this endpoint to bulk delete tax items from cart.

**TypeScript Example:**

```typescript
import { bulkDeleteTaxItemsFromCart, type BulkDeleteTaxItemsFromCartData, type BulkDeleteTaxItemsFromCartResponse } from "@epcc-sdk/sdks-shopper";

const params: BulkDeleteTaxItemsFromCartData = {
  path: {
    cartID: "cartID",
  },
};

const result: BulkDeleteTaxItemsFromCartResponse = await bulkDeleteTaxItemsFromCart(params);
```

---

### **`bulkAddTaxItemsToCart`**

**Endpoint:** `POST /v2/carts/{cartID}/taxes`

**Summary:** Bulk Add Tax Items to Cart

**Description:** POST operation

**TypeScript Example:**

```typescript
import { bulkAddTaxItemsToCart, type BulkAddTaxItemsToCartData, type BulkAddTaxItemsToCartResponse } from "@epcc-sdk/sdks-shopper";

const params: BulkAddTaxItemsToCartData = {
  path: {
    cartID: "cartID",
  },
  body: {
    data: [
      {
        type: "cart_item",
        quantity: 2,
        sku: "PRODUCT-SKU-001"
      }
    ]
  },
};

const result: BulkAddTaxItemsToCartResponse = await bulkAddTaxItemsToCart(params);
```

---

### **`deleteATaxItem`**

**Endpoint:** `DELETE /v2/carts/{cartID}/items/{cartitemID}/taxes/{taxitemID}`

**Summary:** Delete a Tax Item

**Description:** Use this endpoint to delete a tax item.

**TypeScript Example:**

```typescript
import { deleteATaxItem, type DeleteATaxItemData, type DeleteATaxItemResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteATaxItemData = {
  path: {
    cartID: "cartID",
    cartitemID: "cartitemID",
    taxitemID: "taxitemID",
  },
};

const result: DeleteATaxItemResponse = await deleteATaxItem(params);
```

---

### **`updateATaxItem`**

**Endpoint:** `PUT /v2/carts/{cartID}/items/{cartitemID}/taxes/{taxitemID}`

**Summary:** Update a Tax Item

**Description:** Use this endpoint to update a tax item. To change tax value from `rate` to `amount`, set `rate` to `null`, then set `amount` value and vice versa.

**TypeScript Example:**

```typescript
import { updateATaxItem, type UpdateATaxItemData, type UpdateATaxItemResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdateATaxItemData = {
  path: {
    cartID: "cartID",
    cartitemID: "cartitemID",
    taxitemID: "taxitemID",
  },
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: UpdateATaxItemResponse = await updateATaxItem(params);
```

---

### **`bulkDeleteCustomDiscountsFromCart`**

**Endpoint:** `DELETE /v2/carts/{cartID}/custom-discounts`

**Summary:** Bulk Delete Custom Discounts From Cart

**Description:** Use this endpoint to bulk delete custom discounts from cart.

**TypeScript Example:**

```typescript
import { bulkDeleteCustomDiscountsFromCart, type BulkDeleteCustomDiscountsFromCartData, type BulkDeleteCustomDiscountsFromCartResponse } from "@epcc-sdk/sdks-shopper";

const params: BulkDeleteCustomDiscountsFromCartData = {
  path: {
    cartID: "cartID",
  },
};

const result: BulkDeleteCustomDiscountsFromCartResponse = await bulkDeleteCustomDiscountsFromCart(params);
```

---

### **`bulkAddCustomDiscountsToCart`**

**Endpoint:** `POST /v2/carts/{cartID}/custom-discounts`

**Summary:** Bulk Add Custom Discounts to Cart

**Description:** POST operation

**TypeScript Example:**

```typescript
import { bulkAddCustomDiscountsToCart, type BulkAddCustomDiscountsToCartData, type BulkAddCustomDiscountsToCartResponse } from "@epcc-sdk/sdks-shopper";

const params: BulkAddCustomDiscountsToCartData = {
  path: {
    cartID: "cartID",
  },
  body: {
    data: [
      {
        type: "cart_item",
        quantity: 2,
        sku: "PRODUCT-SKU-001"
      }
    ]
  },
};

const result: BulkAddCustomDiscountsToCartResponse = await bulkAddCustomDiscountsToCart(params);
```

---

### **`deleteCustomDiscountFromCart`**

**Endpoint:** `DELETE /v2/carts/{cartID}/custom-discounts/{customdiscountID}`

**Summary:** Delete Custom Discount From Cart

**Description:** Use this endpoint to delete custom discount from cart.

**TypeScript Example:**

```typescript
import { deleteCustomDiscountFromCart, type DeleteCustomDiscountFromCartData, type DeleteCustomDiscountFromCartResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteCustomDiscountFromCartData = {
  path: {
    cartID: "cartID",
    customdiscountID: "customdiscountID",
  },
};

const result: DeleteCustomDiscountFromCartResponse = await deleteCustomDiscountFromCart(params);
```

---

### **`updateCustomDiscountForCart`**

**Endpoint:** `PUT /v2/carts/{cartID}/custom-discounts/{customdiscountID}`

**Summary:** Update Custom Discount For Cart

**Description:** Use this endpoint to update a custom discount in your cart.

**TypeScript Example:**

```typescript
import { updateCustomDiscountForCart, type UpdateCustomDiscountForCartData, type UpdateCustomDiscountForCartResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdateCustomDiscountForCartData = {
  path: {
    cartID: "cartID",
    customdiscountID: "customdiscountID",
  },
  body: {
    data: {
      type: "cart_item",
      quantity: 1,
      sku: "PRODUCT-SKU-001"
    }
  },
};

const result: UpdateCustomDiscountForCartResponse = await updateCustomDiscountForCart(params);
```

---

### **`addCustomDiscountToCartItem`**

**Endpoint:** `POST /v2/carts/{cartID}/items/{cartitemID}/custom-discounts`

**Summary:** Add Custom Discount To Cart Item

**Description:** Use this endpoint to add a custom discount to cart item.

**TypeScript Example:**

```typescript
import { addCustomDiscountToCartItem, type AddCustomDiscountToCartItemData, type AddCustomDiscountToCartItemResponse } from "@epcc-sdk/sdks-shopper";

const params: AddCustomDiscountToCartItemData = {
  path: {
    cartID: "cartID",
    cartitemID: "cartitemID",
  },
  body: {
    data: {
      type: "custom_discount",
      name: "Discount Name",
      amount: {
        amount: 1000,
        currency: "USD"
      }
    }
  },
};

const result: AddCustomDiscountToCartItemResponse = await addCustomDiscountToCartItem(params);
```

---

### **`deleteCustomDiscountFromCartItem`**

**Endpoint:** `DELETE /v2/carts/{cartID}/items/{cartitemID}/custom-discounts/{customdiscountID}`

**Summary:** Delete Custom Discount From Cart Item

**Description:** Use this endpoint to delete custom discount from cart item.

**TypeScript Example:**

```typescript
import { deleteCustomDiscountFromCartItem, type DeleteCustomDiscountFromCartItemData, type DeleteCustomDiscountFromCartItemResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteCustomDiscountFromCartItemData = {
  path: {
    cartID: "cartID",
    cartitemID: "cartitemID",
    customdiscountID: "customdiscountID",
  },
};

const result: DeleteCustomDiscountFromCartItemResponse = await deleteCustomDiscountFromCartItem(params);
```

---

### **`updateCustomDiscountForCartItem`**

**Endpoint:** `PUT /v2/carts/{cartID}/items/{cartitemID}/custom-discounts/{customdiscountID}`

**Summary:** Update Custom Discount For Cart Item

**Description:** Use this endpoint to update a custom discount in your cart item.

**TypeScript Example:**

```typescript
import { updateCustomDiscountForCartItem, type UpdateCustomDiscountForCartItemData, type UpdateCustomDiscountForCartItemResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdateCustomDiscountForCartItemData = {
  path: {
    cartID: "cartID",
    cartitemID: "cartitemID",
    customdiscountID: "customdiscountID",
  },
  body: {
    data: {
      type: "cart_item",
      quantity: 1,
      sku: "PRODUCT-SKU-001"
    }
  },
};

const result: UpdateCustomDiscountForCartItemResponse = await updateCustomDiscountForCartItem(params);
```

---

### **`getShippingGroups`**

**Endpoint:** `GET /v2/carts/{cartID}/shipping-groups`

**Summary:** Retrieve all shipping groups for a cart

**Description:** Retrieve all shipping groups for a cart

**TypeScript Example:**

```typescript
import { getShippingGroups, type GetShippingGroupsData, type GetShippingGroupsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetShippingGroupsData = {
  path: {
    cartID: "cartID",
  },
};

const result: GetShippingGroupsResponse = await getShippingGroups(params);
```

---

### **`createShippingGroup`**

**Endpoint:** `POST /v2/carts/{cartID}/shipping-groups`

**Summary:** Create a new shipping group for a cart

**Description:** Create a new shipping group for a cart

**TypeScript Example:**

```typescript
import { createShippingGroup, type CreateShippingGroupData, type CreateShippingGroupResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateShippingGroupData = {
  path: {
    cartID: "cartID",
  },
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: CreateShippingGroupResponse = await createShippingGroup(params);
```

---

### **`deleteCartShippingGroup`**

**Endpoint:** `DELETE /v2/carts/{cartId}/shipping-groups/{shippingGroupId}`

**Summary:** Delete Cart Shipping Group

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteCartShippingGroup, type DeleteCartShippingGroupData, type DeleteCartShippingGroupResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteCartShippingGroupData = {
  path: {
    cartId: "12345678-1234-5678-9012-123456789012",
    shippingGroupId: "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteCartShippingGroupResponse = await deleteCartShippingGroup(params);
```

---

### **`getShippingGroupById`**

**Endpoint:** `GET /v2/carts/{cartId}/shipping-groups/{shippingGroupId}`

**Summary:** Retrieve a specific shipping group for a cart

**Description:** Retrieve a specific shipping group for a cart

**TypeScript Example:**

```typescript
import { getShippingGroupById, type GetShippingGroupByIdData, type GetShippingGroupByIdResponse } from "@epcc-sdk/sdks-shopper";

const params: GetShippingGroupByIdData = {
  path: {
    cartId: "12345678-1234-5678-9012-123456789012",
    shippingGroupId: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetShippingGroupByIdResponse = await getShippingGroupById(params);
```

---

### **`updateShippingGroup`**

**Endpoint:** `PUT /v2/carts/{cartId}/shipping-groups/{shippingGroupId}`

**Summary:** Update a shipping group for a cart

**Description:** Update a specific shipping group for a cart

**TypeScript Example:**

```typescript
import { updateShippingGroup, type UpdateShippingGroupData, type UpdateShippingGroupResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdateShippingGroupData = {
  path: {
    cartId: "12345678-1234-5678-9012-123456789012",
    shippingGroupId: "12345678-1234-5678-9012-123456789012",
  },
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: UpdateShippingGroupResponse = await updateShippingGroup(params);
```

---

### **`createCartPaymentIntent`**

**Endpoint:** `POST /v2/carts/{cartID}/payments`

**Summary:** Create Stripe Payment Intent for a Cart

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createCartPaymentIntent, type CreateCartPaymentIntentData, type CreateCartPaymentIntentResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateCartPaymentIntentData = {
  path: {
    cartID: "cartID",
  },
  body: {
    data: {
      type: "cart_item",
      quantity: 1,
      sku: "PRODUCT-SKU-001"
    }
  },
};

const result: CreateCartPaymentIntentResponse = await createCartPaymentIntent(params);
```

---

### **`updateCartPaymentIntent`**

**Endpoint:** `PUT /v2/carts/{cartID}/payments/{paymentIntentID}`

**Summary:** Update a Payment Intent on a Cart

**Description:** Updates the payment information for a specific payment intent on a cart.

**TypeScript Example:**

```typescript
import { updateCartPaymentIntent, type UpdateCartPaymentIntentData, type UpdateCartPaymentIntentResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdateCartPaymentIntentData = {
  path: {
    cartID: "cartID",
    paymentIntentID: "paymentIntentID",
  },
  body: {
    data: {
      type: "cart_item",
      quantity: 1,
      sku: "PRODUCT-SKU-001"
    }
  },
};

const result: UpdateCartPaymentIntentResponse = await updateCartPaymentIntent(params);
```

---

### **`checkoutApi`**

**Endpoint:** `POST /v2/carts/{cartID}/checkout`

**Summary:** Checkout API

**Description:** POST operation

**TypeScript Example:**

```typescript
import { checkoutApi, type CheckoutApiData, type CheckoutApiResponse } from "@epcc-sdk/sdks-shopper";

const params: CheckoutApiData = {
  path: {
    cartID: "cartID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: CheckoutApiResponse = await checkoutApi(params);
```

---

### **`getCustomerOrders`**

**Endpoint:** `GET /v2/orders`

**Summary:** Get all Orders

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getCustomerOrders, type GetCustomerOrdersData, type GetCustomerOrdersResponse } from "@epcc-sdk/sdks-shopper";

const params: GetCustomerOrdersData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "include": ["files", "main_images"], // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
  headers: {
    "x-moltin-customer-token": "header-value", // OPTIONAL
  },
};

const result: GetCustomerOrdersResponse = await getCustomerOrders(params);
```

---

### **`getAnOrder`**

**Endpoint:** `GET /v2/orders/{orderID}`

**Summary:** Get an Order

**Description:** Use this endpoint to retrieve a specific order.

**TypeScript Example:**

```typescript
import { getAnOrder, type GetAnOrderData, type GetAnOrderResponse } from "@epcc-sdk/sdks-shopper";

const params: GetAnOrderData = {
  path: {
    orderID: "orderID",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
  },
};

const result: GetAnOrderResponse = await getAnOrder(params);
```

---

### **`updateAnOrder`**

**Endpoint:** `PUT /v2/orders/{orderID}`

**Summary:** Update an Order

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateAnOrder, type UpdateAnOrderData, type UpdateAnOrderResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdateAnOrderData = {
  path: {
    orderID: "orderID",
  },
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: UpdateAnOrderResponse = await updateAnOrder(params);
```

---

### **`getOrderItems`**

**Endpoint:** `GET /v2/orders/{orderID}/items`

**Summary:** Get Order Items

**Description:** Use this endpoint to retrieve order items.

**TypeScript Example:**

```typescript
import { getOrderItems, type GetOrderItemsData, type GetOrderItemsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetOrderItemsData = {
  path: {
    orderID: "orderID",
  },
};

const result: GetOrderItemsResponse = await getOrderItems(params);
```

---

### **`anonymizeOrders`**

**Endpoint:** `POST /v2/orders/anonymize`

**Summary:** Anonymize Orders

**Description:** POST operation

**TypeScript Example:**

```typescript
import { anonymizeOrders, type AnonymizeOrdersData, type AnonymizeOrdersResponse } from "@epcc-sdk/sdks-shopper";

const params: AnonymizeOrdersData = {
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: AnonymizeOrdersResponse = await anonymizeOrders(params);
```

---

### **`confirmOrder`**

**Endpoint:** `POST /v2/orders/{orderID}/confirm`

**Summary:** Confirm Order

**Description:** Use this endpoint to confirm an order. Confirming an order finalizes it and makes it ready for processing.


**TypeScript Example:**

```typescript
import { confirmOrder, type ConfirmOrderData, type ConfirmOrderResponse } from "@epcc-sdk/sdks-shopper";

const params: ConfirmOrderData = {
  path: {
    orderID: "orderID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: ConfirmOrderResponse = await confirmOrder(params);
```

---

### **`paymentSetup`**

**Endpoint:** `POST /v2/orders/{orderID}/payments`

**Summary:** Payments

**Description:** POST operation

**TypeScript Example:**

```typescript
import { paymentSetup, type PaymentSetupData, type PaymentSetupResponse } from "@epcc-sdk/sdks-shopper";

const params: PaymentSetupData = {
  path: {
    orderID: "orderID",
  },
  body: {
    data: {
      gateway: "stripe",
      method: "purchase"
    }
  },
};

const result: PaymentSetupResponse = await paymentSetup(params);
```

---

### **`confirmPayment`**

**Endpoint:** `POST /v2/orders/{orderID}/transactions/{transactionID}/confirm`

**Summary:** Confirm Payment

**Description:** POST operation

**TypeScript Example:**

```typescript
import { confirmPayment, type ConfirmPaymentData, type ConfirmPaymentResponse } from "@epcc-sdk/sdks-shopper";

const params: ConfirmPaymentData = {
  path: {
    orderID: "orderID",
    transactionID: "transactionID",
  },
  body: {
    data: {
      gateway: "stripe",
      method: "purchase"
    }
  },
};

const result: ConfirmPaymentResponse = await confirmPayment(params);
```

---

### **`captureATransaction`**

**Endpoint:** `POST /v2/orders/{orderID}/transactions/{transactionID}/capture`

**Summary:** Capture a Transaction

**Description:** POST operation

**TypeScript Example:**

```typescript
import { captureATransaction, type CaptureATransactionData, type CaptureATransactionResponse } from "@epcc-sdk/sdks-shopper";

const params: CaptureATransactionData = {
  path: {
    orderID: "orderID",
    transactionID: "transactionID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: CaptureATransactionResponse = await captureATransaction(params);
```

---

### **`refundATransaction`**

**Endpoint:** `POST /v2/orders/{orderID}/transactions/{transactionID}/refund`

**Summary:** Refund a Transaction

**Description:** POST operation

**TypeScript Example:**

```typescript
import { refundATransaction, type RefundATransactionData, type RefundATransactionResponse } from "@epcc-sdk/sdks-shopper";

const params: RefundATransactionData = {
  path: {
    orderID: "orderID",
    transactionID: "transactionID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: RefundATransactionResponse = await refundATransaction(params);
```

---

### **`getOrderTransactions`**

**Endpoint:** `GET /v2/orders/{orderID}/transactions`

**Summary:** Get Order Transactions

**Description:** Get order transactions

**TypeScript Example:**

```typescript
import { getOrderTransactions, type GetOrderTransactionsData, type GetOrderTransactionsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetOrderTransactionsData = {
  path: {
    orderID: "orderID",
  },
};

const result: GetOrderTransactionsResponse = await getOrderTransactions(params);
```

---

### **`getATransaction`**

**Endpoint:** `GET /v2/orders/{orderID}/transactions/{transactionID}`

**Summary:** Get a Transaction

**Description:** Retrieves a transaction

**TypeScript Example:**

```typescript
import { getATransaction, type GetATransactionData, type GetATransactionResponse } from "@epcc-sdk/sdks-shopper";

const params: GetATransactionData = {
  path: {
    orderID: "orderID",
    transactionID: "transactionID",
  },
};

const result: GetATransactionResponse = await getATransaction(params);
```

---

### **`cancelATransaction`**

**Endpoint:** `POST /v2/orders/{orderID}/transactions/{transactionID}/cancel`

**Summary:** Cancel a Transaction

**Description:** POST operation

**TypeScript Example:**

```typescript
import { cancelATransaction, type CancelATransactionData, type CancelATransactionResponse } from "@epcc-sdk/sdks-shopper";

const params: CancelATransactionData = {
  path: {
    orderID: "orderID",
    transactionID: "transactionID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: CancelATransactionResponse = await cancelATransaction(params);
```

---

### **`getOrderShippingGroups`**

**Endpoint:** `GET /v2/orders/{orderID}/shipping-groups`

**Summary:** Retrieve all shipping groups for an order

**Description:** Retrieve all shipping groups for an order

**TypeScript Example:**

```typescript
import { getOrderShippingGroups, type GetOrderShippingGroupsData, type GetOrderShippingGroupsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetOrderShippingGroupsData = {
  path: {
    orderID: "orderID",
  },
};

const result: GetOrderShippingGroupsResponse = await getOrderShippingGroups(params);
```

---

### **`createOrderShippingGroup`**

**Endpoint:** `POST /v2/orders/{orderID}/shipping-groups`

**Summary:** Create a shipping group for an order

**Description:** Create a new shipping group for an order

**TypeScript Example:**

```typescript
import { createOrderShippingGroup, type CreateOrderShippingGroupData, type CreateOrderShippingGroupResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateOrderShippingGroupData = {
  path: {
    orderID: "orderID",
  },
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: CreateOrderShippingGroupResponse = await createOrderShippingGroup(params);
```

---

### **`getShippingGroupsById`**

**Endpoint:** `GET /v2/orders/{orderID}/shipping-groups/{shippingGroupID}`

**Summary:** Retrieve a specific shipping group for an order

**Description:** Retrieve a specific shipping group for an order

**TypeScript Example:**

```typescript
import { getShippingGroupsById, type GetShippingGroupsByIdData, type GetShippingGroupsByIdResponse } from "@epcc-sdk/sdks-shopper";

const params: GetShippingGroupsByIdData = {
  path: {
    orderID: "orderID",
    shippingGroupID: "shippingGroupID",
  },
};

const result: GetShippingGroupsByIdResponse = await getShippingGroupsById(params);
```

---

### **`putShippingGroupById`**

**Endpoint:** `PUT /v2/orders/{orderID}/shipping-groups/{shippingGroupID}`

**Summary:** Update a shipping group for an order

**Description:** Update a shipping group for an order

**TypeScript Example:**

```typescript
import { putShippingGroupById, type PutShippingGroupByIdData, type PutShippingGroupByIdResponse } from "@epcc-sdk/sdks-shopper";

const params: PutShippingGroupByIdData = {
  path: {
    orderID: "orderID",
    shippingGroupID: "shippingGroupID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PutShippingGroupByIdResponse = await putShippingGroupById(params);
```

---

### **`listOfferings`**

**Endpoint:** `GET /v2/subscriptions/offerings`

**Summary:** List offerings

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listOfferings, type ListOfferingsData, type ListOfferingsResponse } from "@epcc-sdk/sdks-shopper";

const params: ListOfferingsData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: ListOfferingsResponse = await listOfferings(params);
```

---

### **`getOffering`**

**Endpoint:** `GET /v2/subscriptions/offerings/{offering_uuid}`

**Summary:** Get offering

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getOffering, type GetOfferingData, type GetOfferingResponse } from "@epcc-sdk/sdks-shopper";

const params: GetOfferingData = {
  path: {
    offering_uuid: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
  },
};

const result: GetOfferingResponse = await getOffering(params);
```

---

### **`listOfferingPricingOptions`**

**Endpoint:** `GET /v2/subscriptions/offerings/{offering_uuid}/pricing-options`

**Summary:** List an offering&#39;s pricing options

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listOfferingPricingOptions, type ListOfferingPricingOptionsData, type ListOfferingPricingOptionsResponse } from "@epcc-sdk/sdks-shopper";

const params: ListOfferingPricingOptionsData = {
  path: {
    offering_uuid: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: ListOfferingPricingOptionsResponse = await listOfferingPricingOptions(params);
```

---

### **`listOfferingFeatures`**

**Endpoint:** `GET /v2/subscriptions/offerings/{offering_uuid}/features`

**Summary:** List an offering&#39;s features

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listOfferingFeatures, type ListOfferingFeaturesData, type ListOfferingFeaturesResponse } from "@epcc-sdk/sdks-shopper";

const params: ListOfferingFeaturesData = {
  path: {
    offering_uuid: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: ListOfferingFeaturesResponse = await listOfferingFeatures(params);
```

---

### **`listOfferingPlans`**

**Endpoint:** `GET /v2/subscriptions/offerings/{offering_uuid}/plans`

**Summary:** List an offering&#39;s plans

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listOfferingPlans, type ListOfferingPlansData, type ListOfferingPlansResponse } from "@epcc-sdk/sdks-shopper";

const params: ListOfferingPlansData = {
  path: {
    offering_uuid: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: ListOfferingPlansResponse = await listOfferingPlans(params);
```

---

### **`listOfferingPlanPricingOptions`**

**Endpoint:** `GET /v2/subscriptions/offerings/{offering_uuid}/plans/{plan_uuid}/relationships/pricing_options`

**Summary:** List the pricing options available to a plan in an offering

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listOfferingPlanPricingOptions, type ListOfferingPlanPricingOptionsData, type ListOfferingPlanPricingOptionsResponse } from "@epcc-sdk/sdks-shopper";

const params: ListOfferingPlanPricingOptionsData = {
  path: {
    offering_uuid: "12345678-1234-5678-9012-123456789012",
    plan_uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: ListOfferingPlanPricingOptionsResponse = await listOfferingPlanPricingOptions(params);
```

---

### **`listSubscriptions`**

**Endpoint:** `GET /v2/subscriptions/subscriptions`

**Summary:** List subscriptions

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listSubscriptions, type ListSubscriptionsData, type ListSubscriptionsResponse } from "@epcc-sdk/sdks-shopper";

const params: ListSubscriptionsData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: ListSubscriptionsResponse = await listSubscriptions(params);
```

---

### **`getSubscription`**

**Endpoint:** `GET /v2/subscriptions/subscriptions/{subscription_uuid}`

**Summary:** Get subscription

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getSubscription, type GetSubscriptionData, type GetSubscriptionResponse } from "@epcc-sdk/sdks-shopper";

const params: GetSubscriptionData = {
  path: {
    subscription_uuid: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
  },
};

const result: GetSubscriptionResponse = await getSubscription(params);
```

---

### **`listSubscriptionPlans`**

**Endpoint:** `GET /v2/subscriptions/subscriptions/{subscription_uuid}/plans`

**Summary:** List subscription plans

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listSubscriptionPlans, type ListSubscriptionPlansData, type ListSubscriptionPlansResponse } from "@epcc-sdk/sdks-shopper";

const params: ListSubscriptionPlansData = {
  path: {
    subscription_uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: ListSubscriptionPlansResponse = await listSubscriptionPlans(params);
```

---

### **`listSubscriptionPricingOptions`**

**Endpoint:** `GET /v2/subscriptions/subscriptions/{subscription_uuid}/pricing-options`

**Summary:** List subscription pricing options

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listSubscriptionPricingOptions, type ListSubscriptionPricingOptionsData, type ListSubscriptionPricingOptionsResponse } from "@epcc-sdk/sdks-shopper";

const params: ListSubscriptionPricingOptionsData = {
  path: {
    subscription_uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: ListSubscriptionPricingOptionsResponse = await listSubscriptionPricingOptions(params);
```

---

### **`listSubscriptionStates`**

**Endpoint:** `GET /v2/subscriptions/subscriptions/{subscription_uuid}/states`

**Summary:** List subscription states

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listSubscriptionStates, type ListSubscriptionStatesData, type ListSubscriptionStatesResponse } from "@epcc-sdk/sdks-shopper";

const params: ListSubscriptionStatesData = {
  path: {
    subscription_uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: ListSubscriptionStatesResponse = await listSubscriptionStates(params);
```

---

### **`createSubscriptionState`**

**Endpoint:** `POST /v2/subscriptions/subscriptions/{subscription_uuid}/states`

**Summary:** Create a subscription state

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createSubscriptionState, type CreateSubscriptionStateData, type CreateSubscriptionStateResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateSubscriptionStateData = {
  path: {
    subscription_uuid: "12345678-1234-5678-9012-123456789012",
  },
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: CreateSubscriptionStateResponse = await createSubscriptionState(params);
```

---

### **`getSubscriptionState`**

**Endpoint:** `GET /v2/subscriptions/subscriptions/{subscription_uuid}/states/{state_uuid}`

**Summary:** Get subscription state

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getSubscriptionState, type GetSubscriptionStateData, type GetSubscriptionStateResponse } from "@epcc-sdk/sdks-shopper";

const params: GetSubscriptionStateData = {
  path: {
    subscription_uuid: "12345678-1234-5678-9012-123456789012",
    state_uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetSubscriptionStateResponse = await getSubscriptionState(params);
```

---

### **`listSubscriptionInvoices`**

**Endpoint:** `GET /v2/subscriptions/subscriptions/{subscription_uuid}/invoices`

**Summary:** List subscription invoices

**Description:** Lists all invoices for a given subscription.

**TypeScript Example:**

```typescript
import { listSubscriptionInvoices, type ListSubscriptionInvoicesData, type ListSubscriptionInvoicesResponse } from "@epcc-sdk/sdks-shopper";

const params: ListSubscriptionInvoicesData = {
  path: {
    subscription_uuid: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: ListSubscriptionInvoicesResponse = await listSubscriptionInvoices(params);
```

---

### **`listSubscriptionInvoicePayments`**

**Endpoint:** `GET /v2/subscriptions/subscriptions/{subscription_uuid}/invoices/{invoice_uuid}/payments`

**Summary:** List subscription invoice payments

**Description:** Lists all invoice payments for a given invoice.

**TypeScript Example:**

```typescript
import { listSubscriptionInvoicePayments, type ListSubscriptionInvoicePaymentsData, type ListSubscriptionInvoicePaymentsResponse } from "@epcc-sdk/sdks-shopper";

const params: ListSubscriptionInvoicePaymentsData = {
  path: {
    subscription_uuid: "12345678-1234-5678-9012-123456789012",
    invoice_uuid: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: ListSubscriptionInvoicePaymentsResponse = await listSubscriptionInvoicePayments(params);
```

---

### **`getSubscriptionInvoicePayment`**

**Endpoint:** `GET /v2/subscriptions/subscriptions/{subscription_uuid}/invoices/{invoice_uuid}/payments/{payment_uuid}`

**Summary:** Get subscription invoice payment

**Description:** Gets a specific payment for a given invoice.

**TypeScript Example:**

```typescript
import { getSubscriptionInvoicePayment, type GetSubscriptionInvoicePaymentData, type GetSubscriptionInvoicePaymentResponse } from "@epcc-sdk/sdks-shopper";

const params: GetSubscriptionInvoicePaymentData = {
  path: {
    subscription_uuid: "12345678-1234-5678-9012-123456789012",
    invoice_uuid: "12345678-1234-5678-9012-123456789012",
    payment_uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetSubscriptionInvoicePaymentResponse = await getSubscriptionInvoicePayment(params);
```

---

### **`getSubscriptionInvoice`**

**Endpoint:** `GET /v2/subscriptions/subscriptions/{subscription_uuid}/invoices/{invoice_uuid}`

**Summary:** Get subscription invoice

**Description:** Gets a specific invoice for a given subscription.

**TypeScript Example:**

```typescript
import { getSubscriptionInvoice, type GetSubscriptionInvoiceData, type GetSubscriptionInvoiceResponse } from "@epcc-sdk/sdks-shopper";

const params: GetSubscriptionInvoiceData = {
  path: {
    subscription_uuid: "12345678-1234-5678-9012-123456789012",
    invoice_uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetSubscriptionInvoiceResponse = await getSubscriptionInvoice(params);
```

---

### **`listInvoices`**

**Endpoint:** `GET /v2/subscriptions/invoices`

**Summary:** List invoices

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listInvoices, type ListInvoicesData, type ListInvoicesResponse } from "@epcc-sdk/sdks-shopper";

const params: ListInvoicesData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: ListInvoicesResponse = await listInvoices(params);
```

---

### **`getInvoice`**

**Endpoint:** `GET /v2/subscriptions/invoices/{invoice_uuid}`

**Summary:** Get invoice

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getInvoice, type GetInvoiceData, type GetInvoiceResponse } from "@epcc-sdk/sdks-shopper";

const params: GetInvoiceData = {
  path: {
    invoice_uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetInvoiceResponse = await getInvoice(params);
```

---

### **`getFeature`**

**Endpoint:** `GET /v2/subscriptions/features/{feature_uuid}`

**Summary:** Get feature

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getFeature, type GetFeatureData, type GetFeatureResponse } from "@epcc-sdk/sdks-shopper";

const params: GetFeatureData = {
  path: {
    feature_uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetFeatureResponse = await getFeature(params);
```

---

### **`getStock`**

**Endpoint:** `GET /v2/inventories/{product_uuid}`

**Summary:** Get Stock for Product

**Description:** Gets the stock for the product matching the specified unique identifier.

**TypeScript Example:**

```typescript
import { getStock, type GetStockData, type GetStockResponse } from "@epcc-sdk/sdks-shopper";

const params: GetStockData = {
  path: {
    product_uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetStockResponse = await getStock(params);
```

---

### **`listLocations`**

**Endpoint:** `GET /v2/inventories/locations`

**Summary:** List Locations

**Description:** Lists all Inventory Locations

**TypeScript Example:**

```typescript
import { listLocations, type ListLocationsData, type ListLocationsResponse } from "@epcc-sdk/sdks-shopper";

const params: ListLocationsData = {
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
};

const result: ListLocationsResponse = await listLocations(params);
```

---

### **`createAnAccessToken`**

**Endpoint:** `POST /oauth/access_token`

**Summary:** Create an Access Token

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createAnAccessToken, type CreateAnAccessTokenData, type CreateAnAccessTokenResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateAnAccessTokenData = {
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: CreateAnAccessTokenResponse = await createAnAccessToken(params);
```

---

### **`getV2AccountAddresses`**

**Endpoint:** `GET /v2/accounts/{accountID}/addresses`

**Summary:** Get Account Addresses

**Description:** Get Account Addresses

**TypeScript Example:**

```typescript
import { getV2AccountAddresses, type GetV2AccountAddressesData, type GetV2AccountAddressesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetV2AccountAddressesData = {
  path: {
    accountID: "accountID",
  },
};

const result: GetV2AccountAddressesResponse = await getV2AccountAddresses(params);
```

---

### **`postV2AccountAddress`**

**Endpoint:** `POST /v2/accounts/{accountID}/addresses`

**Summary:** Create an Account Address

**Description:** Create an Account Address

**TypeScript Example:**

```typescript
import { postV2AccountAddress, type PostV2AccountAddressData, type PostV2AccountAddressResponse } from "@epcc-sdk/sdks-shopper";

const params: PostV2AccountAddressData = {
  path: {
    accountID: "accountID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PostV2AccountAddressResponse = await postV2AccountAddress(params);
```

---

### **`deleteV2AccountAddress`**

**Endpoint:** `DELETE /v2/accounts/{accountID}/addresses/{addressID}`

**Summary:** Delete an Account Address

**Description:** Delete a specific account within a store

**TypeScript Example:**

```typescript
import { deleteV2AccountAddress, type DeleteV2AccountAddressData, type DeleteV2AccountAddressResponse } from "@epcc-sdk/sdks-shopper";

const params: DeleteV2AccountAddressData = {
  path: {
    accountID: "accountID",
    addressID: "addressID",
  },
};

const result: DeleteV2AccountAddressResponse = await deleteV2AccountAddress(params);
```

---

### **`getV2AccountAddress`**

**Endpoint:** `GET /v2/accounts/{accountID}/addresses/{addressID}`

**Summary:** Get an Account Address

**Description:** Get an Account Addresses

**TypeScript Example:**

```typescript
import { getV2AccountAddress, type GetV2AccountAddressData, type GetV2AccountAddressResponse } from "@epcc-sdk/sdks-shopper";

const params: GetV2AccountAddressData = {
  path: {
    accountID: "accountID",
    addressID: "addressID",
  },
};

const result: GetV2AccountAddressResponse = await getV2AccountAddress(params);
```

---

### **`putV2AccountAddress`**

**Endpoint:** `PUT /v2/accounts/{accountID}/addresses/{addressID}`

**Summary:** Update an Account Address

**Description:** Update an Account Address

**TypeScript Example:**

```typescript
import { putV2AccountAddress, type PutV2AccountAddressData, type PutV2AccountAddressResponse } from "@epcc-sdk/sdks-shopper";

const params: PutV2AccountAddressData = {
  path: {
    accountID: "accountID",
    addressID: "addressID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PutV2AccountAddressResponse = await putV2AccountAddress(params);
```

---

### **`getV2Accounts`**

**Endpoint:** `GET /v2/accounts`

**Summary:** Get All Accounts

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getV2Accounts, type GetV2AccountsData, type GetV2AccountsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetV2AccountsData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
};

const result: GetV2AccountsResponse = await getV2Accounts(params);
```

---

### **`postV2Accounts`**

**Endpoint:** `POST /v2/accounts`

**Summary:** Create an Account

**Description:** With the account creation endpoint, you have the ability to create accounts which can optionally have another account as a parent.

**TypeScript Example:**

```typescript
import { postV2Accounts, type PostV2AccountsData, type PostV2AccountsResponse } from "@epcc-sdk/sdks-shopper";

const params: PostV2AccountsData = {
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PostV2AccountsResponse = await postV2Accounts(params);
```

---

### **`getV2AccountsAccountId`**

**Endpoint:** `GET /v2/accounts/{accountID}`

**Summary:** Get an Account

**Description:** View a specific account contained within your store

**TypeScript Example:**

```typescript
import { getV2AccountsAccountId, type GetV2AccountsAccountIdData, type GetV2AccountsAccountIdResponse } from "@epcc-sdk/sdks-shopper";

const params: GetV2AccountsAccountIdData = {
  path: {
    accountID: "accountID",
  },
};

const result: GetV2AccountsAccountIdResponse = await getV2AccountsAccountId(params);
```

---

### **`putV2AccountsAccountId`**

**Endpoint:** `PUT /v2/accounts/{accountID}`

**Summary:** Update an Account

**Description:** Update the information contained on an account.

**TypeScript Example:**

```typescript
import { putV2AccountsAccountId, type PutV2AccountsAccountIdData, type PutV2AccountsAccountIdResponse } from "@epcc-sdk/sdks-shopper";

const params: PutV2AccountsAccountIdData = {
  path: {
    accountID: "accountID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PutV2AccountsAccountIdResponse = await putV2AccountsAccountId(params);
```

---

### **`getV2AccountMembers`**

**Endpoint:** `GET /v2/account-members`

**Summary:** Get all Account Members

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getV2AccountMembers, type GetV2AccountMembersData, type GetV2AccountMembersResponse } from "@epcc-sdk/sdks-shopper";

const params: GetV2AccountMembersData = {
  query: {
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
    "sort": "-created_at", // OPTIONAL
  },
};

const result: GetV2AccountMembersResponse = await getV2AccountMembers(params);
```

---

### **`getV2AccountMembersAccountMemberId`**

**Endpoint:** `GET /v2/account-members/{accountMemberID}`

**Summary:** Get an Account Member

**Description:** Get an account member from your store

**TypeScript Example:**

```typescript
import { getV2AccountMembersAccountMemberId, type GetV2AccountMembersAccountMemberIdData, type GetV2AccountMembersAccountMemberIdResponse } from "@epcc-sdk/sdks-shopper";

const params: GetV2AccountMembersAccountMemberIdData = {
  path: {
    accountMemberID: "accountMemberID",
  },
};

const result: GetV2AccountMembersAccountMemberIdResponse = await getV2AccountMembersAccountMemberId(params);
```

---

### **`getV2AccountsAccountIdAccountMemberships`**

**Endpoint:** `GET /v2/accounts/{accountID}/account-memberships`

**Summary:** Get all Account Memberships

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getV2AccountsAccountIdAccountMemberships, type GetV2AccountsAccountIdAccountMembershipsData, type GetV2AccountsAccountIdAccountMembershipsResponse } from "@epcc-sdk/sdks-shopper";

const params: GetV2AccountsAccountIdAccountMembershipsData = {
  path: {
    accountID: "accountID",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "sort": "-created_at", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetV2AccountsAccountIdAccountMembershipsResponse = await getV2AccountsAccountIdAccountMemberships(params);
```

---

### **`postV2AccountMembersTokens`**

**Endpoint:** `POST /v2/account-members/tokens`

**Summary:** Generate an Account Management Authentication Token

**Description:** POST operation

**TypeScript Example:**

```typescript
import { postV2AccountMembersTokens, type PostV2AccountMembersTokensData, type PostV2AccountMembersTokensResponse } from "@epcc-sdk/sdks-shopper";

const params: PostV2AccountMembersTokensData = {
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PostV2AccountMembersTokensResponse = await postV2AccountMembersTokens(params);
```

---

### **`createOneTimePasswordTokenRequest`**

**Endpoint:** `POST /v2/authentication-realms/{realmId}/password-profiles/{passwordProfileId}/one-time-password-token-request`

**Summary:** Create a one-time password token request

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createOneTimePasswordTokenRequest, type CreateOneTimePasswordTokenRequestData, type CreateOneTimePasswordTokenRequestResponse } from "@epcc-sdk/sdks-shopper";

const params: CreateOneTimePasswordTokenRequestData = {
  path: {
    realmId: "12345678-1234-5678-9012-123456789012",
    passwordProfileId: "12345678-1234-5678-9012-123456789012",
  },
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: CreateOneTimePasswordTokenRequestResponse = await createOneTimePasswordTokenRequest(params);
```

---

### **`updatePasswordProfileInfo`**

**Endpoint:** `PUT /v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info/{userAuthenticationPasswordProfileInfoId}`

**Summary:** Update a user authentication password profile info

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updatePasswordProfileInfo, type UpdatePasswordProfileInfoData, type UpdatePasswordProfileInfoResponse } from "@epcc-sdk/sdks-shopper";

const params: UpdatePasswordProfileInfoData = {
  path: {
    realmId: "12345678-1234-5678-9012-123456789012",
    userAuthenticationInfoId: "12345678-1234-5678-9012-123456789012",
    userAuthenticationPasswordProfileInfoId: "12345678-1234-5678-9012-123456789012",
  },
  body: {
    data: {
      type: "resource",
      attributes: {
        name: "Resource Name",
        description: "Resource Description"
      }
    }
  },
};

const result: UpdatePasswordProfileInfoResponse = await updatePasswordProfileInfo(params);
```

---

### **`getAllCurrencies`**

**Endpoint:** `GET /v2/currencies`

**Summary:** Get all Currencies

**Description:** :::caution

This endpoint is for Administrator use only. Do not use this endpoint on your customer-facing frontends.

:::


**TypeScript Example:**

```typescript
import { getAllCurrencies, type GetAllCurrenciesData, type GetAllCurrenciesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetAllCurrenciesData = {
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetAllCurrenciesResponse = await getAllCurrencies(params);
```

---

### **`getACurrency`**

**Endpoint:** `GET /v2/currencies/{currencyID}`

**Summary:** Get a Currency

**Description:** :::caution

This endpoint is for Administrator use only. Do not use this endpoint on your customer-facing frontends.

:::


**TypeScript Example:**

```typescript
import { getACurrency, type GetACurrencyData, type GetACurrencyResponse } from "@epcc-sdk/sdks-shopper";

const params: GetACurrencyData = {
  path: {
    currencyID: "currencyID",
  },
};

const result: GetACurrencyResponse = await getACurrency(params);
```

---

### **`getAllFiles`**

**Endpoint:** `GET /v2/files`

**Summary:** Get all Files

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllFiles, type GetAllFilesData, type GetAllFilesResponse } from "@epcc-sdk/sdks-shopper";

const params: GetAllFilesData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
};

const result: GetAllFilesResponse = await getAllFiles(params);
```

---

### **`getAFile`**

**Endpoint:** `GET /v2/files/{fileID}`

**Summary:** Get a File

**Description:** Get a File

**TypeScript Example:**

```typescript
import { getAFile, type GetAFileData, type GetAFileResponse } from "@epcc-sdk/sdks-shopper";

const params: GetAFileData = {
  path: {
    fileID: "fileID",
  },
};

const result: GetAFileResponse = await getAFile(params);
```

---

### **`postMultiSearch`**

**Endpoint:** `POST /catalog/multi-search`

**Summary:** Multi-search

**Description:** Execute one or more searches in a single request.

**TypeScript Example:**

```typescript
import { postMultiSearch, type PostMultiSearchData, type PostMultiSearchResponse } from "@epcc-sdk/sdks-shopper";

const params: PostMultiSearchData = {
  query: {
    "include": ["files", "main_images"], // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
  headers: {
    "accept-language": "en-US", // OPTIONAL
    "EP-Channel": "web", // OPTIONAL
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PostMultiSearchResponse = await postMultiSearch(params);
```

---




---