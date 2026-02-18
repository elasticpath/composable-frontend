# @epcc-sdk/rule-promotions SDK

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
npm install @epcc-sdk/rule-promotions
# or
pnpm install @epcc-sdk/rule-promotions
# or
yarn add @epcc-sdk/rule-promotions
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
import { client } from "@epcc-sdk/rule-promotions";

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
import { createClient } from "@epcc-sdk/rule-promotions";

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

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/rule-promotions>".

```ts
const response = await getRulePromotions({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getRulePromotions({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/rule-promotions";

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
import { client } from "@epcc-sdk/rule-promotions";

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
import { client } from "@epcc-sdk/rule-promotions";

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
import { getRulePromotions } from "@epcc-sdk/rule-promotions";

const product = await getRulePromotions({
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


### **`getRulePromotions`**

**Endpoint:** `GET /v2/rule-promotions`

**Summary:** Get Rule Promotions

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getRulePromotions, type GetRulePromotionsData, type GetRulePromotionsResponse } from "@epcc-sdk/rule-promotions";

const params: GetRulePromotionsData = {
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
};

const result: GetRulePromotionsResponse = await getRulePromotions(params);
```

---

### **`createRulePromotion`**

**Endpoint:** `POST /v2/rule-promotions`

**Summary:** Create a Rule Promotion

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createRulePromotion, type CreateRulePromotionData, type CreateRulePromotionResponse } from "@epcc-sdk/rule-promotions";

const params: CreateRulePromotionData = {
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

const result: CreateRulePromotionResponse = await createRulePromotion(params);
```

---

### **`deleteRulePromotion`**

**Endpoint:** `DELETE /v2/rule-promotions/{promotionID}`

**Summary:** Delete a Rule Promotion

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteRulePromotion, type DeleteRulePromotionData, type DeleteRulePromotionResponse } from "@epcc-sdk/rule-promotions";

const params: DeleteRulePromotionData = {
  path: {
    promotionID: "promotionID",
  },
};

const result: DeleteRulePromotionResponse = await deleteRulePromotion(params);
```

---

### **`getRulePromotionById`**

**Endpoint:** `GET /v2/rule-promotions/{promotionID}`

**Summary:** Get a Rule Promotion by ID

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getRulePromotionById, type GetRulePromotionByIdData, type GetRulePromotionByIdResponse } from "@epcc-sdk/rule-promotions";

const params: GetRulePromotionByIdData = {
  path: {
    promotionID: "promotionID",
  },
};

const result: GetRulePromotionByIdResponse = await getRulePromotionById(params);
```

---

### **`updateRulePromotion`**

**Endpoint:** `PUT /v2/rule-promotions/{promotionID}`

**Summary:** Update a Rule Promotion

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateRulePromotion, type UpdateRulePromotionData, type UpdateRulePromotionResponse } from "@epcc-sdk/rule-promotions";

const params: UpdateRulePromotionData = {
  path: {
    promotionID: "promotionID",
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

const result: UpdateRulePromotionResponse = await updateRulePromotion(params);
```

---

### **`deleteRulePromotionCodes`**

**Endpoint:** `DELETE /v2/rule-promotions/{promotionID}/codes`

**Summary:** Delete Rule Promotion Codes

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteRulePromotionCodes, type DeleteRulePromotionCodesData, type DeleteRulePromotionCodesResponse } from "@epcc-sdk/rule-promotions";

const params: DeleteRulePromotionCodesData = {
  path: {
    promotionID: "promotionID",
  },
};

const result: DeleteRulePromotionCodesResponse = await deleteRulePromotionCodes(params);
```

---

### **`getRulePromotionCodes`**

**Endpoint:** `GET /v2/rule-promotions/{promotionID}/codes`

**Summary:** Get Rule Promotion Codes

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getRulePromotionCodes, type GetRulePromotionCodesData, type GetRulePromotionCodesResponse } from "@epcc-sdk/rule-promotions";

const params: GetRulePromotionCodesData = {
  path: {
    promotionID: "promotionID",
  },
};

const result: GetRulePromotionCodesResponse = await getRulePromotionCodes(params);
```

---

### **`createRulePromotionCodes`**

**Endpoint:** `POST /v2/rule-promotions/{promotionID}/codes`

**Summary:** Create Rule Promotion Codes

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createRulePromotionCodes, type CreateRulePromotionCodesData, type CreateRulePromotionCodesResponse } from "@epcc-sdk/rule-promotions";

