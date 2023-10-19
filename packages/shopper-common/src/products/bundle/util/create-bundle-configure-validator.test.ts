import { describe, expect, test } from "vitest"
import {
  BundleComponents,
  BundleConfigurationSelectedOptions,
} from "../bundle.types"
import {
  createBundleConfigureValidator,
  validatePropertyCount,
} from "./create-bundle-configure-validator"
import { DeepPartial } from "../../../shared/types/deep-partial"

describe("validation-schema", () => {
  test("createBundleConfigureValidator valid", () => {
    const bundleComponents: DeepPartial<BundleComponents> = {
      plants: {
        max: 1,
        min: 1,
        name: "Plants",
        options: [
          {
            id: "a158ffa0-5d16-4325-8dcc-be8acd55eecf",
            quantity: 1,
            type: "product",
          },
        ],
        sort_order: 1,
      },
      pots: {
        max: 1,
        min: 1,
        name: "Pots",
        options: [
          {
            id: "fc520b37-a709-4032-99b3-8d4ecc990027",
            quantity: 1,
            type: "product",
          },
          {
            id: "28c13338-07f8-4e40-85b0-e85c0917fb28",
            quantity: 1,
            type: "product",
          },
        ],
        sort_order: 2,
      },
      tools: {
        max: 1,
        min: 0,
        name: "Tools",
        options: [
          {
            id: "7ffe107d-c5bd-4de4-b8f0-a58d90cb3cd3",
            quantity: 1,
            type: "product",
          },
        ],
        sort_order: 3,
      },
    }

    const validData: BundleConfigurationSelectedOptions = {
      plants: {
        "a158ffa0-5d16-4325-8dcc-be8acd55eecf": 1,
      },
      pots: { "fc520b37-a709-4032-99b3-8d4ecc990027": 1 },
      tools: {},
    }

    const result = createBundleConfigureValidator(
      bundleComponents as BundleComponents,
    )(validData)

    expect(result).toEqual({
      success: true,
      result: validData,
    })
  })

  test("createBundleConfigureValidator with invalid min max values", () => {
    const bundleComponents: DeepPartial<BundleComponents> = {
      plants: {
        max: 1,
        min: 1,
        name: "Plants",
        options: [
          {
            id: "a158ffa0-5d16-4325-8dcc-be8acd55eecf",
            quantity: 1,
            type: "product",
          },
        ],
        sort_order: 1,
      },
      pots: {
        max: 1,
        min: 1,
        name: "Pots",
        options: [
          {
            id: "fc520b37-a709-4032-99b3-8d4ecc990027",
            quantity: 1,
            type: "product",
          },
          {
            id: "28c13338-07f8-4e40-85b0-e85c0917fb28",
            quantity: 1,
            type: "product",
          },
        ],
        sort_order: 2,
      },
      tools: {
        max: 1,
        min: 0,
        name: "Tools",
        options: [
          {
            id: "7ffe107d-c5bd-4de4-b8f0-a58d90cb3cd3",
            quantity: 1,
            type: "product",
          },
        ],
        sort_order: 3,
      },
    }

    const invalidData: BundleConfigurationSelectedOptions = {
      plants: {
        "a158ffa0-5d16-4325-8dcc-be8acd55eecf": 1,
        "awdawdawdaw-awdawjnawd-awdauunwda": 1,
      },
      pots: {},
      tools: {},
    }

    const result = createBundleConfigureValidator(
      bundleComponents as BundleComponents,
    )(invalidData)

    expect(result).toEqual({
      success: false,
      errors: [
        {
          check: "max",
          error: "Property count is greater than the maximum value",
          name: "plants",
        },
        {
          check: "min",
          error: "Property count is less than the minimum value",
          name: "pots",
        },
      ],
    })
  })

  describe("validatePropertyCount", () => {
    test("should return true if the property count is within the valid range", () => {
      const obj = {
        a: 1,
        b: 2,
        c: 3,
      }
      expect(validatePropertyCount(obj, 1, 5)).toEqual({
        success: true,
        name: "property-count",
      })
    })

    test("should return false if the property count is less than the minimum value", () => {
      const obj = {
        a: 1,
      }
      expect(validatePropertyCount(obj, 2, 5)).toEqual({
        success: false,
        check: "min",
        error: "Property count is less than the minimum value",
        name: "property-count",
      })
    })

    test("should return false if the property count is greater than the maximum value", () => {
      const obj = {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 5,
      }
      expect(validatePropertyCount(obj, 1, 3)).toEqual({
        success: false,
        check: "max",
        error: "Property count is greater than the maximum value",
        name: "property-count",
      })
    })

    test("should return true if the minimum and maximum values are undefined", () => {
      const obj = {
        a: 1,
        b: 2,
        c: 3,
      }
      expect(validatePropertyCount(obj, undefined, undefined)).toEqual({
        success: true,
        name: "property-count",
      })
    })

    test("should return true if the object has zero properties and the minimum value is set to zero", () => {
      const obj = {}
      expect(validatePropertyCount(obj, 0, 5)).toEqual({
        success: true,
        name: "property-count",
      })
    })

    test("should return true if the object has zero properties and both the minimum and maximum values are undefined", () => {
      const obj = {}
      expect(validatePropertyCount(obj, undefined, undefined)).toEqual({
        success: true,
        name: "property-count",
      })
    })
  })
})
