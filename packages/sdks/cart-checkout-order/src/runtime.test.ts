import { describe, expect, it, vi } from "vitest"
import { createCartCheckoutOrderClient, getShippingGroupById } from "./index"
import type {
  AddCustomDiscountToCartItemData,
  BulkAddTaxItemsToCartData,
  UpdateCustomDiscountForCartData,
} from "./index"
import {
  zAddCustomDiscountToCartItemBody,
  zAddTaxItemToCartItemComponentResponse,
  zBulkAddTaxItemsToCartBody,
  zGetShippingGroupByIdResponse,
  zUpdateCustomDiscountForCartBody,
} from "./zod"

const shippingGroupFromTheSpecExample = {
  data: {
    id: "7cfa5b07-092e-4dbe-bbad-55a771a34117",
    type: "shipping_group",
    relation: "cart",
    cart_id: "96b1d104-0d2e-41fd-9543-6c3c5a698959",
    shipping_type: "standard",
    tracking_reference: "TRACK123",
    address: {
      first_name: "John",
      last_name: "Doe",
      phone_number: "(555) 555-1234",
      company_name: "ACME Corp",
      line_1: "123 Main St",
      line_2: "Suite 100",
      city: "Portland",
      postcode: "97201",
      county: "Multnomah",
      country: "US",
      region: "Oregon",
      instructions: "Leave at front door",
    },
    delivery_estimate: {
      start: "2024-01-15T00:00:00Z",
      end: "2024-01-20T00:00:00Z",
    },
    meta: {
      shipping_display_price: {
        total: { amount: 1000, currency: "USD", formatted: "$10.00" },
        base: { amount: 800, currency: "USD", formatted: "$8.00" },
        tax: { amount: 200, currency: "USD", formatted: "$2.00" },
        fees: { amount: 0, currency: "USD", formatted: "$0.00" },
      },
    },
  },
}

const baseUrl = "https://useast.api.elasticpath.com"
const cartId = "96b1d104-0d2e-41fd-9543-6c3c5a698959"
const shippingGroupId = "7cfa5b07-092e-4dbe-bbad-55a771a34117"
const shippingGroupPath = { cartId, shippingGroupId }

function stubFetch(...statuses: number[]) {
  const requests: Request[] = []
  const transport = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const request =
        input instanceof Request && init === undefined
          ? input
          : new Request(input, init)
      requests.push(request)
      const status =
        statuses[Math.min(requests.length - 1, statuses.length - 1)]!
      return new Response(
        status === 200 ? JSON.stringify(shippingGroupFromTheSpecExample) : "{}",
        { status, headers: { "Content-Type": "application/json" } },
      )
    },
  ) as unknown as typeof fetch
  return { requests, transport }
}

describe("createCartCheckoutOrderClient", () => {
  it("sends getShippingGroupById to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createCartCheckoutOrderClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await getShippingGroupById({
      client,
      path: shippingGroupPath,
    })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(
      `${baseUrl}/v2/carts/${cartId}/shipping-groups/${shippingGroupId}`,
    )
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(shippingGroupFromTheSpecExample)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createCartCheckoutOrderClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await getShippingGroupById({
      client,
      path: shippingGroupPath,
    })

    expect(requests.map((r) => r.headers.get("Authorization"))).toEqual([
      "Bearer token-1",
      "Bearer token-2",
    ])
    expect(response?.status).toBe(200)
    expect(data).toEqual(shippingGroupFromTheSpecExample)
  })
})

describe("the shared client", () => {
  it("sends an operation called without a client to EU West", async () => {
    const { requests, transport } = stubFetch(200)

    await getShippingGroupById({ path: shippingGroupPath, fetch: transport })

    expect(requests[0]!.url).toBe(
      `https://euwest.api.elasticpath.com/v2/carts/${cartId}/shipping-groups/${shippingGroupId}`,
    )
  })
})

describe("the /zod entry", () => {
  it("parses the getShippingGroupById response and rejects a delivery estimate start that is not a date-time string", () => {
    expect(
      zGetShippingGroupByIdResponse.parse(shippingGroupFromTheSpecExample),
    ).toEqual(shippingGroupFromTheSpecExample)

    const { data } = shippingGroupFromTheSpecExample
    const tampered = {
      data: {
        ...data,
        delivery_estimate: { ...data.delivery_estimate, start: 1705276800000 },
      },
    }
    expect(zGetShippingGroupByIdResponse.safeParse(tampered).success).toBe(
      false,
    )
  })

  it("keeps the tax item response typed", () => {
    const taxItem = {
      data: {
        id: "4f4e6d37-8c8c-4a1a-b8a3-6cd2efab12de",
        type: "tax_item",
        code: "VAT",
        jurisdiction: "UK",
        name: "Value Added Tax",
        rate: 0.2,
      },
    }

    expect(zAddTaxItemToCartItemComponentResponse.parse(taxItem)).toEqual(
      taxItem,
    )
    const tampered = { data: { ...taxItem.data, rate: "0.2" } }
    expect(
      zAddTaxItemToCartItemComponentResponse.safeParse(tampered).success,
    ).toBe(false)
  })

  it("keeps meta.component_product_id on a bulk tax item, which targets a bundle component", () => {
    const body: BulkAddTaxItemsToCartData["body"] = {
      data: [
        {
          type: "tax_item",
          code: "GST",
          name: "Goods and Services Tax",
          jurisdiction: "AU",
          rate: 0.1,
          meta: {
            component_product_id: "12345678-1234-5678-9012-123456789012",
          },
          relationships: {
            item: {
              data: {
                type: "cart_item",
                id: "22223333-4444-5555-6666-777788889999",
              },
            },
          },
        },
      ],
      options: { add_all_or_nothing: false },
    }

    expect(zBulkAddTaxItemsToCartBody.parse(body)).toEqual(body)
  })

  it("takes a custom discount update amount as a negative whole number, the only form the service accepts", () => {
    const body: UpdateCustomDiscountForCartData["body"] = {
      data: { type: "custom_discount", amount: -150 },
    }

    expect(zUpdateCustomDiscountForCartBody.parse(body)).toEqual(body)
    expect(
      zUpdateCustomDiscountForCartBody.safeParse({
        data: {
          type: "custom_discount",
          amount: { amount: -150, currency: "USD", formatted: "-$1.50" },
        },
      }).success,
    ).toBe(false)
  })

  it("wraps a cart item custom discount in data, which the service requires", () => {
    const discount = {
      type: "custom_discount" as const,
      amount: -150,
      description: "Loyalty discount",
      discount_code: "loyalty",
      discount_engine: "Custom Discount Engine",
      external_id: "loyalty-discount",
    }
    const body: AddCustomDiscountToCartItemData["body"] = { data: discount }

    expect(zAddCustomDiscountToCartItemBody.parse(body)).toEqual(body)
    expect(zAddCustomDiscountToCartItemBody.safeParse(discount).success).toBe(
      false,
    )
  })
})
