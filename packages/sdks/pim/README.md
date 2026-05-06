# @epcc-sdk/sdks-pxm SDK

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


### **`getAllJobs`**

**Endpoint:** `GET /pcm/jobs`

**Summary:** Get All Jobs

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllJobs, type GetAllJobsData, type GetAllJobsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetAllJobsData = {
};

const result: GetAllJobsResponse = await getAllJobs(params);
```

---

### **`getJob`**

**Endpoint:** `GET /pcm/jobs/{jobID}`

**Summary:** Get a Job

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getJob, type GetJobData, type GetJobResponse } from "@epcc-sdk/sdks-pxm";

const params: GetJobData = {
  path: {
    jobID: "jobID",
  },
};

const result: GetJobResponse = await getJob(params);
```

---

### **`cancelJob`**

**Endpoint:** `POST /pcm/jobs/{jobID}/cancel`

**Summary:** Cancel a Job

**Description:** POST operation

**TypeScript Example:**

```typescript
import { cancelJob, type CancelJobData, type CancelJobResponse } from "@epcc-sdk/sdks-pxm";

const params: CancelJobData = {
  path: {
    jobID: "jobID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: CancelJobResponse = await cancelJob(params);
```

---

### **`getJobErrors`**

**Endpoint:** `GET /pcm/jobs/{jobID}/errors`

**Summary:** Get Job Errors

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getJobErrors, type GetJobErrorsData, type GetJobErrorsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetJobErrorsData = {
  path: {
    jobID: "jobID",
  },
};

const result: GetJobErrorsResponse = await getJobErrors(params);
```

---

### **`getAllProducts`**

**Endpoint:** `GET /pcm/products`

**Summary:** Get all products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllProducts, type GetAllProductsData, type GetAllProductsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetAllProductsData = {
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
};

const result: GetAllProductsResponse = await getAllProducts(params);
```

---

### **`createProduct`**

**Endpoint:** `POST /pcm/products`

