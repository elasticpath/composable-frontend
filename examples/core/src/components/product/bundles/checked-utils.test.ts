import { describe, expect, test } from "vitest";
import { bigIntToNumberReplacer } from "./form-parsers";
import { checkOption, isChecked, uncheckOption } from "./checked-utils";

describe("checked-utils", () => {
  test("isChecked", () => {
    const data = [
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
    ];

    expect(isChecked(data, "2131231dwadwd12-1d21d2dqw-dd12dqwdaw")).toEqual(
      true,
    );
    expect(isChecked(data, "syh28sddwadwd12-1d21d2dqw-dd12dqwdaw")).toEqual(
      false,
    );
  });

  describe("checkOption", () => {
    test("checks and option when the option is selected", () => {
      const data = [
        JSON.stringify(
          {
            "a158ffa0-5d16-4325-8dcc-be8acd55eecf": 1,
          },
          bigIntToNumberReplacer,
        ),
      ];

      const expected = [
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
      ];

      const result = checkOption(
        data,
        "2131231dwadwd12-1d21d2dqw-dd12dqwdaw",
        1,
      );
      expect(result).toEqual(expected);
    });
  });

  describe("uncheckOption", () => {
    test("uncheck option when the option is unselected", () => {
      const data = [
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
      ];

      const expected = [
        JSON.stringify(
          {
            "2131231dwadwd12-1d21d2dqw-dd12dqwdaw": 1,
          },
          bigIntToNumberReplacer,
        ),
      ];

      const result = uncheckOption(
        data,
        "a158ffa0-5d16-4325-8dcc-be8acd55eecf",
      );
      expect(result).toEqual(expected);
    });
  });
});
