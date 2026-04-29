import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import CatalogSearchInstantSearchAdapter from "./CatalogSearchInstantSearchAdapter"

// Mock the SDK so we can return a synthetic response shape per test.
vi.mock("@epcc-sdk/sdks-shopper", () => {
  return {
    client: { setConfig: vi.fn() },
    postMultiSearch: vi.fn(),
  }
})

import { postMultiSearch } from "@epcc-sdk/sdks-shopper"
const postMultiSearchMock = postMultiSearch as unknown as ReturnType<typeof vi.fn>

const buildResponse = (overrides: any = {}) => ({
  data: {
    results: [
      {
        found: 1,
        hits: [
          {
            document: {
              id: "p1",
              relationships: {
                main_image: { data: { id: "img-1", type: "main_image" } },
              },
            },
            highlights: [],
            highlight: {},
          },
        ],
        page: 1,
        request_params: { q: "*", per_page: 10 },
        search_time_ms: 1,
      },
    ],
    ...overrides,
  },
  error: undefined,
})

describe("CatalogSearchInstantSearchAdapter", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    postMultiSearchMock.mockReset()
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  describe("included-block warn-once", () => {
    it("logs console.warn exactly once when include is configured but the response lacks an included block, even across multiple search calls", async () => {
      // Response has hits + relationships but no top-level `included`.
      postMultiSearchMock.mockResolvedValue(buildResponse())

      const adapter = new CatalogSearchInstantSearchAdapter({
        client: { setConfig: () => {} } as any,
        additionalSearchParameters: { query_by: "name" },
        include: ["main_image"],
      } as any)

      await adapter.searchClient.search([
        { indexName: "products", params: { query: "*" } },
      ])
      await adapter.searchClient.search([
        { indexName: "products", params: { query: "leather" } },
      ])

      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it("does not warn when include is configured AND the response carries an included block (even if empty for the requested resource)", async () => {
      postMultiSearchMock.mockResolvedValue(
        buildResponse({ included: {} }),
      )

      const adapter = new CatalogSearchInstantSearchAdapter({
        client: { setConfig: () => {} } as any,
        additionalSearchParameters: { query_by: "name" },
        include: ["main_image"],
      } as any)

      await adapter.searchClient.search([
        { indexName: "products", params: { query: "*" } },
      ])

      expect(warnSpy).not.toHaveBeenCalled()
    })

    it("does not warn when include is not configured, regardless of the response shape", async () => {
      postMultiSearchMock.mockResolvedValue(buildResponse())

      const adapter = new CatalogSearchInstantSearchAdapter({
        client: { setConfig: () => {} } as any,
        additionalSearchParameters: { query_by: "name" },
      } as any)

      await adapter.searchClient.search([
        { indexName: "products", params: { query: "*" } },
      ])

      expect(warnSpy).not.toHaveBeenCalled()
    })
  })
})
