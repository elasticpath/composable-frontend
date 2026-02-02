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

We are working to provide helpers to handle auth easier for you but for now using an interceptor is the easiest method.

```ts
import { client } from "@epcc-sdk/commerce-extensions";

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


### **`getAllCustomApis`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis`

**Summary:** Get all Custom APIs

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllCustomApis, type GetAllCustomApisData, type GetAllCustomApisResponse } from "@epcc-sdk/commerce-extensions";

const params: GetAllCustomApisData = {
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
};

const result: GetAllCustomApisResponse = await getAllCustomApis(params);
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

**Endpoint:** `DELETE /v2/settings/extensions/custom-apis/{custom_api_id}`

**Summary:** Delete a Custom API

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteACustomApi, type DeleteACustomApiData, type DeleteACustomApiResponse } from "@epcc-sdk/commerce-extensions";

const params: DeleteACustomApiData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteACustomApiResponse = await deleteACustomApi(params);
```

---

### **`getACustomApi`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis/{custom_api_id}`

**Summary:** Get a Custom API

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getACustomApi, type GetACustomApiData, type GetACustomApiResponse } from "@epcc-sdk/commerce-extensions";

const params: GetACustomApiData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetACustomApiResponse = await getACustomApi(params);
```

---

### **`updateACustomApi`**

**Endpoint:** `PUT /v2/settings/extensions/custom-apis/{custom_api_id}`

**Summary:** Update a Custom API

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateACustomApi, type UpdateACustomApiData, type UpdateACustomApiResponse } from "@epcc-sdk/commerce-extensions";

const params: UpdateACustomApiData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
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

### **`getAllCustomFields`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis/{custom_api_id}/fields`

**Summary:** Get all Custom Fields

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllCustomFields, type GetAllCustomFieldsData, type GetAllCustomFieldsResponse } from "@epcc-sdk/commerce-extensions";

const params: GetAllCustomFieldsData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
};

const result: GetAllCustomFieldsResponse = await getAllCustomFields(params);
```

---

### **`createACustomField`**

**Endpoint:** `POST /v2/settings/extensions/custom-apis/{custom_api_id}/fields`

**Summary:** Create a Custom Field

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createACustomField, type CreateACustomFieldData, type CreateACustomFieldResponse } from "@epcc-sdk/commerce-extensions";

const params: CreateACustomFieldData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
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

**Endpoint:** `DELETE /v2/settings/extensions/custom-apis/{custom_api_id}/fields/{custom_field_id}`

**Summary:** Delete a Custom Field

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteACustomField, type DeleteACustomFieldData, type DeleteACustomFieldResponse } from "@epcc-sdk/commerce-extensions";

const params: DeleteACustomFieldData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
    custom_field_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteACustomFieldResponse = await deleteACustomField(params);
```

---

### **`getACustomField`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis/{custom_api_id}/fields/{custom_field_id}`

**Summary:** Get a Custom Field

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getACustomField, type GetACustomFieldData, type GetACustomFieldResponse } from "@epcc-sdk/commerce-extensions";

const params: GetACustomFieldData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
    custom_field_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetACustomFieldResponse = await getACustomField(params);
```

---

### **`updateACustomField`**

**Endpoint:** `PUT /v2/settings/extensions/custom-apis/{custom_api_id}/fields/{custom_field_id}`

**Summary:** Update a Custom Field

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateACustomField, type UpdateACustomFieldData, type UpdateACustomFieldResponse } from "@epcc-sdk/commerce-extensions";

const params: UpdateACustomFieldData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
    custom_field_id: "12345678-1234-5678-9012-123456789012",
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

### **`getAllCustomEntries`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis/{custom_api_id}/entries`

**Summary:** Get all Custom API Entries

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllCustomEntries, type GetAllCustomEntriesData, type GetAllCustomEntriesResponse } from "@epcc-sdk/commerce-extensions";

const params: GetAllCustomEntriesData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[total_method]": "pagetotal_method", // OPTIONAL
  },
};

const result: GetAllCustomEntriesResponse = await getAllCustomEntries(params);
```

---

### **`createACustomEntry`**

**Endpoint:** `POST /v2/settings/extensions/custom-apis/{custom_api_id}/entries`

**Summary:** Create a Custom API Entry using the settings endpoint

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createACustomEntry, type CreateACustomEntryData, type CreateACustomEntryResponse } from "@epcc-sdk/commerce-extensions";

const params: CreateACustomEntryData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
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

const result: CreateACustomEntryResponse = await createACustomEntry(params);
```

