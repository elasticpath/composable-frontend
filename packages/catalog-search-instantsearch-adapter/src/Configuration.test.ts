import { describe, it, expect, vi } from "vitest"
import { Configuration } from "./Configuration"
import { client } from "@epcc-sdk/sdks-shopper"

// Mock a shopper client for testing purposes
vi.mock("@epcc-sdk/sdks-shopper", () => {
  const actual = vi.importActual("@epcc-sdk/sdks-shopper")
  return {
    ...actual,
    client: {
      setConfig: vi.fn(),
    },
  }
})

describe("Configuration", () => {
  describe("constructor", () => {
    describe("union parameter", () => {
      it("defaults union to false when not provided", () => {
        const subject = new Configuration({})
        expect(subject.union).toBe(false)
      })

      it("sets union to true when explicitly provided", () => {
        const subject = new Configuration({
          union: true,
          additionalSearchParameters: {
            query_by: "name",
          },
        })
        expect(subject.union).toBe(true)
      })

      it("sets union to false when explicitly provided as false", () => {
        const subject = new Configuration({
          union: false,
          additionalSearchParameters: {
            query_by: "name",
          },
        })
        expect(subject.union).toBe(false)
      })

      it("handles truthy values for union", () => {
        const subject = new Configuration({
          union: true,
          additionalSearchParameters: {
            query_by: "name",
          },
        })
        expect(subject.union).toBe(true)
      })
    })
  })

  describe(".validate", () => {
    describe("using query_by", () => {
      it("throws an error if query_by or preset is not set anywhere", () => {
        const subject = new Configuration({})

        expect(() => {
          subject.validate()
        }).toThrow(/Missing parameter/)
      })
      it("does not throw an error if query_by is set in additionalSearchParameters", () => {
        const subject = new Configuration({
          client,
          additionalSearchParameters: {
            query_by: "name",
          },
        })

        expect(() => {
          subject.validate()
        }).not.toThrow()
      })
      it("throws an error if query_by is not set in all collectionSpecificSearchParameters", () => {
        const subject = new Configuration({
          collectionSpecificSearchParameters: {
            collection1: {},
            collection2: {
              query_by: "name",
            },
          },
        })

        expect(() => {
          subject.validate()
        }).toThrow(/Missing parameter/)
      })
      it("does not throw an error if query_by set in all collectionSpecificSearchParameters", () => {
        const subject = new Configuration({
          client,
          collectionSpecificSearchParameters: {
            collection1: {
              query_by: "title",
            },
            collection2: {
              query_by: "name",
            },
          },
        })

        expect(() => {
          subject.validate()
        }).not.toThrow()
      })
      it("does not throw an error if preset is set in additionalSearchParameters", () => {
        const subject = new Configuration({
          client,
          additionalSearchParameters: {
            preset: "listing_view",
          },
        })

        expect(() => {
          subject.validate()
        }).not.toThrow()
      })
      it("does not throw an error if preset or query_by is set in all collectionSpecificSearchParameters", () => {
        const subject = new Configuration({
          client,
          collectionSpecificSearchParameters: {
            collection1: {
              preset: "listing_view_1",
            },
            collection2: {
              query_by: "name",
            },
          },
        })

        expect(() => {
          subject.validate()
        }).not.toThrow()
      })
      it("does not throw an error if preset is set in all collectionSpecificSearchParameters", () => {
        const subject = new Configuration({
          client,
          collectionSpecificSearchParameters: {
            collection1: {
              preset: "listing_view_1",
            },
            collection2: {
              preset: "listing_view_2",
            },
          },
        })

        expect(() => {
          subject.validate()
        }).not.toThrow()
      })
    })
  })
})
