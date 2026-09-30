# @epcc-sdk/commerce-extensions SDK

Below you'll find instructions on how to install, set up, and use the client, along with a list of available operations.


## Features

- type-safe response data and errors
- response data validation and transformation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology

---


## Installation

```bash
npm install @epcc-sdk/commerce-extensions
# or
pnpm install @epcc-sdk/commerce-extensions
# or
yarn add @epcc-sdk/commerce-extensions
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
import { client } from "@epcc-sdk/commerce-extensions";

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
import { createClient } from "@epcc-sdk/commerce-extensions";

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

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/commerce-extensions>".

```ts
const response = await getACustomEntry({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getACustomEntry({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/commerce-extensions";

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
import { client } from "@epcc-sdk/commerce-extensions";

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

`createCommerceExtensionsClient` is the short way. It returns a client that holds a caching token
source, sets the `auth` hook, refreshes and replays once on a 401, and backs off on a 429.

```ts
import {
  createCommerceExtensionsClient,
  listCustomApis,
} from "@epcc-sdk/commerce-extensions";

const client = createCommerceExtensionsClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
});

const { data } = await listCustomApis({ client });
```

Credentials come from `source`, `provider`, `token`, `clientId` plus `clientSecret`, or
`clientId` alone for the implicit grant. `retry`, `storage`, `leewaySeconds`, `fetch` and
`config` tune the rest. `config` is merged last, so anything the factory chose can be
overridden.

Pass the client to every operation. The module-level `client` exported by this package
carries no credentials, so an operation called without `{ client }` gets a 401.

To assemble the stack by hand, `createTokenSource`, `createAuthenticatedFetch`,
`createRetryFetch` and `createConfiguredClient` are re-exported from this package, so you
still install only `@epcc-sdk/commerce-extensions`. Do not authenticate with a request
interceptor: an interceptor cannot see the response, so it can never retry a 401.

## Validation schemas

Zod schemas for every request body, path and response are published under the `/zod`
subpath. `zod` is an optional peer dependency (3.x), so the root entry never imports it.

```ts
import { zCustomApi } from "@epcc-sdk/commerce-extensions/zod";

const customApi = zCustomApi.parse(data?.data?.[0]);
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
import { getACustomEntry } from "@epcc-sdk/commerce-extensions";

const product = await getACustomEntry({
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


### **`listCustomApis`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis`

**Summary:** Get all Custom APIs

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listCustomApis, type ListCustomApisData, type ListCustomApisResponse } from "@epcc-sdk/commerce-extensions";

const params: ListCustomApisData = {
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
};

const result: ListCustomApisResponse = await listCustomApis(params);
```

---

### **`createACustomApi`**

**Endpoint:** `POST /v2/settings/extensions/custom-apis`

**Summary:** Create a Custom API

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createACustomApi, type CreateACustomApiData, type CreateACustomApiResponse } from "@epcc-sdk/commerce-extensions";

const params: CreateACustomApiData = {
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

const result: CreateACustomApiResponse = await createACustomApi(params);
```

---

### **`deleteACustomApi`**

**Endpoint:** `DELETE /v2/settings/extensions/custom-apis/{custom-api-id}`

**Summary:** Delete a Custom API

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteACustomApi, type DeleteACustomApiData, type DeleteACustomApiResponse } from "@epcc-sdk/commerce-extensions";

const params: DeleteACustomApiData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteACustomApiResponse = await deleteACustomApi(params);
```

---

### **`getACustomApi`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis/{custom-api-id}`

**Summary:** Get a Custom API

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getACustomApi, type GetACustomApiData, type GetACustomApiResponse } from "@epcc-sdk/commerce-extensions";

const params: GetACustomApiData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetACustomApiResponse = await getACustomApi(params);
```

---

### **`updateACustomApi`**

**Endpoint:** `PUT /v2/settings/extensions/custom-apis/{custom-api-id}`

**Summary:** Update a Custom API

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateACustomApi, type UpdateACustomApiData, type UpdateACustomApiResponse } from "@epcc-sdk/commerce-extensions";

const params: UpdateACustomApiData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
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

const result: UpdateACustomApiResponse = await updateACustomApi(params);
```

---

### **`getOpenApiSpecification`**

**Endpoint:** `GET /v2/settings/extensions/specifications/openapi`

**Summary:** Get OpenAPI Specification

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getOpenApiSpecification, type GetOpenApiSpecificationData, type GetOpenApiSpecificationResponse } from "@epcc-sdk/commerce-extensions";

