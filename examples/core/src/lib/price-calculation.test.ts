import { describe, test, expect } from "vitest";
import { calculateMultiItemOriginalTotal, calculateSaleAmount, calculateTotalSavings, getFormattedPercentage, getFormattedValue } from "./price-calculation";
import { Item } from "./group-cart-items";
import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";

describe("price-calculation", () => {
  const item = {
    id: "0550efa2-52c8-452b-a411-61fb492641fd",
    type: "cart_item",
    product_id: "3281ce38-87a7-488e-a113-9a6b2f616908",
    name: "Test Product",
    description: "<p><strong>test product description</strong></p>\n",
    sku: "test-product",
    slug: "test-product",
    image: {
      mime_type: "image/jpeg",
      file_name:
        "duart-castle-isle-of-mull-gift-shop-maclean-accessories-wool-scarf-2.jpg",
      href: "https://d1s4tacif4dym4.cloudfront.net/61a0857b-3a82-4974-8354-c0f1b36310c3/f85af602-16fa-41e0-a327-6cd47880b07e.jpg",
    },
    quantity: 2,
    manage_stock: false,
    unit_price: {
      amount: 1400,
      currency: "USD",
      includes_tax: false,
    },
    value: {
      amount: 2800,
      currency: "USD",
      includes_tax: false,
    },
    discounts: [
      {
        amount: {
          amount: -140,
          currency: "USD",
          includes_tax: false,
        },
        code: "TEST2",
        id: "0592d6ea-5eb3-42cf-ba50-ac48c55a4d2a",
        promotion_source: "rule-promotion",
        ordinal: 1,
      },
      {
        amount: {
          amount: -266,
          currency: "USD",
          includes_tax: false,
        },
        code: "TEST1",
        id: "3757740e-f773-4579-8911-be3891fa9935",
        promotion_source: "rule-promotion",
        is_cart_discount: true,
        ordinal: 2,
      },
    ],
    links: {
      product:
        "https://epcc-integration.global.ssl.fastly.net/v2/products/3281ce38-87a7-488e-a113-9a6b2f616908",
    },
    meta: {
      display_price: {
        with_tax: {
          unit: {
            amount: 1197,
            currency: "USD",
            formatted: "$11.97",
          },
          value: {
            amount: 2394,
            currency: "USD",
            formatted: "$23.94",
          },
        },
        without_tax: {
          unit: {
            amount: 1197,
            currency: "USD",
            formatted: "$11.97",
          },
          value: {
            amount: 2394,
            currency: "USD",
            formatted: "$23.94",
          },
        },
        tax: {
          unit: {
            amount: 0,
            currency: "USD",
            formatted: "$0.00",
          },
          value: {
            amount: 0,
            currency: "USD",
            formatted: "$0.00",
          },
        },
        discount: {
          unit: {
            amount: -203,
            currency: "USD",
            formatted: "-$2.03",
          },
          value: {
            amount: -406,
            currency: "USD",
            formatted: "-$4.06",
          },
        },
        without_discount: {
          unit: {
            amount: 1400,
            currency: "USD",
            formatted: "$14.00",
          },
          value: {
            amount: 2800,
            currency: "USD",
            formatted: "$28.00",
          },
        },
        discounts: {
          TEST1: {
            amount: -266,
            currency: "USD",
            formatted: "-$2.66",
            constituents: {
              "3757740e-f773-4579-8911-be3891fa9935": {
                amount: -266,
                currency: "USD",
                formatted: "-$2.66",
              },
            },
          },
          TEST2: {
            amount: -140,
            currency: "USD",
            formatted: "-$1.40",
            constituents: {
              "0592d6ea-5eb3-42cf-ba50-ac48c55a4d2a": {
                amount: -140,
                currency: "USD",
                formatted: "-$1.40",
              },
            },
          },
        },
      },
      timestamps: {
        created_at: "2025-11-25T10:00:34Z",
        updated_at: "2025-11-25T10:02:29Z",
      },
    },
    catalog_id: "bb06b811-95db-420d-a7ef-810eee1bb343",
    catalog_source: "pim",
    location: "awdaw",
    productDetail: {
      id: "3281ce38-87a7-488e-a113-9a6b2f616908",
      type: "product",
      attributes: {
        base_product: false,
        commodity_type: "physical",
        created_at: "2023-03-14T16:38:19.267Z",
        description: "<p><strong>test product description</strong></p>\n",
        extensions: {
          "products(general)": {
            "product-care": null,
            "review-rating": null,
            subtitle: "abc",
            "wireframe-url": null,
          },
          "products(plasmic-attributes)": {
            "plasmic-brand": "Knitting inc",
          },
        },
        name: "Test Product",
        price: {
          EUR: {
            amount: 999,
            includes_tax: false,
          },
          GBP: {
            amount: 888,
            includes_tax: false,
          },
          USD: {
            amount: 1400,
            includes_tax: false,
          },
        },
        sku: "test-product",
        slug: "test-product",
        status: "live",
        updated_at: "2025-11-19T12:31:48.070Z",
        published_at: "2025-11-19T12:33:50.304Z",
      },
      meta: {
        catalog_id: "bb06b811-95db-420d-a7ef-810eee1bb343",
        catalog_source: "pim",
        custom_relationships: [
          "CRP_similar-items",
          "CRP_test2",
          "CRP_you-may-also-like",
        ],
        original_price: {
          EUR: {
            amount: 1102,
            includes_tax: false,
          },
          GBP: {
            amount: 1000,
            includes_tax: false,
          },
          USD: {
            amount: 1900,
            includes_tax: false,
          },
        },
        pricebook_id: "fe4a40ab-4bd1-4678-b94c-be799cbd58ac",
        product_types: ["standard"],
        sale_expires: "2026-07-30T02:45:11.000Z",
        sale_id: "Test",
        bread_crumb_nodes: ["50059701-ec6d-4829-b6d4-65831b98855e"],
        bread_crumbs: {
          "50059701-ec6d-4829-b6d4-65831b98855e": [
            "06d5d325-487d-411d-9504-4bc8ca3b677b",
          ],
        },
        display_price: {
          without_tax: {
            amount: 1400,
            currency: "USD",
            float_price: 14,
            formatted: "$14.00",
          },
        },
        original_display_price: {
          without_tax: {
            amount: 1900,
            currency: "USD",
            float_price: 19,
            formatted: "$19.00",
          },
        },
      },
      relationships: {
        custom_relationships: {
          links: {
            "CRP_similar-items":
              "/catalog/products/3281ce38-87a7-488e-a113-9a6b2f616908/relationships/CRP_similar-items/products",
            CRP_test2:
              "/catalog/products/3281ce38-87a7-488e-a113-9a6b2f616908/relationships/CRP_test2/products",
            "CRP_you-may-also-like":
              "/catalog/products/3281ce38-87a7-488e-a113-9a6b2f616908/relationships/CRP_you-may-also-like/products",
          },
        },
        files: {
          data: [
            {
              created_at: "2023-03-14T16:40:00.905Z",
              id: "f85af602-16fa-41e0-a327-6cd47880b07e",
              type: "file",
            },
            {
              created_at: "2025-08-06T10:41:26.437Z",
              id: "a49b62dd-bda4-4254-bc01-75d4a3cb9093",
              type: "file",
            },
          ],
        },
        main_image: {
          data: {
            id: "f85af602-16fa-41e0-a327-6cd47880b07e",
            type: "main_image",
          },
        },
      },
    },
  } as Item

  const currency = {
    id: "6b0d5184-27f6-432d-a394-b3901ace171b",
    type: "currency",
    code: "USD",
    exchange_rate: 1,
    format: "${price}",
    decimal_point: ".",
    thousand_separator: ",",
    decimal_places: 2,
    default: true,
    enabled: true,
    links: {
      self: "https://epcc-integration.global.ssl.fastly.net/currencies/6b0d5184-27f6-432d-a394-b3901ace171b",
    },
    meta: {
      timestamps: {
        created_at: "2023-03-01T11:36:53.686Z",
        updated_at: "2023-03-01T11:36:53.686Z",
      },
      owner: "store",
    },
  } as ResponseCurrency

  test("calculateMultiItemOriginalTotal should return the correct value", () => {
    expect(calculateMultiItemOriginalTotal(item as Item)).toEqual(3800)
  })

  test("calculateSaleAmount should return the correct value", () => {
    expect(calculateSaleAmount(item as Item)).toEqual(-1000)
  })

  test("calculateTotalSavings should return the correct value", () => {
    expect(calculateTotalSavings(item as Item)).toEqual(-1406)
  })

  test("getFormattedValue should return the correct value", () => {
    expect(getFormattedValue(1234, currency as ResponseCurrency)).toEqual("$12.34")
  })

  test("getFormattedPercentage should return the correct value", () => {
    expect(getFormattedPercentage(10, 100)).toEqual("10%")
  })
});
