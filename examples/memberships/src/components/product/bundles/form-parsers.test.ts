import { describe, expect, test } from "vitest";
import {
  bigIntToNumberReplacer,
  formSelectedOptionsToData,
  selectedOptionsToFormValues,
} from "./form-parsers";
import { BundleConfiguration } from "@epcc-sdk/sdks-shopper/dist/client/types.gen";

describe("form-parsers", () => {
  test("component options to form", () => {
    const data: BundleConfiguration["selected_options"] = {
      plants: {
        "a158ffa0-5d16-4325-8dcc-be8acd55eecf": BigInt(1),
        "2131231dwadwd12-1d21d2dqw-dd12dqwdaw": BigInt(1),
      },
      pots: {
        "fc520b37-a709-4032-99b3-8d4ecc990027": BigInt(1),
      },
      tools: {},
    };

    const expectedResult = {
      plants: [
        JSON.stringify(
          {
            "a158ffa0-5d16-4325-8dcc-be8acd55eecf": 1,
          },
          bigIntToNumberReplacer,
        ),
        JSON.stringify(
          {
            "2131231dwadwd12-1d21d2dqw-dd12dqwdaw": 1,
          },
          bigIntToNumberReplacer,
        ),
      ],
      pots: [
        JSON.stringify(
          {
            "fc520b37-a709-4032-99b3-8d4ecc990027": 1,
          },
          bigIntToNumberReplacer,
        ),
      ],
      tools: [],
    };

    expect(selectedOptionsToFormValues(data)).toEqual(expectedResult);
  });

  test("form to component options", () => {
    const data = {
      plants: [
        JSON.stringify(
          {
            "a158ffa0-5d16-4325-8dcc-be8acd55eecf": 1,
          },
          bigIntToNumberReplacer,
        ),
        JSON.stringify(
          {
            "2131231dwadwd12-1d21d2dqw-dd12dqwdaw": 1,
          },
          bigIntToNumberReplacer,
        ),
      ],
      pots: [
        JSON.stringify(
          {
            "fc520b37-a709-4032-99b3-8d4ecc990027": 1,
          },
          bigIntToNumberReplacer,
        ),
      ],
      tools: [],
    };

    const expectedResult = {
      plants: {
        "a158ffa0-5d16-4325-8dcc-be8acd55eecf": 1,
        "2131231dwadwd12-1d21d2dqw-dd12dqwdaw": 1,
      },
      pots: {
        "fc520b37-a709-4032-99b3-8d4ecc990027": 1,
      },
      tools: {},
    };

    expect(formSelectedOptionsToData(data)).toEqual(expectedResult);
  });
});
