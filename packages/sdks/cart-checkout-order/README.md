# @epcc-sdk/sdks-cart-checkout-order SDK

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
npm install @epcc-sdk/sdks-cart-checkout-order
# or
pnpm install @epcc-sdk/sdks-cart-checkout-order
# or
yarn add @epcc-sdk/sdks-cart-checkout-order
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
import { client } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { createClient } from "@epcc-sdk/sdks-cart-checkout-order";

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

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/sdks-cart-checkout-order>".

```ts
const response = await getACart({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getACart({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { client } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { client } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getACart } from "@epcc-sdk/sdks-cart-checkout-order";

const product = await getACart({
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


### **`getCarts`**

**Endpoint:** `GET /v2/carts`

**Summary:** Get Shopper Carts

**Description:** GET operation

**TypeScript Example:**

```typescript
import { getCarts, type GetCartsData, type GetCartsResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { createACart, type CreateACartData, type CreateACartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { deleteACart, type DeleteACartData, type DeleteACartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getACart, type GetACartData, type GetACartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

const params: GetACartData = {
  path: {
    cartID: "cartID",
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
import { updateACart, type UpdateACartData, type UpdateACartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { deleteAllCartItems, type DeleteAllCartItemsData, type DeleteAllCartItemsResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getCartItems, type GetCartItemsData, type GetCartItemsResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { manageCarts, type ManageCartsData, type ManageCartsResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { bulkUpdateItemsInCart, type BulkUpdateItemsInCartData, type BulkUpdateItemsInCartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { deleteACartItem, type DeleteACartItemData, type DeleteACartItemResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { updateACartItem, type UpdateACartItemData, type UpdateACartItemResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { deleteAccountCartAssociation, type DeleteAccountCartAssociationData, type DeleteAccountCartAssociationResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { createAccountCartAssociation, type CreateAccountCartAssociationData, type CreateAccountCartAssociationResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { deleteCustomerCartAssociation, type DeleteCustomerCartAssociationData, type DeleteCustomerCartAssociationResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { createCustomerCartAssociation, type CreateCustomerCartAssociationData, type CreateCustomerCartAssociationResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { deleteAPromotionViaPromotionCode, type DeleteAPromotionViaPromotionCodeData, type DeleteAPromotionViaPromotionCodeResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { addTaxItemToCart, type AddTaxItemToCartData, type AddTaxItemToCartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { bulkDeleteTaxItemsFromCart, type BulkDeleteTaxItemsFromCartData, type BulkDeleteTaxItemsFromCartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { bulkAddTaxItemsToCart, type BulkAddTaxItemsToCartData, type BulkAddTaxItemsToCartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { deleteATaxItem, type DeleteATaxItemData, type DeleteATaxItemResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { updateATaxItem, type UpdateATaxItemData, type UpdateATaxItemResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { bulkDeleteCustomDiscountsFromCart, type BulkDeleteCustomDiscountsFromCartData, type BulkDeleteCustomDiscountsFromCartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { bulkAddCustomDiscountsToCart, type BulkAddCustomDiscountsToCartData, type BulkAddCustomDiscountsToCartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { deleteCustomDiscountFromCart, type DeleteCustomDiscountFromCartData, type DeleteCustomDiscountFromCartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { updateCustomDiscountForCart, type UpdateCustomDiscountForCartData, type UpdateCustomDiscountForCartResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { addCustomDiscountToCartItem, type AddCustomDiscountToCartItemData, type AddCustomDiscountToCartItemResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { deleteCustomDiscountFromCartItem, type DeleteCustomDiscountFromCartItemData, type DeleteCustomDiscountFromCartItemResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { updateCustomDiscountForCartItem, type UpdateCustomDiscountForCartItemData, type UpdateCustomDiscountForCartItemResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getShippingGroups, type GetShippingGroupsData, type GetShippingGroupsResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { createShippingGroup, type CreateShippingGroupData, type CreateShippingGroupResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { deleteCartShippingGroup, type DeleteCartShippingGroupData, type DeleteCartShippingGroupResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getShippingGroupById, type GetShippingGroupByIdData, type GetShippingGroupByIdResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { updateShippingGroup, type UpdateShippingGroupData, type UpdateShippingGroupResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { createCartPaymentIntent, type CreateCartPaymentIntentData, type CreateCartPaymentIntentResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { updateCartPaymentIntent, type UpdateCartPaymentIntentData, type UpdateCartPaymentIntentResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { checkoutApi, type CheckoutApiData, type CheckoutApiResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getCustomerOrders, type GetCustomerOrdersData, type GetCustomerOrdersResponse } from "@epcc-sdk/sdks-cart-checkout-order";

const params: GetCustomerOrdersData = {
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
import { getAnOrder, type GetAnOrderData, type GetAnOrderResponse } from "@epcc-sdk/sdks-cart-checkout-order";

const params: GetAnOrderData = {
  path: {
    orderID: "orderID",
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
import { updateAnOrder, type UpdateAnOrderData, type UpdateAnOrderResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getOrderItems, type GetOrderItemsData, type GetOrderItemsResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { anonymizeOrders, type AnonymizeOrdersData, type AnonymizeOrdersResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { confirmOrder, type ConfirmOrderData, type ConfirmOrderResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { paymentSetup, type PaymentSetupData, type PaymentSetupResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { confirmPayment, type ConfirmPaymentData, type ConfirmPaymentResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { captureATransaction, type CaptureATransactionData, type CaptureATransactionResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { refundATransaction, type RefundATransactionData, type RefundATransactionResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getOrderTransactions, type GetOrderTransactionsData, type GetOrderTransactionsResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getATransaction, type GetATransactionData, type GetATransactionResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { cancelATransaction, type CancelATransactionData, type CancelATransactionResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getOrderShippingGroups, type GetOrderShippingGroupsData, type GetOrderShippingGroupsResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { createOrderShippingGroup, type CreateOrderShippingGroupData, type CreateOrderShippingGroupResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { getShippingGroupsById, type GetShippingGroupsByIdData, type GetShippingGroupsByIdResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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
import { putShippingGroupById, type PutShippingGroupByIdData, type PutShippingGroupByIdResponse } from "@epcc-sdk/sdks-cart-checkout-order";

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




---