---

### **`deleteACustomEntry`**

**Endpoint:** `DELETE /v2/settings/extensions/custom-apis/{custom_api_id}/entries/{custom_api_entry_id}`

**Summary:** Delete a Custom API Entry

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteACustomEntry, type DeleteACustomEntryData, type DeleteACustomEntryResponse } from "@epcc-sdk/commerce-extensions";

const params: DeleteACustomEntryData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
    custom_api_entry_id: "12345678-1234-5678-9012-123456789012",
  },
  headers: {
    "If-Match": "header-value", // OPTIONAL
  },
};

const result: DeleteACustomEntryResponse = await deleteACustomEntry(params);
```

---

### **`getACustomEntry`**

**Endpoint:** `GET /v2/settings/extensions/custom-apis/{custom_api_id}/entries/{custom_api_entry_id}`

**Summary:** Get a Custom API Entry using the settings endpoint

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getACustomEntry, type GetACustomEntryData, type GetACustomEntryResponse } from "@epcc-sdk/commerce-extensions";

const params: GetACustomEntryData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
    custom_api_entry_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetACustomEntryResponse = await getACustomEntry(params);
```

---

### **`updateACustomEntry`**

**Endpoint:** `PUT /v2/settings/extensions/custom-apis/{custom_api_id}/entries/{custom_api_entry_id}`

**Summary:** Update a Custom API Entry using the settings endpoint

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateACustomEntry, type UpdateACustomEntryData, type UpdateACustomEntryResponse } from "@epcc-sdk/commerce-extensions";

const params: UpdateACustomEntryData = {
  path: {
    custom_api_id: "12345678-1234-5678-9012-123456789012",
    custom_api_entry_id: "12345678-1234-5678-9012-123456789012",
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

**Endpoint:** `GET /v2/extensions/{custom_api_slug}`

**Summary:** Get all Custom API Entries using the extensions endpoint

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getCustomEntriesSettings, type GetCustomEntriesSettingsData, type GetCustomEntriesSettingsResponse } from "@epcc-sdk/commerce-extensions";

const params: GetCustomEntriesSettingsData = {
  path: {
    custom_api_slug: "product-slug",
  },
};

const result: GetCustomEntriesSettingsResponse = await getCustomEntriesSettings(params);
```

---

### **`createACustomEntrySettings`**

**Endpoint:** `POST /v2/extensions/{custom_api_slug}`

**Summary:** Create a Custom API Entry using the extensions endpoint

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createACustomEntrySettings, type CreateACustomEntrySettingsData, type CreateACustomEntrySettingsResponse } from "@epcc-sdk/commerce-extensions";

const params: CreateACustomEntrySettingsData = {
  path: {
    custom_api_slug: "product-slug",
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

**Endpoint:** `DELETE /v2/extensions/{custom_api_slug}/{custom_api_entry_id}`

**Summary:** Delete a Custom API Entry using the extensions endpoint

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteACustomEntrySettings, type DeleteACustomEntrySettingsData, type DeleteACustomEntrySettingsResponse } from "@epcc-sdk/commerce-extensions";

const params: DeleteACustomEntrySettingsData = {
  path: {
    custom_api_slug: "product-slug",
    custom_api_entry_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: DeleteACustomEntrySettingsResponse = await deleteACustomEntrySettings(params);
```

---

### **`getACustomEntrySettings`**

**Endpoint:** `GET /v2/extensions/{custom_api_slug}/{custom_api_entry_id}`

**Summary:** Get a Custom API Entry using the extensions endpoint

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getACustomEntrySettings, type GetACustomEntrySettingsData, type GetACustomEntrySettingsResponse } from "@epcc-sdk/commerce-extensions";

const params: GetACustomEntrySettingsData = {
  path: {
    custom_api_slug: "product-slug",
    custom_api_entry_id: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetACustomEntrySettingsResponse = await getACustomEntrySettings(params);
```

---

### **`putACustomEntrySettings`**

**Endpoint:** `PUT /v2/extensions/{custom_api_slug}/{custom_api_entry_id}`

**Summary:** Update a Custom API Entry using the extensions endpoint

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { putACustomEntrySettings, type PutACustomEntrySettingsData, type PutACustomEntrySettingsResponse } from "@epcc-sdk/commerce-extensions";

const params: PutACustomEntrySettingsData = {
  path: {
    custom_api_slug: "product-slug",
    custom_api_entry_id: "12345678-1234-5678-9012-123456789012",
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