const params: GetOpenApiSpecificationData = {
};

const result: GetOpenApiSpecificationResponse = await getOpenApiSpecification(params);
```

---

### **`listCustomFields`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis/{custom-api-id}/fields`

**Summary:** Get all Custom Fields

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listCustomFields, type ListCustomFieldsData, type ListCustomFieldsResponse } from "@epcc-sdk/commerce-extensions";

const params: ListCustomFieldsData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
};

const result: ListCustomFieldsResponse = await listCustomFields(params);
```

---

### **`createACustomField`**

**Endpoint:** `POST /v2/settings/extensions/custom-apis/{custom-api-id}/fields`

**Summary:** Create a Custom Field

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createACustomField, type CreateACustomFieldData, type CreateACustomFieldResponse } from "@epcc-sdk/commerce-extensions";

const params: CreateACustomFieldData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
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

const result: CreateACustomFieldResponse = await createACustomField(params);
```

---

### **`deleteACustomField`**

**Endpoint:** `DELETE /v2/settings/extensions/custom-apis/{custom-api-id}/fields/{custom-field-id}`

**Summary:** Delete a Custom Field

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteACustomField, type DeleteACustomFieldData, type DeleteACustomFieldResponse } from "@epcc-sdk/commerce-extensions";

const params: DeleteACustomFieldData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
    "custom-field-id": "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteACustomFieldResponse = await deleteACustomField(params);
```

---

### **`getACustomField`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis/{custom-api-id}/fields/{custom-field-id}`

**Summary:** Get a Custom Field

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getACustomField, type GetACustomFieldData, type GetACustomFieldResponse } from "@epcc-sdk/commerce-extensions";

const params: GetACustomFieldData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
    "custom-field-id": "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetACustomFieldResponse = await getACustomField(params);
```

---

### **`updateACustomField`**

**Endpoint:** `PUT /v2/settings/extensions/custom-apis/{custom-api-id}/fields/{custom-field-id}`

**Summary:** Update a Custom Field

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateACustomField, type UpdateACustomFieldData, type UpdateACustomFieldResponse } from "@epcc-sdk/commerce-extensions";

const params: UpdateACustomFieldData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
    "custom-field-id": "12345678-1234-5678-9012-123456789012",
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

const result: UpdateACustomFieldResponse = await updateACustomField(params);
```

---

### **`listCustomApiEntries`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis/{custom-api-id}/entries`

**Summary:** Get all Custom API Entries

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listCustomApiEntries, type ListCustomApiEntriesData, type ListCustomApiEntriesResponse } from "@epcc-sdk/commerce-extensions";

const params: ListCustomApiEntriesData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[total_method]": "pagetotal_method", // OPTIONAL
  },
};

const result: ListCustomApiEntriesResponse = await listCustomApiEntries(params);
```

---

### **`createACustomApiEntry`**

**Endpoint:** `POST /v2/settings/extensions/custom-apis/{custom-api-id}/entries`

**Summary:** Create a Custom API Entry using the settings endpoint

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createACustomApiEntry, type CreateACustomApiEntryData, type CreateACustomApiEntryResponse } from "@epcc-sdk/commerce-extensions";

const params: CreateACustomApiEntryData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
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

const result: CreateACustomApiEntryResponse = await createACustomApiEntry(params);
```

---

### **`deleteACustomEntry`**

**Endpoint:** `DELETE /v2/settings/extensions/custom-apis/{custom-api-id}/entries/{custom-api-entry-id}`

**Summary:** Delete a Custom API Entry

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteACustomEntry, type DeleteACustomEntryData, type DeleteACustomEntryResponse } from "@epcc-sdk/commerce-extensions";

const params: DeleteACustomEntryData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
    "custom-api-entry-id": "12345678-1234-5678-9012-123456789012",
  },
  headers: {
    "If-Match": "header-value", // OPTIONAL
  },
};

