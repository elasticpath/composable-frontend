const address = {
  first_name: "Ada",
  last_name: "Lovelace",
  line_1: "1 Analytical Way",
  city: "Portland",
  region: "Oregon",
  postcode: "97201",
  country: "US",
}

export const customerCheckout = {
  data: {
    customer: { email: "ada@example.com", name: "Ada Lovelace" },
    billing_address: address,
    shipping_address: address,
  },
}

export const accountCheckout = {
  data: {
    account: {
      id: "8cdb4e2b-cbd2-4e5a-8b64-0b4d3c4a3a10",
      member_id: "2f6b0a8e-7c15-4b9e-9d5d-6f1f1f6d8a21",
    },
    contact: { name: "Ada Lovelace", email: "ada@example.com" },
    billing_address: address,
    shipping_address: address,
  },
}

export const accountCheckoutWithTheAccountFromItsToken = {
  data: {
    contact: { name: "Ada Lovelace", email: "ada@example.com" },
    billing_address: address,
    shipping_address: address,
  },
}

const formatted = (amount: number) => ({
  amount,
  currency: "USD",
  formatted: `$${(amount / 100).toFixed(2)}`,
})

const lineDisplayPrice = (amount: number) => ({
  with_tax: { unit: formatted(amount), value: formatted(amount) },
  without_tax: { unit: formatted(amount), value: formatted(amount) },
})

const timestamps = {
  created_at: "2025-09-10T22:28:29Z",
  updated_at: "2025-09-10T22:28:29Z",
}

const noImage = { mime_type: "", file_name: "", href: "" }

export const cartItem = {
  id: "a78f7fb8-af44-490e-84ec-5c3c3d96b00c",
  type: "cart_item",
  product_id: "35e32a2a-cb9d-44c1-a9a5-3b198bd49ba7",
  name: "Cotton T-Shirt",
  description: "",
  sku: "cotton-tshirt",
  slug: "cotton-tshirt",
  image: noImage,
  quantity: 1,
  manage_stock: false,
  unit_price: { amount: 2200, currency: "USD", includes_tax: false },
  value: { amount: 2200, currency: "USD", includes_tax: false },
  links: {
    product:
      "https://useast.api.elasticpath.com/v2/products/35e32a2a-cb9d-44c1-a9a5-3b198bd49ba7",
  },
  meta: { display_price: lineDisplayPrice(2200), timestamps },
  catalog_id: "bb06b811-95db-420d-a7ef-810eee1bb343",
  catalog_source: "pim",
}

export const customItem = {
  id: "1359223e-5de0-4d42-a2ec-14350a84c173",
  type: "custom_item",
  name: "My Custom Item",
  description: "My first custom item!",
  sku: "Sample-sku",
  slug: "",
  image: noImage,
  quantity: 1,
  manage_stock: false,
  unit_price: { amount: 10000, currency: "USD", includes_tax: true },
  value: { amount: 10000, currency: "USD", includes_tax: true },
  links: {},
  meta: { display_price: lineDisplayPrice(10000), timestamps },
}

export const subscriptionItem = {
  id: "0b0f2a59-4c0e-4f4b-9a39-1d2a9f0f5c11",
  type: "subscription_item",
  subscription_offering_id: "9c13669e-29d7-42ea-bc95-1b32399adb9d",
  name: "Monthly Coffee",
  description: "A bag of coffee every month",
  sku: "monthly-coffee",
  slug: "",
  image: noImage,
  quantity: 1,
  manage_stock: false,
  unit_price: { amount: 1500, currency: "USD", includes_tax: false },
  value: { amount: 1500, currency: "USD", includes_tax: false },
  subscription_configuration: {
    plan: "6a6a44b4-35b4-4d6c-a1bf-d0b3c4e4d0c1",
    pricing_option: "e6b8b1c9-5e2f-4e8f-8d1e-3f0b6d2c7a44",
  },
  links: {},
  meta: { display_price: lineDisplayPrice(1500), timestamps },
}

export const promotionItem = {
  id: "7a7fb70a-561a-4caf-a112-c3e5a74145f4",
  type: "promotion_item",
  promotion_id: "4c8cc302-b1e8-4d1e-a1d5-fb74fda83705",
  name: "cart auto",
  description: "Promotion",
  sku: "auto_4c8cc302-b1e8-4d1e-a1d5-fb74fda83705",
  slug: "",
  image: noImage,
  quantity: 1,
  manage_stock: false,
  unit_price: { amount: -1000, currency: "USD", includes_tax: false },
  value: { amount: -1000, currency: "USD", includes_tax: false },
  links: {},
  meta: { display_price: lineDisplayPrice(-1000), timestamps },
}

export const addToCartResponse = {
  data: [cartItem, customItem, subscriptionItem, promotionItem],
  meta: {
    display_price: {
      with_tax: formatted(12700),
      without_tax: formatted(12700),
      tax: formatted(0),
      discount: formatted(-1000),
      without_discount: formatted(13700),
      shipping: formatted(0),
      shipping_discount: formatted(0),
    },
    timestamps,
  },
}

export const orderWithACustomItem = {
  data: {
    type: "order",
    id: "4c1c4c56-6a2b-4f43-9f7a-7c8d2e1b9a10",
    status: "incomplete",
    payment: "unpaid",
    shipping: "unfulfilled",
  },
  included: {
    items: [
      {
        type: "order_item",
        id: "9d1e0c7a-3b5f-4a8e-b2c4-6f7a8b9c0d1e",
        quantity: 1,
        product_id: "",
        name: "Gift wrap",
        sku: "gift-wrap",
      },
    ],
  },
}