const params: CreateRulePromotionCodesData = {
  path: {
    promotionID: "promotionID",
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

const result: CreateRulePromotionCodesResponse = await createRulePromotionCodes(params);
```

---

### **`deleteSingleRulePromotionCode`**

**Endpoint:** `DELETE /v2/rule-promotions/{promotionID}/codes/{codeID}`

**Summary:** Delete A Single Rule Promotion Code

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteSingleRulePromotionCode, type DeleteSingleRulePromotionCodeData, type DeleteSingleRulePromotionCodeResponse } from "@epcc-sdk/rule-promotions";

const params: DeleteSingleRulePromotionCodeData = {
  path: {
    promotionID: "promotionID",
    codeID: "CODE123",
  },
};

const result: DeleteSingleRulePromotionCodeResponse = await deleteSingleRulePromotionCode(params);
```

---

### **`getV2RulePromotionsByUuidJobs`**

**Endpoint:** `GET /v2/rule-promotions/{uuid}/jobs`

**Summary:** Get Rule Promotion Jobs

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getV2RulePromotionsByUuidJobs, type GetV2RulePromotionsByUuidJobsData, type GetV2RulePromotionsByUuidJobsResponse } from "@epcc-sdk/rule-promotions";

const params: GetV2RulePromotionsByUuidJobsData = {
  path: {
    uuid: "12345678-1234-5678-9012-123456789012",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
};

const result: GetV2RulePromotionsByUuidJobsResponse = await getV2RulePromotionsByUuidJobs(params);
```

---

### **`postV2RulePromotionsByUuidJobs`**

**Endpoint:** `POST /v2/rule-promotions/{uuid}/jobs`

**Summary:** Create a Rule Promotion Job

**Description:** POST operation

**TypeScript Example:**

```typescript
import { postV2RulePromotionsByUuidJobs, type PostV2RulePromotionsByUuidJobsData, type PostV2RulePromotionsByUuidJobsResponse } from "@epcc-sdk/rule-promotions";

const params: PostV2RulePromotionsByUuidJobsData = {
  path: {
    uuid: "12345678-1234-5678-9012-123456789012",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PostV2RulePromotionsByUuidJobsResponse = await postV2RulePromotionsByUuidJobs(params);
```

---

### **`getV2RulePromotionsByUuidJobsByJobUuidFile`**

**Endpoint:** `GET /v2/rule-promotions/{uuid}/jobs/{job-uuid}/file`

**Summary:** Get Rule Promotion Code Exported File

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getV2RulePromotionsByUuidJobsByJobUuidFile, type GetV2RulePromotionsByUuidJobsByJobUuidFileData, type GetV2RulePromotionsByUuidJobsByJobUuidFileResponse } from "@epcc-sdk/rule-promotions";

const params: GetV2RulePromotionsByUuidJobsByJobUuidFileData = {
  path: {
    uuid: "12345678-1234-5678-9012-123456789012",
    job-uuid: "12345678-1234-5678-9012-123456789012",
  },
};

const result: GetV2RulePromotionsByUuidJobsByJobUuidFileResponse = await getV2RulePromotionsByUuidJobsByJobUuidFile(params);
```

---

### **`postV2RulePromotionsByUuidJobsByJobUuidCancel`**

**Endpoint:** `POST /v2/rule-promotions/{uuid}/jobs/{job-uuid}/cancel`

**Summary:** Cancel a Rule Promotion Job

**Description:** POST operation

**TypeScript Example:**

```typescript
import { postV2RulePromotionsByUuidJobsByJobUuidCancel, type PostV2RulePromotionsByUuidJobsByJobUuidCancelData, type PostV2RulePromotionsByUuidJobsByJobUuidCancelResponse } from "@epcc-sdk/rule-promotions";

const params: PostV2RulePromotionsByUuidJobsByJobUuidCancelData = {
  path: {
    uuid: "12345678-1234-5678-9012-123456789012",
    job-uuid: "12345678-1234-5678-9012-123456789012",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: PostV2RulePromotionsByUuidJobsByJobUuidCancelResponse = await postV2RulePromotionsByUuidJobsByJobUuidCancel(params);
```

---

### **`anonymizeRulePromotionUsages`**

**Endpoint:** `POST /v2/rule-promotions/usages/anonymize`

**Summary:** Anonymize Rule Promotion Usages

**Description:** POST operation

**TypeScript Example:**

```typescript
import { anonymizeRulePromotionUsages, type AnonymizeRulePromotionUsagesData, type AnonymizeRulePromotionUsagesResponse } from "@epcc-sdk/rule-promotions";

const params: AnonymizeRulePromotionUsagesData = {
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: AnonymizeRulePromotionUsagesResponse = await anonymizeRulePromotionUsages(params);
```

---

### **`getRulePromotionUsages`**

**Endpoint:** `GET /v2/rule-promotions/{promotionID}/usages`

**Summary:** Get Rule Promotion Usages

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getRulePromotionUsages, type GetRulePromotionUsagesData, type GetRulePromotionUsagesResponse } from "@epcc-sdk/rule-promotions";

const params: GetRulePromotionUsagesData = {
  path: {
    promotionID: "promotionID",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
};

const result: GetRulePromotionUsagesResponse = await getRulePromotionUsages(params);
```

---

### **`getRulePromotionCodeUsages`**

**Endpoint:** `GET /v2/rule-promotions/{promotionID}/codes/{code}/usages`

**Summary:** Get Rule Promotion Code Usages

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getRulePromotionCodeUsages, type GetRulePromotionCodeUsagesData, type GetRulePromotionCodeUsagesResponse } from "@epcc-sdk/rule-promotions";

const params: GetRulePromotionCodeUsagesData = {
  path: {
    promotionID: "promotionID",
    code: "CODE123",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "page[offset]": 0, // OPTIONAL
  },
};

const result: GetRulePromotionCodeUsagesResponse = await getRulePromotionCodeUsages(params);
```

---




---