const result: DeleteACustomEntryResponse = await deleteACustomEntry(params);
```

---

### **`getACustomEntry`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis/{custom-api-id}/entries/{custom-api-entry-id}`

**Summary:** Get a Custom API Entry using the settings endpoint

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getACustomEntry, type GetACustomEntryData, type GetACustomEntryResponse } from "@epcc-sdk/commerce-extensions";

const params: GetACustomEntryData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
    "custom-api-entry-id": "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetACustomEntryResponse = await getACustomEntry(params);
```

---

### **`updateACustomEntry`**

**Endpoint:** `PUT /v2/settings/extensions/custom-apis/{custom-api-id}/entries/{custom-api-entry-id}`

**Summary:** Update a Custom API Entry using the settings endpoint

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateACustomEntry, type UpdateACustomEntryData, type UpdateACustomEntryResponse } from "@epcc-sdk/commerce-extensions";

const params: UpdateACustomEntryData = {
  path: {
    "custom-api-id": "12345678-1234-5678-9012-123456789012",
    "custom-api-entry-id": "12345678-1234-5678-9012-123456789012",
  },
  headers: {
    "If-Match": "header-value", // OPTIONAL
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

const result: UpdateACustomEntryResponse = await updateACustomEntry(params);
```

---

### **`getCustomEntriesSettings`**

**Endpoint:** `GET /v2/extensions/{custom-api-slug}`

**Summary:** Get all Custom API Entries using the extensions endpoint

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getCustomEntriesSettings, type GetCustomEntriesSettingsData, type GetCustomEntriesSettingsResponse } from "@epcc-sdk/commerce-extensions";

const params: GetCustomEntriesSettingsData = {
  path: {
    "custom-api-slug": "product-slug",
  },
};

const result: GetCustomEntriesSettingsResponse = await getCustomEntriesSettings(params);
```

---

### **`createACustomEntrySettings`**

**Endpoint:** `POST /v2/extensions/{custom-api-slug}`

**Summary:** Create a Custom API Entry using the extensions endpoint

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createACustomEntrySettings, type CreateACustomEntrySettingsData, type CreateACustomEntrySettingsResponse } from "@epcc-sdk/commerce-extensions";

const params: CreateACustomEntrySettingsData = {
  path: {
    "custom-api-slug": "product-slug",
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

const result: CreateACustomEntrySettingsResponse = await createACustomEntrySettings(params);
```

---

### **`deleteACustomEntrySettings`**

**Endpoint:** `DELETE /v2/extensions/{custom-api-slug}/{custom-api-entry-identifier}`

**Summary:** Delete a Custom API Entry using the extensions endpoint

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteACustomEntrySettings, type DeleteACustomEntrySettingsData, type DeleteACustomEntrySettingsResponse } from "@epcc-sdk/commerce-extensions";

const params: DeleteACustomEntrySettingsData = {
  path: {
    "custom-api-slug": "product-slug",
    "custom-api-entry-identifier": "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteACustomEntrySettingsResponse = await deleteACustomEntrySettings(params);
```

---

### **`getACustomEntrySettings`**

**Endpoint:** `GET /v2/extensions/{custom-api-slug}/{custom-api-entry-identifier}`

**Summary:** Get a Custom API Entry using the extensions endpoint

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getACustomEntrySettings, type GetACustomEntrySettingsData, type GetACustomEntrySettingsResponse } from "@epcc-sdk/commerce-extensions";

const params: GetACustomEntrySettingsData = {
  path: {
    "custom-api-slug": "product-slug",
    "custom-api-entry-identifier": "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetACustomEntrySettingsResponse = await getACustomEntrySettings(params);
```

---

### **`putACustomEntrySettings`**

**Endpoint:** `PUT /v2/extensions/{custom-api-slug}/{custom-api-entry-identifier}`

**Summary:** Update a Custom API Entry using the extensions endpoint

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { putACustomEntrySettings, type PutACustomEntrySettingsData, type PutACustomEntrySettingsResponse } from "@epcc-sdk/commerce-extensions";

const params: PutACustomEntrySettingsData = {
  path: {
    "custom-api-slug": "product-slug",
    "custom-api-entry-identifier": "12345678-1234-5678-9012-123456789012",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PutACustomEntrySettingsResponse = await putACustomEntrySettings(params);
```

---




---