import { describe, expect, test } from "vitest";
import { BundleComponents } from "@elasticpath/react-shopper-hooks";

import { createBundleFormSchema } from "./validation-schema";
import { DeepPartial } from "../../../lib/types/deep-partial";

describe("validation-schema", () => {
  test("createBundleFormSchema valid", () => {
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
    };

    const validData = {
      selectedOptions: {
        plants: ['{"a158ffa0-5d16-4325-8dcc-be8acd55eecf":1}'],
        pots: ['{"fc520b37-a709-4032-99b3-8d4ecc990027":1}'],
        tools: [],
      },
    };

    const result = createBundleFormSchema(
      bundleComponents as BundleComponents,
    ).safeParse(validData);

    expect(result.success).toEqual(true);
  });

  test("createBundleFormSchema with invalid min max values", () => {
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
    };

    const validData = {
      selectedOptions: {
        plants: [
          '{"a158ffa0-5d16-4325-8dcc-be8acd55eecf":1}',
          '{"awdawdawdaw-awdawjnawd-awdauunwda":1}',
        ],
        pots: [],
        tools: [],
      },
    };

    const result = createBundleFormSchema(
      bundleComponents as BundleComponents,
    ).safeParse(validData);

    expect(result.success).toEqual(false);
  });
});