**Summary:** Create a product or bundle

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createProduct, type CreateProductData, type CreateProductResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateProductData = {
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

const result: CreateProductResponse = await createProduct(params);
```

---

### **`importProducts`**

**Endpoint:** `POST /pcm/products/import`

**Summary:** Import Products

**Description:** POST operation

**TypeScript Example:**

```typescript
import { importProducts, type ImportProductsData, type ImportProductsResponse } from "@epcc-sdk/sdks-pxm";

const params: ImportProductsData = {
  query: {
    "locale": "locale", // OPTIONAL
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: ImportProductsResponse = await importProducts(params);
```

---

### **`exportProducts`**

**Endpoint:** `POST /pcm/products/export`

**Summary:** Export Products

**Description:** POST operation

**TypeScript Example:**

```typescript
import { exportProducts, type ExportProductsData, type ExportProductsResponse } from "@epcc-sdk/sdks-pxm";

const params: ExportProductsData = {
  query: {
    "useTemplateSlugs": true, // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: ExportProductsResponse = await exportProducts(params);
```

---

### **`deleteProduct`**

**Endpoint:** `DELETE /pcm/products/{productID}`

**Summary:** Delete a product

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteProduct, type DeleteProductData, type DeleteProductResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteProductData = {
  path: {
    productID: "productID",
  },
};

const result: DeleteProductResponse = await deleteProduct(params);
```

---

### **`getProduct`**

**Endpoint:** `GET /pcm/products/{productID}`

**Summary:** Get a product

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getProduct, type GetProductData, type GetProductResponse } from "@epcc-sdk/sdks-pxm";

const params: GetProductData = {
  path: {
    productID: "productID",
  },
  query: {
    "include": ["files", "main_images"], // OPTIONAL
  },
};

const result: GetProductResponse = await getProduct(params);
```

---

### **`updateProduct`**

**Endpoint:** `PUT /pcm/products/{productID}`

**Summary:** Update a product or bundle

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateProduct, type UpdateProductData, type UpdateProductResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateProductData = {
  path: {
    productID: "productID",
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

const result: UpdateProductResponse = await updateProduct(params);
```

---

### **`attachNodes`**

**Endpoint:** `POST /pcm/products/attach_nodes`

**Summary:** Attach multiple nodes

**Description:** POST operation

**TypeScript Example:**

```typescript
import { attachNodes, type AttachNodesData, type AttachNodesResponse } from "@epcc-sdk/sdks-pxm";

const params: AttachNodesData = {
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: AttachNodesResponse = await attachNodes(params);
```

---

### **`detachNodes`**

**Endpoint:** `POST /pcm/products/detach_nodes`

**Summary:** Detach multiple nodes

**Description:** POST operation

**TypeScript Example:**

```typescript
import { detachNodes, type DetachNodesData, type DetachNodesResponse } from "@epcc-sdk/sdks-pxm";

const params: DetachNodesData = {
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: DetachNodesResponse = await detachNodes(params);
```

---

### **`getProductsNodes`**

**Endpoint:** `GET /pcm/products/{productID}/nodes`

**Summary:** Get a product&#39;s nodes

**Description:** Returns the nodes associated with the product. Products must be in a `live` status.

**TypeScript Example:**

```typescript
import { getProductsNodes, type GetProductsNodesData, type GetProductsNodesResponse } from "@epcc-sdk/sdks-pxm";

const params: GetProductsNodesData = {
  path: {
    productID: "productID",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetProductsNodesResponse = await getProductsNodes(params);
```

---

### **`buildChildProducts`**

**Endpoint:** `POST /pcm/products/{productID}/build`

**Summary:** Build child products

**Description:** POST operation

**TypeScript Example:**

```typescript
import { buildChildProducts, type BuildChildProductsData, type BuildChildProductsResponse } from "@epcc-sdk/sdks-pxm";

const params: BuildChildProductsData = {
  path: {
    productID: "productID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: BuildChildProductsResponse = await buildChildProducts(params);
```

---

### **`getChildProducts`**

**Endpoint:** `GET /pcm/products/{productID}/children`

**Summary:** Get child products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getChildProducts, type GetChildProductsData, type GetChildProductsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetChildProductsData = {
  path: {
    productID: "productID",
  },
};

const result: GetChildProductsResponse = await getChildProducts(params);
```

---

### **`deleteProductTemplateRelationship`**

**Endpoint:** `DELETE /pcm/products/{productID}/relationships/templates`

**Summary:** Delete a product template relationship

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteProductTemplateRelationship, type DeleteProductTemplateRelationshipData, type DeleteProductTemplateRelationshipResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteProductTemplateRelationshipData = {
  path: {
    productID: "productID",
  },
};

const result: DeleteProductTemplateRelationshipResponse = await deleteProductTemplateRelationship(params);
```

---

### **`getProductTemplateRelationships`**

**Endpoint:** `GET /pcm/products/{productID}/relationships/templates`

**Summary:** Get all product template relationships

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getProductTemplateRelationships, type GetProductTemplateRelationshipsData, type GetProductTemplateRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetProductTemplateRelationshipsData = {
  path: {
    productID: "productID",
  },
};

const result: GetProductTemplateRelationshipsResponse = await getProductTemplateRelationships(params);
```

---

### **`createProductTemplateRelationship`**

**Endpoint:** `POST /pcm/products/{productID}/relationships/templates`

**Summary:** Create a product template relationship

**Description:** Retrieves all the templates that are associated with the specified product.

**TypeScript Example:**

```typescript
import { createProductTemplateRelationship, type CreateProductTemplateRelationshipData, type CreateProductTemplateRelationshipResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateProductTemplateRelationshipData = {
  path: {
    productID: "productID",
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

const result: CreateProductTemplateRelationshipResponse = await createProductTemplateRelationship(params);
```

---

### **`getProductComponentProductsRelationships`**

**Endpoint:** `GET /pcm/products/{productID}/relationships/component_products`

**Summary:** Get Bundle Component Product Relationships

**Description:** Retrieves all the products included in the specified bundle product.

**TypeScript Example:**

```typescript
import { getProductComponentProductsRelationships, type GetProductComponentProductsRelationshipsData, type GetProductComponentProductsRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetProductComponentProductsRelationshipsData = {
  path: {
    productID: "productID",
  },
};

const result: GetProductComponentProductsRelationshipsResponse = await getProductComponentProductsRelationships(params);
```

---

### **`deleteProductFileRelationships`**

**Endpoint:** `DELETE /pcm/products/{productID}/relationships/files`

**Summary:** Delete a product file relationships

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteProductFileRelationships, type DeleteProductFileRelationshipsData, type DeleteProductFileRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteProductFileRelationshipsData = {
  path: {
    productID: "productID",
  },
};

const result: DeleteProductFileRelationshipsResponse = await deleteProductFileRelationships(params);
```

---

### **`getProductFileRelationships`**

**Endpoint:** `GET /pcm/products/{productID}/relationships/files`

**Summary:** Get all product file relationships

**Description:** Retrieves all files that are associated with the specified product.

**TypeScript Example:**

```typescript
import { getProductFileRelationships, type GetProductFileRelationshipsData, type GetProductFileRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetProductFileRelationshipsData = {
  path: {
    productID: "productID",
  },
};

const result: GetProductFileRelationshipsResponse = await getProductFileRelationships(params);
```

---

### **`createProductFileRelationships`**

**Endpoint:** `POST /pcm/products/{productID}/relationships/files`

**Summary:** Create a product file relationship

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createProductFileRelationships, type CreateProductFileRelationshipsData, type CreateProductFileRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateProductFileRelationshipsData = {
  path: {
    productID: "productID",
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

const result: CreateProductFileRelationshipsResponse = await createProductFileRelationships(params);
```

---

### **`updateProductFileRelationships`**

**Endpoint:** `PUT /pcm/products/{productID}/relationships/files`

**Summary:** Replace a product file relationship

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateProductFileRelationships, type UpdateProductFileRelationshipsData, type UpdateProductFileRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateProductFileRelationshipsData = {
  path: {
    productID: "productID",
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

const result: UpdateProductFileRelationshipsResponse = await updateProductFileRelationships(params);
```

---

### **`deleteProductVariationRelationships`**

**Endpoint:** `DELETE /pcm/products/{productID}/relationships/variations`

**Summary:** Delete a product variation relationships

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteProductVariationRelationships, type DeleteProductVariationRelationshipsData, type DeleteProductVariationRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteProductVariationRelationshipsData = {
  path: {
    productID: "productID",
  },
};

const result: DeleteProductVariationRelationshipsResponse = await deleteProductVariationRelationships(params);
```

---

### **`getProductVariationRelationships`**

**Endpoint:** `GET /pcm/products/{productID}/relationships/variations`

**Summary:** Get all product variation relationships

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getProductVariationRelationships, type GetProductVariationRelationshipsData, type GetProductVariationRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetProductVariationRelationshipsData = {
  path: {
    productID: "productID",
  },
};

const result: GetProductVariationRelationshipsResponse = await getProductVariationRelationships(params);
```

---

### **`createProductVariationRelationships`**

**Endpoint:** `POST /pcm/products/{productID}/relationships/variations`

**Summary:** Create a product variation relationship

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createProductVariationRelationships, type CreateProductVariationRelationshipsData, type CreateProductVariationRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateProductVariationRelationshipsData = {
  path: {
    productID: "productID",
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

const result: CreateProductVariationRelationshipsResponse = await createProductVariationRelationships(params);
```

---

### **`updateProductVariationRelationships`**

**Endpoint:** `PUT /pcm/products/{productID}/relationships/variations`

**Summary:** Replace a product variation relationship

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateProductVariationRelationships, type UpdateProductVariationRelationshipsData, type UpdateProductVariationRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateProductVariationRelationshipsData = {
  path: {
    productID: "productID",
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

const result: UpdateProductVariationRelationshipsResponse = await updateProductVariationRelationships(params);
```

---

### **`deleteProductMainImageRelationships`**

**Endpoint:** `DELETE /pcm/products/{productID}/relationships/main_image`

**Summary:** Delete Main Image Relationships

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteProductMainImageRelationships, type DeleteProductMainImageRelationshipsData, type DeleteProductMainImageRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteProductMainImageRelationshipsData = {
  path: {
    productID: "productID",
  },
};

const result: DeleteProductMainImageRelationshipsResponse = await deleteProductMainImageRelationships(params);
```

---

### **`getProductMainImageRelationships`**

**Endpoint:** `GET /pcm/products/{productID}/relationships/main_image`

**Summary:** Get Main Image Relationships

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getProductMainImageRelationships, type GetProductMainImageRelationshipsData, type GetProductMainImageRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetProductMainImageRelationshipsData = {
  path: {
    productID: "productID",
  },
};

const result: GetProductMainImageRelationshipsResponse = await getProductMainImageRelationships(params);
```

---

### **`createProductMainImageRelationships`**

**Endpoint:** `POST /pcm/products/{productID}/relationships/main_image`

**Summary:** Create main image relationships

**Description:** Associates a main image with the specified product.

**TypeScript Example:**

```typescript
import { createProductMainImageRelationships, type CreateProductMainImageRelationshipsData, type CreateProductMainImageRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateProductMainImageRelationshipsData = {
  path: {
    productID: "productID",
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

const result: CreateProductMainImageRelationshipsResponse = await createProductMainImageRelationships(params);
```

---

### **`updateProductMainImageRelationships`**

**Endpoint:** `PUT /pcm/products/{productID}/relationships/main_image`

**Summary:** Replace Main Image Relationships

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateProductMainImageRelationships, type UpdateProductMainImageRelationshipsData, type UpdateProductMainImageRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateProductMainImageRelationshipsData = {
  path: {
    productID: "productID",
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

const result: UpdateProductMainImageRelationshipsResponse = await updateProductMainImageRelationships(params);
```

---

### **`detachCustomRelationships`**

**Endpoint:** `DELETE /pcm/products/{productID}/custom-relationships`

**Summary:** Delete Custom Relationships from a Product

**Description:** Delete Custom Relationships from a Product. Multiple Custom Relationships can be deleted from a product in one request.


**TypeScript Example:**

```typescript
import { detachCustomRelationships, type DetachCustomRelationshipsData, type DetachCustomRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: DetachCustomRelationshipsData = {
  path: {
    productID: "productID",
  },
};

const result: DetachCustomRelationshipsResponse = await detachCustomRelationships(params);
```

---

### **`listAttachedCustomRelationship`**

**Endpoint:** `GET /pcm/products/{productID}/custom-relationships`

**Summary:** Get all Custom Relationships attached to a Product

**Description:** GET operation

**TypeScript Example:**

```typescript
import { listAttachedCustomRelationship, type ListAttachedCustomRelationshipData, type ListAttachedCustomRelationshipResponse } from "@epcc-sdk/sdks-pxm";

const params: ListAttachedCustomRelationshipData = {
  path: {
    productID: "productID",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: ListAttachedCustomRelationshipResponse = await listAttachedCustomRelationship(params);
```

---

### **`attachCustomRelationships`**

**Endpoint:** `POST /pcm/products/{productID}/custom-relationships`

**Summary:** Attach Custom Relationships to a Product

**Description:** POST operation

**TypeScript Example:**

```typescript
import { attachCustomRelationships, type AttachCustomRelationshipsData, type AttachCustomRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: AttachCustomRelationshipsData = {
  path: {
    productID: "productID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: AttachCustomRelationshipsResponse = await attachCustomRelationships(params);
```

---

### **`dissociateProducts`**

**Endpoint:** `DELETE /pcm/products/{productID}/custom-relationships/{customRelationshipSlug}`

**Summary:** Delete a Relationship between a product with one or more products

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { dissociateProducts, type DissociateProductsData, type DissociateProductsResponse } from "@epcc-sdk/sdks-pxm";

const params: DissociateProductsData = {
  path: {
    productID: "productID",
    customRelationshipSlug: "customRelationshipSlug",
  },
};

const result: DissociateProductsResponse = await dissociateProducts(params);
```

---

### **`getRelatedProductIdsOfAProductId`**

**Endpoint:** `GET /pcm/products/{productID}/custom-relationships/{customRelationshipSlug}`

**Summary:** Get all Related Product IDs of a Products&#39; attached Custom Relationship

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getRelatedProductIdsOfAProductId, type GetRelatedProductIdsOfAProductIdData, type GetRelatedProductIdsOfAProductIdResponse } from "@epcc-sdk/sdks-pxm";

const params: GetRelatedProductIdsOfAProductIdData = {
  path: {
    productID: "productID",
    customRelationshipSlug: "customRelationshipSlug",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetRelatedProductIdsOfAProductIdResponse = await getRelatedProductIdsOfAProductId(params);
```

---

### **`productAssociationId`**

**Endpoint:** `POST /pcm/products/{productID}/custom-relationships/{customRelationshipSlug}`

**Summary:** Create a Relationship between a Product with one or more Products

**Description:** POST operation

**TypeScript Example:**

```typescript
import { productAssociationId, type ProductAssociationIdData, type ProductAssociationIdResponse } from "@epcc-sdk/sdks-pxm";

const params: ProductAssociationIdData = {
  path: {
    productID: "productID",
    customRelationshipSlug: "customRelationshipSlug",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: ProductAssociationIdResponse = await productAssociationId(params);
```

---

### **`getRelatedProductsOfAProductId`**

**Endpoint:** `GET /pcm/products/{productID}/custom-relationships/{customRelationshipSlug}/products`

**Summary:** Get all Related Products of a Products&#39; attached Custom Relationship

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getRelatedProductsOfAProductId, type GetRelatedProductsOfAProductIdData, type GetRelatedProductsOfAProductIdResponse } from "@epcc-sdk/sdks-pxm";

const params: GetRelatedProductsOfAProductIdData = {
  path: {
    productID: "productID",
    customRelationshipSlug: "customRelationshipSlug",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetRelatedProductsOfAProductIdResponse = await getRelatedProductsOfAProductId(params);
```

---

### **`getAllVariations`**

**Endpoint:** `GET /pcm/variations`

**Summary:** Get all variations

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllVariations, type GetAllVariationsData, type GetAllVariationsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetAllVariationsData = {
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetAllVariationsResponse = await getAllVariations(params);
```

---

### **`createVariation`**

**Endpoint:** `POST /pcm/variations`

**Summary:** Create a variation

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createVariation, type CreateVariationData, type CreateVariationResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateVariationData = {
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

const result: CreateVariationResponse = await createVariation(params);
```

---

### **`deleteVariation`**

**Endpoint:** `DELETE /pcm/variations/{variationID}`

**Summary:** Delete a variation and all it&#39;s associated options.

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteVariation, type DeleteVariationData, type DeleteVariationResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteVariationData = {
  path: {
    variationID: "variationID",
  },
};

const result: DeleteVariationResponse = await deleteVariation(params);
```

---

### **`getVariation`**

**Endpoint:** `GET /pcm/variations/{variationID}`

**Summary:** Get a variation

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getVariation, type GetVariationData, type GetVariationResponse } from "@epcc-sdk/sdks-pxm";

const params: GetVariationData = {
  path: {
    variationID: "variationID",
  },
};

const result: GetVariationResponse = await getVariation(params);
```

---

### **`updateVariation`**

**Endpoint:** `PUT /pcm/variations/{variationID}`

**Summary:** Update a variation

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateVariation, type UpdateVariationData, type UpdateVariationResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateVariationData = {
  path: {
    variationID: "variationID",
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

const result: UpdateVariationResponse = await updateVariation(params);
```

---

### **`getAllVariationOptions`**

**Endpoint:** `GET /pcm/variations/{variationID}/options`

**Summary:** Get all variation options

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllVariationOptions, type GetAllVariationOptionsData, type GetAllVariationOptionsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetAllVariationOptionsData = {
  path: {
    variationID: "variationID",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetAllVariationOptionsResponse = await getAllVariationOptions(params);
```

---

### **`createVariationOption`**

**Endpoint:** `POST /pcm/variations/{variationID}/options`

**Summary:** Create a variation option

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createVariationOption, type CreateVariationOptionData, type CreateVariationOptionResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateVariationOptionData = {
  path: {
    variationID: "variationID",
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

const result: CreateVariationOptionResponse = await createVariationOption(params);
```

---

### **`deleteVariationOption`**

**Endpoint:** `DELETE /pcm/variations/{variationID}/options/{optionID}`

**Summary:** Delete a variation option

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteVariationOption, type DeleteVariationOptionData, type DeleteVariationOptionResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteVariationOptionData = {
  path: {
    variationID: "variationID",
    optionID: "optionID",
  },
};

const result: DeleteVariationOptionResponse = await deleteVariationOption(params);
```

---

### **`getVariationOption`**

**Endpoint:** `GET /pcm/variations/{variationID}/options/{optionID}`

**Summary:** Get a variation option

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getVariationOption, type GetVariationOptionData, type GetVariationOptionResponse } from "@epcc-sdk/sdks-pxm";

const params: GetVariationOptionData = {
  path: {
    variationID: "variationID",
    optionID: "optionID",
  },
};

const result: GetVariationOptionResponse = await getVariationOption(params);
```

---

### **`updateVariationOption`**

**Endpoint:** `PUT /pcm/variations/{variationID}/options/{optionID}`

**Summary:** Update a variation option

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateVariationOption, type UpdateVariationOptionData, type UpdateVariationOptionResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateVariationOptionData = {
  path: {
    variationID: "variationID",
    optionID: "optionID",
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

const result: UpdateVariationOptionResponse = await updateVariationOption(params);
```

---

### **`getAllModifiers`**

**Endpoint:** `GET /pcm/variations/{variationID}/options/{optionID}/modifiers`

**Summary:** Get all modifiers

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllModifiers, type GetAllModifiersData, type GetAllModifiersResponse } from "@epcc-sdk/sdks-pxm";

const params: GetAllModifiersData = {
  path: {
    variationID: "variationID",
    optionID: "optionID",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetAllModifiersResponse = await getAllModifiers(params);
```

---

### **`createModifier`**

**Endpoint:** `POST /pcm/variations/{variationID}/options/{optionID}/modifiers`

**Summary:** Create a modifier

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createModifier, type CreateModifierData, type CreateModifierResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateModifierData = {
  path: {
    variationID: "variationID",
    optionID: "optionID",
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

const result: CreateModifierResponse = await createModifier(params);
```

---

### **`deleteModifier`**

**Endpoint:** `DELETE /pcm/variations/{variationID}/options/{optionID}/modifiers/{modifierID}`

**Summary:** Delete a modifier

**Description:** You cannot delete a modifier if it is in use. Deleting a modifier in us returns a `422 Failed Validation` error.

**TypeScript Example:**

```typescript
import { deleteModifier, type DeleteModifierData, type DeleteModifierResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteModifierData = {
  path: {
    variationID: "variationID",
    optionID: "optionID",
    modifierID: "modifierID",
  },
};

const result: DeleteModifierResponse = await deleteModifier(params);
```

---

### **`getModifier`**

**Endpoint:** `GET /pcm/variations/{variationID}/options/{optionID}/modifiers/{modifierID}`

**Summary:** Get a modifier

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getModifier, type GetModifierData, type GetModifierResponse } from "@epcc-sdk/sdks-pxm";

const params: GetModifierData = {
  path: {
    variationID: "variationID",
    optionID: "optionID",
    modifierID: "modifierID",
  },
};

const result: GetModifierResponse = await getModifier(params);
```

---

### **`updateModifier`**

**Endpoint:** `PUT /pcm/variations/{variationID}/options/{optionID}/modifiers/{modifierID}`

**Summary:** Update a modifier

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateModifier, type UpdateModifierData, type UpdateModifierResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateModifierData = {
  path: {
    variationID: "variationID",
    optionID: "optionID",
    modifierID: "modifierID",
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

const result: UpdateModifierResponse = await updateModifier(params);
```

---

### **`getHierarchy`**

**Endpoint:** `GET /pcm/hierarchies`

**Summary:** Get all hierarchies

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getHierarchy, type GetHierarchyData, type GetHierarchyResponse } from "@epcc-sdk/sdks-pxm";

const params: GetHierarchyData = {
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
};

const result: GetHierarchyResponse = await getHierarchy(params);
```

---

### **`createHierarchy`**

**Endpoint:** `POST /pcm/hierarchies`

**Summary:** Create a hierarchy

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createHierarchy, type CreateHierarchyData, type CreateHierarchyResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateHierarchyData = {
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

const result: CreateHierarchyResponse = await createHierarchy(params);
```

---

### **`getAllNodes`**

**Endpoint:** `GET /pcm/hierarchies/nodes`

**Summary:** List all nodes

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllNodes, type GetAllNodesData, type GetAllNodesResponse } from "@epcc-sdk/sdks-pxm";

const params: GetAllNodesData = {
  query: {
    "page[offset]": 0, // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetAllNodesResponse = await getAllNodes(params);
```

---

### **`deleteHierarchy`**

**Endpoint:** `DELETE /pcm/hierarchies/{hierarchyID}`

**Summary:** Delete a hierarchy

**Description:** Deletes the specified hierarchy and all its children.

**TypeScript Example:**

```typescript
import { deleteHierarchy, type DeleteHierarchyData, type DeleteHierarchyResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteHierarchyData = {
  path: {
    hierarchyID: "hierarchyID",
  },
};

const result: DeleteHierarchyResponse = await deleteHierarchy(params);
```

---

### **`getHierarchyChild`**

**Endpoint:** `GET /pcm/hierarchies/{hierarchyID}`

**Summary:** Get a hierarchy

**Description:** Retrieves the specified hierarchy.

**TypeScript Example:**

```typescript
import { getHierarchyChild, type GetHierarchyChildData, type GetHierarchyChildResponse } from "@epcc-sdk/sdks-pxm";

const params: GetHierarchyChildData = {
  path: {
    hierarchyID: "hierarchyID",
  },
};

const result: GetHierarchyChildResponse = await getHierarchyChild(params);
```

---

### **`updateHierarchy`**

**Endpoint:** `PUT /pcm/hierarchies/{hierarchyID}`

**Summary:** Update a hierarchy

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateHierarchy, type UpdateHierarchyData, type UpdateHierarchyResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateHierarchyData = {
  path: {
    hierarchyID: "hierarchyID",
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

const result: UpdateHierarchyResponse = await updateHierarchy(params);
```

---

### **`getAllNodesInHierarchy`**

**Endpoint:** `GET /pcm/hierarchies/{hierarchyID}/nodes`

**Summary:** Get all nodes in a hierarchy

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllNodesInHierarchy, type GetAllNodesInHierarchyData, type GetAllNodesInHierarchyResponse } from "@epcc-sdk/sdks-pxm";

const params: GetAllNodesInHierarchyData = {
  path: {
    hierarchyID: "hierarchyID",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetAllNodesInHierarchyResponse = await getAllNodesInHierarchy(params);
```

---

### **`createNode`**

**Endpoint:** `POST /pcm/hierarchies/{hierarchyID}/nodes`

**Summary:** Create a node

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createNode, type CreateNodeData, type CreateNodeResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateNodeData = {
  path: {
    hierarchyID: "hierarchyID",
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

const result: CreateNodeResponse = await createNode(params);
```

---

### **`deleteNode`**

**Endpoint:** `DELETE /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}`

**Summary:** Deletes a node

**Description:** Deletes a node by the node ID

**TypeScript Example:**

```typescript
import { deleteNode, type DeleteNodeData, type DeleteNodeResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteNodeData = {
  path: {
    hierarchyID: "hierarchyID",
    nodeID: "nodeID",
  },
};

const result: DeleteNodeResponse = await deleteNode(params);
```

---

### **`getHierarchyNode`**

**Endpoint:** `GET /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}`

**Summary:** Get a node

**Description:** Retrieves a node from a hierarchy.

**TypeScript Example:**

```typescript
import { getHierarchyNode, type GetHierarchyNodeData, type GetHierarchyNodeResponse } from "@epcc-sdk/sdks-pxm";

const params: GetHierarchyNodeData = {
  path: {
    hierarchyID: "hierarchyID",
    nodeID: "nodeID",
  },
};

const result: GetHierarchyNodeResponse = await getHierarchyNode(params);
```

---

### **`updateNode`**

**Endpoint:** `PUT /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}`

**Summary:** Update a node

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateNode, type UpdateNodeData, type UpdateNodeResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateNodeData = {
  path: {
    hierarchyID: "hierarchyID",
    nodeID: "nodeID",
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

const result: UpdateNodeResponse = await updateNode(params);
```

---

### **`getAllChildren`**

**Endpoint:** `GET /pcm/hierarchies/{hierarchyID}/children`

**Summary:** Get a hierarchy&#39;s children

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllChildren, type GetAllChildrenData, type GetAllChildrenResponse } from "@epcc-sdk/sdks-pxm";

const params: GetAllChildrenData = {
  path: {
    hierarchyID: "hierarchyID",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetAllChildrenResponse = await getAllChildren(params);
```

---

### **`createHierarchyChildRelationships`**

**Endpoint:** `POST /pcm/hierarchies/{hierarchyID}/relationships/children`

**Summary:** Create relationships between a hierarchy and child nodes

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createHierarchyChildRelationships, type CreateHierarchyChildRelationshipsData, type CreateHierarchyChildRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateHierarchyChildRelationshipsData = {
  path: {
    hierarchyID: "hierarchyID",
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

const result: CreateHierarchyChildRelationshipsResponse = await createHierarchyChildRelationships(params);
```

---

### **`createNodeChildRelationships`**

**Endpoint:** `POST /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/relationships/children`

**Summary:** Create relationships between a node and child nodes

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createNodeChildRelationships, type CreateNodeChildRelationshipsData, type CreateNodeChildRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateNodeChildRelationshipsData = {
  path: {
    hierarchyID: "hierarchyID",
    nodeID: "nodeID",
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

const result: CreateNodeChildRelationshipsResponse = await createNodeChildRelationships(params);
```

---

### **`getAllNodeChildren`**

**Endpoint:** `GET /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/children`

**Summary:** Get a node&#39;s children

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllNodeChildren, type GetAllNodeChildrenData, type GetAllNodeChildrenResponse } from "@epcc-sdk/sdks-pxm";

const params: GetAllNodeChildrenData = {
  path: {
    hierarchyID: "hierarchyID",
    nodeID: "nodeID",
  },
  query: {
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetAllNodeChildrenResponse = await getAllNodeChildren(params);
```

---

### **`deleteNodeParent`**

**Endpoint:** `DELETE /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/relationships/parent`

**Summary:** Delete a node&#39;s parent

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteNodeParent, type DeleteNodeParentData, type DeleteNodeParentResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteNodeParentData = {
  path: {
    hierarchyID: "hierarchyID",
    nodeID: "nodeID",
  },
};

const result: DeleteNodeParentResponse = await deleteNodeParent(params);
```

---

### **`updateNodeParent`**

**Endpoint:** `PUT /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/relationships/parent`

**Summary:** Update a node&#39;s parent

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateNodeParent, type UpdateNodeParentData, type UpdateNodeParentResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateNodeParentData = {
  path: {
    hierarchyID: "hierarchyID",
    nodeID: "nodeID",
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

const result: UpdateNodeParentResponse = await updateNodeParent(params);
```

---

### **`deleteNodeProductRelationships`**

**Endpoint:** `DELETE /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/relationships/products`

**Summary:** Deletes a node&#39;s product relationships

**Description:** DELETE operation

**TypeScript Example:**

```typescript
import { deleteNodeProductRelationships, type DeleteNodeProductRelationshipsData, type DeleteNodeProductRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteNodeProductRelationshipsData = {
  path: {
    hierarchyID: "hierarchyID",
    nodeID: "nodeID",
  },
};

const result: DeleteNodeProductRelationshipsResponse = await deleteNodeProductRelationships(params);
```

---

### **`createNodeProductRelationship`**

**Endpoint:** `POST /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/relationships/products`

**Summary:** Create a node&#39;s product relationships

**Description:** Creates relationships between the specified node and one or more products in a specified hierarchy.

**TypeScript Example:**

```typescript
import { createNodeProductRelationship, type CreateNodeProductRelationshipData, type CreateNodeProductRelationshipResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateNodeProductRelationshipData = {
  path: {
    hierarchyID: "hierarchyID",
    nodeID: "nodeID",
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

const result: CreateNodeProductRelationshipResponse = await createNodeProductRelationship(params);
```

---

### **`getNodeProducts`**

**Endpoint:** `GET /pcm/hierarchies/{hierarchyID}/nodes/{nodeID}/products`

**Summary:** Get a node&#39;s products

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getNodeProducts, type GetNodeProductsData, type GetNodeProductsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetNodeProductsData = {
  path: {
    hierarchyID: "hierarchyID",
    nodeID: "nodeID",
  },
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
  },
};

const result: GetNodeProductsResponse = await getNodeProducts(params);
```

---

### **`duplicateHierarchy`**

**Endpoint:** `POST /pcm/hierarchies/{hierarchyID}/duplicate_job`

**Summary:** Duplicate a hierarchy

**Description:** POST operation

**TypeScript Example:**

```typescript
import { duplicateHierarchy, type DuplicateHierarchyData, type DuplicateHierarchyResponse } from "@epcc-sdk/sdks-pxm";

const params: DuplicateHierarchyData = {
  path: {
    hierarchyID: "hierarchyID",
  },
  body: {
    data: {
      type: "resource"
    }
  },
};

const result: DuplicateHierarchyResponse = await duplicateHierarchy(params);
```

---

### **`getAllProductTags`**

**Endpoint:** `GET /pcm/tags`

**Summary:** Get All Product Tags

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getAllProductTags, type GetAllProductTagsData, type GetAllProductTagsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetAllProductTagsData = {
};

const result: GetAllProductTagsResponse = await getAllProductTags(params);
```

---

### **`getProductTag`**

**Endpoint:** `GET /pcm/tags/{tagID}`

**Summary:** Get a Product Tag

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getProductTag, type GetProductTagData, type GetProductTagResponse } from "@epcc-sdk/sdks-pxm";

const params: GetProductTagData = {
  path: {
    tagID: "tagID",
  },
};

const result: GetProductTagResponse = await getProductTag(params);
```

---

### **`getCustomRelationships`**

**Endpoint:** `GET /pcm/custom-relationships`

**Summary:** Get all custom relationships

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getCustomRelationships, type GetCustomRelationshipsData, type GetCustomRelationshipsResponse } from "@epcc-sdk/sdks-pxm";

const params: GetCustomRelationshipsData = {
  query: {
    "page[offset]": 0, // OPTIONAL
    "page[limit]": 10, // OPTIONAL
    "filter": "eq(name,\"Product Name\")", // OPTIONAL
  },
};

const result: GetCustomRelationshipsResponse = await getCustomRelationships(params);
```

---

### **`createCustomRelationship`**

**Endpoint:** `POST /pcm/custom-relationships`

**Summary:** Create a custom relationship

**Description:** POST operation

**TypeScript Example:**

```typescript
import { createCustomRelationship, type CreateCustomRelationshipData, type CreateCustomRelationshipResponse } from "@epcc-sdk/sdks-pxm";

const params: CreateCustomRelationshipData = {
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

const result: CreateCustomRelationshipResponse = await createCustomRelationship(params);
```

---

### **`deleteCustomRelationship`**

**Endpoint:** `DELETE /pcm/custom-relationships/{customRelationshipSlug}`

**Summary:** Delete a custom relationship

**Description:** Deletes the specified custom relationship.

Custom Relationships cannot be deleted if they are in use.


**TypeScript Example:**

```typescript
import { deleteCustomRelationship, type DeleteCustomRelationshipData, type DeleteCustomRelationshipResponse } from "@epcc-sdk/sdks-pxm";

const params: DeleteCustomRelationshipData = {
  path: {
    customRelationshipSlug: "customRelationshipSlug",
  },
};

const result: DeleteCustomRelationshipResponse = await deleteCustomRelationship(params);
```

---

### **`getCustomRelationship`**

**Endpoint:** `GET /pcm/custom-relationships/{customRelationshipSlug}`

**Summary:** Get a custom relationship

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getCustomRelationship, type GetCustomRelationshipData, type GetCustomRelationshipResponse } from "@epcc-sdk/sdks-pxm";

const params: GetCustomRelationshipData = {
  path: {
    customRelationshipSlug: "customRelationshipSlug",
  },
};

const result: GetCustomRelationshipResponse = await getCustomRelationship(params);
```

---

### **`updateCustomRelationship`**

**Endpoint:** `PUT /pcm/custom-relationships/{customRelationshipSlug}`

**Summary:** Update a custom relationship

**Description:** PUT operation

**TypeScript Example:**

```typescript
import { updateCustomRelationship, type UpdateCustomRelationshipData, type UpdateCustomRelationshipResponse } from "@epcc-sdk/sdks-pxm";

const params: UpdateCustomRelationshipData = {
  path: {
    customRelationshipSlug: "customRelationshipSlug",
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

const result: UpdateCustomRelationshipResponse = await updateCustomRelationship(params);
```

---




---