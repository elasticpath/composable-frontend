import { describe, expect, test } from "vitest"
import {
  createStoreShapeErrorPath,
  parseStoreShapeProblems,
  searchReturnPath,
  storeShapeProblemsFromPasswordProfileError,
  storeShapeProblemsFromSearchError,
  storeShapeRequirement,
} from "./search-store-shape"

const RANGE = "shopper_attributes.range"

const searchNotEnabled = {
  errors: [
    {
      status: "400",
      title: "Search Not Enabled",
      detail: "search not enabled for supplied context",
    },
  ],
}

const notFacetable = (field: string) => ({
  errors: [
    {
      status: "400",
      title: "Validation Error",
      detail: `Could not find a facet field named '${field}' or faceting is not enabled for the field`,
    },
  ],
})

describe("storeShapeProblemsFromSearchError", () => {
  test("reads search not enabled for the shopper's store or catalog", () => {
    expect(storeShapeProblemsFromSearchError(searchNotEnabled, RANGE)).toEqual([
      "search-not-enabled",
    ])
  })

  test("reads the configured taxonomy field as not facetable", () => {
    expect(
      storeShapeProblemsFromSearchError(notFacetable(RANGE), RANGE),
    ).toEqual(["taxonomy-field-not-facetable"])
  })

  test("ignores a facet error about a field other than the configured one", () => {
    expect(
      storeShapeProblemsFromSearchError(
        notFacetable("meta.search.nodes.name"),
        RANGE,
      ),
    ).toEqual([])
  })

  test("ignores a facet error when no taxonomy field is configured", () => {
    expect(storeShapeProblemsFromSearchError(notFacetable(RANGE))).toEqual([])
  })

  test.each([
    [
      "a server error",
      { errors: [{ status: "500", title: "Internal Server Error" }] },
    ],
    ["a thrown request", new TypeError("fetch failed")],
    ["an empty body", undefined],
    ["a body with no errors array", { message: "nope" }],
  ])("finds nothing to report in %s", (_, error) => {
    expect(storeShapeProblemsFromSearchError(error, RANGE)).toEqual([])
  })
})

describe("storeShapeProblemsFromPasswordProfileError", () => {
  test("reads a password profile ID the store does not have", () => {
    expect(
      storeShapeProblemsFromPasswordProfileError({
        errors: [
          {
            status: "404",
            title: "Password Profile not found",
            detail: "The requested password profile does not exist",
          },
        ],
      }),
    ).toEqual(["password-profile-not-found"])
  })

  test("reads a password profile ID that is not a valid ID at all", () => {
    expect(
      storeShapeProblemsFromPasswordProfileError({
        errors: [{ status: "422", title: "Constraint violation" }],
      }),
    ).toEqual(["password-profile-not-found"])
  })

  test.each([
    [
      "a server error",
      { errors: [{ status: "500", title: "Internal Server Error" }] },
    ],
    [
      "a forbidden answer",
      { errors: [{ status: "403", title: "Forbidden" }] },
    ],
    ["a thrown request", new TypeError("fetch failed")],
    ["an empty body", undefined],
  ])("finds nothing to report in %s", (_, error) => {
    expect(storeShapeProblemsFromPasswordProfileError(error)).toEqual([])
  })
})

describe("storeShapeRequirement", () => {
  test("names both manual steps when search is not enabled", () => {
    const { name, remedy } = storeShapeRequirement("search-not-enabled")

    expect(name).toMatch(/search/i)
    expect(remedy).toMatch(/store/i)
    expect(remedy).toMatch(/catalog/i)
    expect(remedy).toMatch(/publish/i)
  })

  test("names the field and the provisioning script when it is not facetable", () => {
    const { name, remedy } = storeShapeRequirement(
      "taxonomy-field-not-facetable",
      RANGE,
    )

    expect(name).toContain(RANGE)
    expect(remedy).toContain("pnpm provision:search-facet")
  })
})

describe("storeShapeRequirement for a missing password profile", () => {
  test("names the variable and tells the developer how to find a valid ID", () => {
    const { name, remedy } = storeShapeRequirement("password-profile-not-found")

    expect(name).toContain("NEXT_PUBLIC_PASSWORD_PROFILE_ID")
    expect(remedy).toMatch(/password profile/i)
    expect(remedy).toMatch(/rebuild/i)
  })
})

describe("parseStoreShapeProblems", () => {
  test("reads one or many problems off the query string", () => {
    expect(parseStoreShapeProblems("search-not-enabled")).toEqual([
      "search-not-enabled",
    ])
    expect(
      parseStoreShapeProblems([
        "search-not-enabled",
        "taxonomy-field-not-facetable",
      ]),
    ).toEqual(["search-not-enabled", "taxonomy-field-not-facetable"])
  })

  test("reads the password profile problem off the query string", () => {
    expect(parseStoreShapeProblems("password-profile-not-found")).toEqual([
      "password-profile-not-found",
    ])
  })

  test("drops values that are not a known problem", () => {
    expect(parseStoreShapeProblems(["<script>", "search-not-enabled"])).toEqual(
      ["search-not-enabled"],
    )
    expect(parseStoreShapeProblems(undefined)).toEqual([])
  })
})

describe("createStoreShapeErrorPath", () => {
  test("points at the localised configuration page and round-trips the problems", () => {
    const path = createStoreShapeErrorPath(
      "en",
      ["taxonomy-field-not-facetable"],
      "/search",
    )
    const url = new URL(path, "https://example.com")

    expect(url.pathname).toBe("/en/configuration-error")
    expect(
      parseStoreShapeProblems(url.searchParams.getAll("store-shape")),
    ).toEqual(["taxonomy-field-not-facetable"])
    expect(url.searchParams.get("from")).toBe("/search")
  })
})

describe("searchReturnPath", () => {
  test("returns to the search root with no category or query", () => {
    expect(searchReturnPath(undefined, {})).toBe("/search")
  })

  test("returns to the category path and the shopper's query", () => {
    expect(
      searchReturnPath(["Shoes & Boots", "Trail"], {
        q: "boot",
        "taxonomy[0]": "Outdoor",
        empty: undefined,
      }),
    ).toBe("/search/Shoes%20%26%20Boots/Trail?q=boot&taxonomy%5B0%5D=Outdoor")
  })

  test("keeps every value of a repeated parameter", () => {
    expect(searchReturnPath(undefined, { taxonomy: ["a", "b"] })).toBe(
      "/search?taxonomy=a&taxonomy=b",
    )
  })
})
