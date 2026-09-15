import { describe, test, expect } from "vitest"
import {
  INDEX_NAME,
  INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  resolveInstantSearchRouting,
} from "./instantsearch-routing"

const SORT_BY = `${INDEX_NAME}/sort/price.USD.float_price:asc`
const HIERARCHICAL_ATTRIBUTE = INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES[0]!

const qsModule = {
  stringify(params: Record<string, string | string[]>) {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((entry, index) => search.append(`${key}[${index}]`, entry))
      } else {
        search.append(key, String(value))
      }
    }
    return search.toString()
  },
}

function routingFor(lang?: string) {
  const routing = resolveInstantSearchRouting(lang, "USD")
  const router = routing.router!
  const stateMapping = routing.stateMapping!

  return {
    parseURL: (url: string) =>
      router.parseURL!({ location: new URL(url) } as any),
    createURL: (url: string, routeState: Record<string, unknown>) =>
      new URL(
        router.createURL!({
          qsModule,
          routeState,
          location: new URL(url),
        } as any),
      ),
    routeToState: (routeState: Record<string, unknown>) =>
      stateMapping.routeToState!(routeState as any) as any,
    stateToRoute: (uiState: Record<string, unknown>) =>
      stateMapping.stateToRoute!(uiState as any),
  }
}

describe("instantsearch routing sort order", () => {
  test("routes the sort order out of the index ui state", () => {
    const routeState = routingFor().stateToRoute({
      [INDEX_NAME]: { query: "boot", sortBy: SORT_BY },
    })

    expect(routeState.sortBy).toBe(SORT_BY)
  })

  test("routes the sort order back into the index ui state", () => {
    const uiState = routingFor().routeToState({ q: "boot", sortBy: SORT_BY })

    expect(uiState[INDEX_NAME].sortBy).toBe(SORT_BY)
  })

  test("leaves sortBy off the ui state when the url has no sort order", () => {
    const uiState = routingFor().routeToState({ q: "boot" })

    expect(uiState[INDEX_NAME]).not.toHaveProperty("sortBy")
  })

  test("reads the sort order back off a shared url", () => {
    const routeState = routingFor().parseURL(
      `https://example.com/search?q=boot&sortBy=${encodeURIComponent(SORT_BY)}`,
    )

    expect(routeState.sortBy).toBe(SORT_BY)
  })

  test("writes the sort order into the url", () => {
    const url = routingFor().createURL("https://example.com/search", {
      q: "boot",
      sortBy: SORT_BY,
    })

    expect(url.searchParams.get("sortBy")).toBe(SORT_BY)
  })

  test("keeps the sort order when the shopper changes category", () => {
    const url = routingFor().createURL(
      `https://example.com/search/Shoes?q=boot&sortBy=${encodeURIComponent(SORT_BY)}`,
      { node: ["Shoes", "Trainers"] },
    )

    expect(url.pathname).toBe("/search/Shoes/Trainers")
    expect(url.searchParams.get("sortBy")).toBe(SORT_BY)
  })

  test("round trips the sort order through a localised url", () => {
    const routing = routingFor("en")
    const routeState = routing.parseURL(
      `https://example.com/en/search?sortBy=${encodeURIComponent(SORT_BY)}`,
    )
    const uiState = routing.routeToState(routeState)

    expect(uiState[INDEX_NAME].sortBy).toBe(SORT_BY)
    expect(routing.stateToRoute(uiState).sortBy).toBe(SORT_BY)
  })

  test("still routes the category path alongside the sort order", () => {
    const uiState = routingFor().routeToState({
      node: ["Shoes"],
      sortBy: SORT_BY,
    })

    expect(uiState[INDEX_NAME].hierarchicalMenu).toEqual({
      [HIERARCHICAL_ATTRIBUTE]: ["Shoes"],
    })
    expect(uiState[INDEX_NAME].sortBy).toBe(SORT_BY)
  })
})
