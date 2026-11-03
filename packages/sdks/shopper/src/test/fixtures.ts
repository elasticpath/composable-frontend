export const productListFromTheSpec = {
  data: [
    {
      type: "product",
      id: "8806d4ca-e1a8-4b35-b4d1-4ee7c9d8e5a6",
      attributes: {
        base_product: false,
        commodity_type: "physical",
        created_at: "2024-01-15T10:02:56.392Z",
        description: "A cotton T-shirt.",
        name: "T-Shirt",
        sku: "TSHIRT-001",
        slug: "t-shirt",
        status: "live",
        tags: ["summer"],
        updated_at: "2024-02-01T08:30:00.000Z",
        extensions: {
          "products(details)": {
            material: "cotton",
            weight_grams: 180,
            organic: true,
            care: null,
          },
        },
      },
      meta: {
        catalog_id: "362a16dc-f7c6-4280-83d6-4fcc152af091",
        catalog_source: "pim",
        product_types: ["standard"],
      },
    },
  ],
  links: {
    self: "/catalog/products?page[limit]=100",
    first: "/catalog/products?page[limit]=100&page[offset]=0",
    last: "/catalog/products?page[limit]=100&page[offset]=0",
  },
}
