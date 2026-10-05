import { describe, expect, test, vi } from "vitest"
import { emptyResultsOnServerFailure } from "./empty-results-on-server-failure"

const requests = [
  { indexName: "search", params: { query: "boot" } },
  { indexName: "search", params: { query: "boot", hitsPerPage: 0 } },
]

function searchClientThat(search: (requests: unknown[]) => Promise<unknown>) {
  return { search: vi.fn(search), searchForFacetValues: vi.fn() }
}

const failing = () =>
  searchClientThat(async () => {
    throw new Error("No results returned")
  })

describe("emptyResultsOnServerFailure", () => {
  test("passes a successful search through untouched", async () => {
    const response = { results: [{ hits: [{ objectID: "1" }] }] }
    const client = emptyResultsOnServerFailure(
      searchClientThat(async () => response),
      true,
    )

    await expect(client.search(requests)).resolves.toBe(response)
  })

  test("answers a failed server render with one empty result per request, so the render can finish", async () => {
    const client = emptyResultsOnServerFailure(failing(), true)

    const { results } = (await client.search(requests)) as {
      results: unknown[]
    }

    expect(results).toHaveLength(2)
    expect(results[0]).toMatchObject({
      hits: [],
      nbHits: 0,
      nbPages: 0,
      page: 0,
      index: "search",
      query: "boot",
    })
  })

  test("still rejects in the browser, where InstantSearch reports the error", async () => {
    const client = emptyResultsOnServerFailure(failing(), false)

    await expect(client.search(requests)).rejects.toThrow("No results returned")
  })

  test("keeps the client's other methods", () => {
    const original = searchClientThat(async () => ({}))
    const client = emptyResultsOnServerFailure(original, true)

    expect(client.searchForFacetValues).toBe(original.searchForFacetValues)
  })
})
