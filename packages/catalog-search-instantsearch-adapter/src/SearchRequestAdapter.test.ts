import { describe, it, expect, vi, beforeEach } from "vitest"
import { SearchRequestAdapter } from "./SearchRequestAdapter"
import { Configuration } from "./Configuration"
import { client } from "@epcc-sdk/sdks-shopper"

// Mock the shopper client for testing purposes
vi.mock("@epcc-sdk/sdks-shopper", () => {
  const actual = vi.importActual("@epcc-sdk/sdks-shopper")
  return {
    ...actual,
    client: {
      setConfig: vi.fn(),
    },
    postMultiSearch: vi.fn().mockResolvedValue({
      data: { results: [] },
      error: null,
    }),
  }
})

// Import the mocked function
import { postMultiSearch } from "@epcc-sdk/sdks-shopper"

describe("SearchRequestAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("._buildSearchParameters", () => {
    describe("when sortByOptions are provided", () => {
      it("adapts the given search parameters ", () => {
        // With no sort order
        let subject = new SearchRequestAdapter(
          [],
          client,
          new Configuration({
            sortByOptions: {
              "field1:desc": { enable_overrides: false } as any,
            },
            collectionSpecificSortByOptions: {
              collection2: {
                "field2:asc": { enable_overrides: false } as any,
              },
            },
          }),
        )
        let result = subject._buildSearchParameters({
          indexName: "collection1",
          params: {},
        })
        expect(result).toEqual({
          type: "collection1",
          page: 1,
          q: "*",
        })

        // With a matching sort order
        subject = new SearchRequestAdapter(
          [],
          client,
          new Configuration({
            sortByOptions: {
              "field1:desc": { enable_overrides: false } as any,
            },
            collectionSpecificSortByOptions: {
              collection2: {
                "field2:asc": { enable_overrides: false } as any,
              },
            },
          }),
        )
        result = subject._buildSearchParameters({
          indexName: "collection1/sort/field1:desc",
          params: {},
        })
        expect(result).toEqual({
          type: "collection1",
          page: 1,
          q: "*",
          sort_by: "field1:desc",
          enable_overrides: false,
        })

        // With a matching sort order, with federated search
        subject = new SearchRequestAdapter(
          [],
          client,
          new Configuration({
            sortByOptions: {
              "field1:desc": { enable_overrides: false } as any,
            },
            collectionSpecificSortByOptions: {
              collection2: {
                "field2:asc": { enable_overrides: false } as any,
              },
            },
          }),
        )
        result = subject._buildSearchParameters({
          indexName: "collection2/sort/field2:asc",
          params: {},
        })
        expect(result).toEqual({
          type: "collection2",
          page: 1,
          q: "*",
          sort_by: "field2:asc",
          enable_overrides: false,
        })

        //with an override tag
        result = subject._buildSearchParameters({
          indexName: "collection2",
          params: { ruleContexts: ["context1", "context2"] },
        })
        expect(result).toEqual({
          type: "collection2",
          page: 1,
          q: "*",
          override_tags: "context1,context2",
        })
      })
    })
  })

  describe("._adaptNumericFilters", () => {
    describe("when the fieldName doesn't have any numeric operator special characters", () => {
      it("adapts the given numeric filters", () => {
        const subject = new SearchRequestAdapter(
          [],
          client,
          new Configuration({}),
        )

        const result = subject._adaptNumericFilters([
          "field1<=634",
          "field1>=289",
          "field2<=5",
          "field3>=3",
          "field4:with:colon.and.dot:<=3",
        ])
        expect(result).toEqual(
          "field1:=[289..634] && field2:<=5 && field3:>=3 && field4:with:colon.and.dot::<=3",
        )
      })
    })

    describe("when the fieldName has numeric operator special characters", () => {
      it("adapts the given numeric filters, given an additional facetableFieldsWithSpecialCharacters configuration", () => {
        const subject = new SearchRequestAdapter(
          [],
          client,
          new Configuration({
            facetableFieldsWithSpecialCharacters: [
              "field4>numeric-special=characters:and:colon",
            ],
          }),
        )

        const result = subject._adaptNumericFilters([
          "field1<=634",
          "field1>=289",
          "field2<=5",
          "field3>=3",
          "field4>numeric-special=characters:and:colon<=3",
        ])
        expect(result).toEqual(
          "field1:=[289..634] && field2:<=5 && field3:>=3 && field4>numeric-special=characters:and:colon:<=3",
        )
      })
    })
  })

  describe("._adaptFacetFilters", () => {
    describe("when the fieldName only has colons in the facet name", () => {
      it("adapts the given facet filters", () => {
        const subject = new SearchRequestAdapter(
          [],
          client,
          new Configuration({}),
        )

        const result = subject._adaptFacetFilters(
          [
            ["field1:value1", "field1:value2"],
            "field2:with:colons:value3",
            "field2:with:colons:value4",
          ],
          "collection1",
        )
        expect(result).toEqual(
          "field1:=[`value1`,`value2`] && field2:with:colons:=[`value3`] && field2:with:colons:=[`value4`]",
        )
      })
    })
    describe("when the fieldName has colons in the facet value", () => {
      it("adapts the given facet filters, given a configuration called facetableFieldsWithSpecialCharacters ", () => {
        const subject = new SearchRequestAdapter(
          [],
          client,
          new Configuration({
            facetableFieldsWithSpecialCharacters: [
              "field3",
              "field4:with:colons",
            ],
          }),
        )

        const result = subject._adaptFacetFilters(
          [
            ["field1:value1", "field1:value2"],
            "field2:with:colons:value3",
            "field2:with:colons:value4",
            "field3:value5:with:colon",
            "field4:with:colons:value6:with:colon",
          ],
          "collection1",
        )
        expect(result).toEqual(
          "field1:=[`value1`,`value2`] && field2:with:colons:=[`value3`] && field2:with:colons:=[`value4`] && field3:=[`value5:with:colon`] && field4:with:colons:=[`value6:with:colon`]",
        )
      })
    })
    describe("when exactMatch is disabled", () => {
      it("adapts the given facet filters, given a configuration called filterByOptions ", () => {
        let subject = new SearchRequestAdapter(
          [],
          client,
          new Configuration({
            filterByOptions: {
              field1: { exactMatch: false } as any,
            },
            collectionSpecificFilterByOptions: {
              collection1: {
                field2: { exactMatch: false } as any,
                field4: { exactMatch: false } as any,
              },
            },
          }),
        )

        let result = subject._adaptFacetFilters(
          [
            ["field1:value1", "field1:value2"],
            "field2:value3",
            "field3:value4",
            "field4:-value5",
            "field4:-value6",
          ],
          "collection1",
        )
        expect(result).toEqual(
          "field1:[`value1`,`value2`] && field2:[`value3`] && field3:=[`value4`] && field4:![`value5`] && field4:![`value6`]",
        )

        // Check collection specific settings in more detail
        subject = new SearchRequestAdapter(
          [],
          client,
          new Configuration({
            filterByOptions: {
              field1: { exactMatch: false } as any,
            },
            collectionSpecificFilterByOptions: {
              collection1: {
                field2: { exactMatch: false } as any,
                field4: { exactMatch: false } as any,
              },
            },
          }),
        )

        result = subject._adaptFacetFilters(
          [
            ["field1:value1", "field1:value2"],
            "field2:value3",
            "field3:value4",
            "field4:-value5",
            "field4:-value6",
          ],
          "collection2",
        )
        expect(result).toEqual(
          "field1:[`value1`,`value2`] && field2:=[`value3`] && field3:=[`value4`] && field4:!=[`value5`] && field4:!=[`value6`]",
        )
      })
    })
  })

  describe(".adaptFacetBy", () => {
    it("adapts the given facet names, given a configuration called facetByOptions ", () => {
      const subject = new SearchRequestAdapter(
        [],
        client,
        new Configuration({
          facetByOptions: {
            field1: "(sort_by: _alpha:asc)",
          },
        }),
      )

      const result = subject._adaptFacetBy(["field1", "field2"], "collection1")
      expect(result).toEqual("field1(sort_by: _alpha:asc),field2")
    })

    it("adapts the given facet names, given a configuration called collectionSpecificFacetByOptions ", () => {
      const subject = new SearchRequestAdapter(
        [],
        client,
        new Configuration({
          facetByOptions: {
            field1: "(sort_by: _alpha:asc)",
          },
          collectionSpecificFacetByOptions: {
            collectionX: {
              field1: "(sort_by: _alpha:desc)",
            },
          },
        }),
      )

      const result = subject._adaptFacetBy(["field1", "field2"], "collectionX")
      expect(result).toEqual("field1(sort_by: _alpha:desc),field2")
    })
  })

  describe("._adaptGeoFilter", () => {
    it("adapts the given geo bounding box filter", () => {
      const subject = new SearchRequestAdapter(
        [],
        client,
        new Configuration({
          geoLocationField: "geoField",
        }),
      )

      let result = subject._adaptGeoFilter({ insideBoundingBox: "x1,y1,x2,y2" })
      expect(result).toEqual(`geoField:(x1, y1, x1, y2, x2, y2, x2, y1)`)

      result = subject._adaptGeoFilter({
        insideBoundingBox: ["x1", "y1", "x2", "y2"] as unknown as any,
      })
      expect(result).toEqual(`geoField:(x1, y1, x1, y2, x2, y2, x2, y1)`)
    })

    it("adapts the given geo aroundLatLng filter", () => {
      const subject = new SearchRequestAdapter(
        [],
        client,
        new Configuration({
          geoLocationField: "geoField",
        }),
      )

      expect(() => {
        subject._adaptGeoFilter({ aroundLatLng: "x1,y1" })
      }).toThrowError(
        "filtering around a lat/lng also requires a numerical radius",
      )

      expect(() => {
        subject._adaptGeoFilter({ aroundLatLng: "x1,y1", aroundRadius: "all" })
      }).toThrowError(
        "filtering around a lat/lng also requires a numerical radius",
      )

      const result = subject._adaptGeoFilter({
        aroundLatLng: "x1,y1",
        aroundRadius: 10000,
      })
      expect(result).toEqual(`geoField:(x1,y1, 10 km)`)
    })

    it("adapts the given geo polygon filter", () => {
      const subject = new SearchRequestAdapter(
        [],
        client,
        new Configuration({
          geoLocationField: "geoField",
        }),
      )

      const result = subject._adaptGeoFilter({
        insidePolygon: ["x1", "y1", "x2", "y2", "x3", "y3"] as unknown as any,
      })
      expect(result).toEqual(`geoField:(x1,y1,x2,y2,x3,y3)`)
    })
  })
  describe(". _adaptRulesContextsToOverrideTags", () => {
    it("concatenates the rule contexts to a comma separated string", () => {
      const subject = new SearchRequestAdapter(
        [],
        client,
        new Configuration({}),
      )

      const result = subject._adaptRulesContextsToOverrideTags([
        "context1",
        "context2",
      ])
      expect(result).toEqual("context1,context2")
    })
  })

  describe("request", () => {
    describe("union search functionality", () => {
      it("includes union parameter in multisearch request when union is true", async () => {
        const configuration = new Configuration({
          union: true,
          additionalSearchParameters: {
            query_by: "name",
          },
        })

        const instantsearchRequests = [
          {
            indexName: "products",
            params: { query: "test" },
          },
          {
            indexName: "brands",
            params: { query: "test" },
          },
        ]

        const subject = new SearchRequestAdapter(
          instantsearchRequests,
          client,
          configuration,
        )
        await subject.request()

        expect(postMultiSearch).toHaveBeenCalledWith({
          client,
          body: {
            union: true,
            searches: [
              {
                type: "products",
                q: "test",
                page: 1,
                query_by: "name",
                highlight_full_fields: "name",
              },
              {
                type: "brands",
                q: "test",
                page: 1,
                query_by: "name",
                highlight_full_fields: "name",
              },
            ],
          },
          headers: {},
          page: 1,
        })
      })

      it("does not include union parameter in multisearch request when union is false", async () => {
        const configuration = new Configuration({
          union: false,
          additionalSearchParameters: {
            query_by: "name",
          },
        })

        const instantsearchRequests = [
          {
            indexName: "products",
            params: { query: "test" },
          },
        ]

        const subject = new SearchRequestAdapter(
          instantsearchRequests,
          client,
          configuration,
        )
        await subject.request()

        expect(postMultiSearch).toHaveBeenCalledWith({
          client,
          body: {
            searches: [
              {
                type: "products",
                q: "test",
                page: 1,
                query_by: "name",
                highlight_full_fields: "name",
              },
            ],
          },
          headers: {},
        })
      })

      it("does not include union parameter in multisearch request when union is not configured", async () => {
        const configuration = new Configuration({
          additionalSearchParameters: {
            query_by: "name",
          },
        })

        const instantsearchRequests = [
          {
            indexName: "products",
            params: { query: "test" },
          },
        ]

        const subject = new SearchRequestAdapter(
          instantsearchRequests,
          client,
          configuration,
        )
        await subject.request()

        expect(postMultiSearch).toHaveBeenCalledWith({
          client,
          body: {
            searches: [
              {
                type: "products",
                q: "test",
                page: 1,
                query_by: "name",
                highlight_full_fields: "name",
              },
            ],
          },
          headers: {},
        })
      })

      it("includes union parameter with conversational search", async () => {
        const configuration = new Configuration({
          union: true,
          additionalSearchParameters: {
            query_by: "name",
          },
        })

        const instantsearchRequests = [
          {
            indexName: "products",
            params: { query: "test" },
          },
        ]

        // Mock a search parameter that includes conversation
        const subject = new SearchRequestAdapter(
          instantsearchRequests,
          client,
          configuration,
        )
        subject._buildSearchParameters = vi.fn().mockReturnValue({
          type: "products",
          q: "test",
          page: 1,
          query_by: "name",
          conversation: true,
          conversation_id: "conv_123",
          conversation_model_id: "model_456",
        })

        await subject.request()

        expect(postMultiSearch).toHaveBeenCalledWith({
          client,
          body: {
            union: true,
            searches: [
              {
                type: "products",
                page: 1,
                query_by: "name",
              },
            ],
          },
          headers: {},
          q: "test",
          conversation: true,
          conversation_id: "conv_123",
          conversation_model_id: "model_456",
          page: 1,
        })
      })

      it("handles truthy string values for union parameter", async () => {
        const configuration = new Configuration({
          union: "true" as any,
          additionalSearchParameters: {
            query_by: "name",
          },
        })

        const instantsearchRequests = [
          {
            indexName: "products",
            params: { query: "test" },
          },
        ]

        const subject = new SearchRequestAdapter(
          instantsearchRequests,
          client,
          configuration,
        )
        await subject.request()

        expect(postMultiSearch).toHaveBeenCalledWith({
          client,
          body: {
            union: "true",
            searches: [
              {
                type: "products",
                q: "test",
                page: 1,
                query_by: "name",
                highlight_full_fields: "name",
              },
            ],
          },
          headers: {},
          page: 1,
        })
      })
    })
  })
})
