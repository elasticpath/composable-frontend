import { describe, test, expect } from "vitest";
import type { ElasticPathFile, ProductListData } from "@epcc-sdk/sdks-shopper";
import {
  parseSwatchColor,
  resolveVariationSwatches,
  swatchSourcesFromChildProducts,
  swatchSourcesFromVariants,
  type SwatchSource,
} from "./variation-swatches";
import type { FamilyVariation } from "./product-family";

const finish: FamilyVariation = {
  id: "finish",
  name: "Finish",
  options: [
    { id: "chrome", name: "Chrome" },
    { id: "plastic", name: "Plastic" },
  ],
};
const size: FamilyVariation = {
  id: "size",
  name: "Size",
  options: [
    { id: "sm", name: "sm" },
    { id: "md", name: "md" },
  ],
};

const image = (id: string) => ({ id, url: `https://files.example/${id}.jpg` });

describe("parseSwatchColor", () => {
  test.each(["#1f3a93", "#FFF", "  #abc  ", "#A0b1C2"])(
    "accepts the hex colour %j",
    (value) => {
      expect(parseSwatchColor(value)).toBe(value.trim().toLowerCase());
    },
  );

  test.each([
    "navy",
    "#12345",
    "#1234567f",
    "rgb(0,0,0)",
    "#fff;background:url(x)",
    "",
    undefined,
    null,
    42,
  ])("rejects %j", (value) => {
    expect(parseSwatchColor(value)).toBeUndefined();
  });
});

describe("resolveVariationSwatches", () => {
  test("renders colour dots when the children carry different colours", () => {
    const swatches = resolveVariationSwatches({
      variations: [finish],
      matrix: { chrome: "child-chrome", plastic: "child-plastic" },
      sources: {
        "child-chrome": { color: "#c0c0c0" },
        "child-plastic": { color: "#222222" },
      },
      selectedOptionIds: [undefined],
    });

    expect(swatches).toEqual([
      [
        { kind: "color", color: "#c0c0c0" },
        { kind: "color", color: "#222222" },
      ],
    ]);
  });

  test("renders image thumbnails when the children's main images differ", () => {
    const swatches = resolveVariationSwatches({
      variations: [finish],
      matrix: { chrome: "child-chrome", plastic: "child-plastic" },
      sources: {
        "child-chrome": { image: image("chrome") },
        "child-plastic": { image: image("plastic") },
      },
      selectedOptionIds: [undefined],
    });

    expect(swatches).toEqual([
      [
        { kind: "image", url: image("chrome").url },
        { kind: "image", url: image("plastic").url },
      ],
    ]);
  });

  test("prefers a valid colour over the child's image", () => {
    const swatches = resolveVariationSwatches({
      variations: [finish],
      matrix: { chrome: "child-chrome", plastic: "child-plastic" },
      sources: {
        "child-chrome": { color: "#c0c0c0", image: image("chrome") },
        "child-plastic": { color: "#222222", image: image("plastic") },
      },
      selectedOptionIds: [undefined],
    });

    expect(swatches[0]!.map((swatch) => swatch.kind)).toEqual(["color", "color"]);
  });

  test("keeps text for a variation whose children share one image", () => {
    const shared = image("shared");
    const swatches = resolveVariationSwatches({
      variations: [size],
      matrix: { sm: "child-sm", md: "child-md" },
      sources: { "child-sm": { image: shared }, "child-md": { image: shared } },
      selectedOptionIds: [undefined],
    });

    expect(swatches).toEqual([[{ kind: "text" }, { kind: "text" }]]);
  });

  test("keeps text when every child inherited the same colour from the parent", () => {
    const swatches = resolveVariationSwatches({
      variations: [size],
      matrix: { sm: "child-sm", md: "child-md" },
      sources: {
        "child-sm": { color: "#c0c0c0" },
        "child-md": { color: "#c0c0c0" },
      },
      selectedOptionIds: [undefined],
    });

    expect(swatches).toEqual([[{ kind: "text" }, { kind: "text" }]]);
  });

  test("keeps text when the children carry neither colour nor image", () => {
    const swatches = resolveVariationSwatches({
      variations: [size],
      matrix: { sm: "child-sm", md: "child-md" },
      sources: { "child-sm": {}, "child-md": {} },
      selectedOptionIds: [undefined],
    });

    expect(swatches).toEqual([[{ kind: "text" }, { kind: "text" }]]);
  });

  test("an option with an invalid colour falls back to text while the others keep their dots", () => {
    const swatches = resolveVariationSwatches({
      variations: [
        {
          ...finish,
          options: [...finish.options, { id: "brass", name: "Brass" }],
        },
      ],
      matrix: {
        chrome: "child-chrome",
        plastic: "child-plastic",
        brass: "child-brass",
      },
      sources: {
        "child-chrome": { color: "#c0c0c0" },
        "child-plastic": { color: "#222222" },
        "child-brass": { color: "goldish" },
      },
      selectedOptionIds: [undefined],
    });

    expect(swatches).toEqual([
      [
        { kind: "color", color: "#c0c0c0" },
        { kind: "color", color: "#222222" },
        { kind: "text" },
      ],
    ]);
  });

  test("a variation with only one valid colour renders its differing images instead", () => {
    const swatches = resolveVariationSwatches({
      variations: [finish],
      matrix: { chrome: "child-chrome", plastic: "child-plastic" },
      sources: {
        "child-chrome": { color: "#c0c0c0", image: image("chrome") },
        "child-plastic": { color: "not a colour", image: image("plastic") },
      },
      selectedOptionIds: [undefined],
    });

    expect(swatches).toEqual([
      [
        { kind: "image", url: image("chrome").url },
        { kind: "image", url: image("plastic").url },
      ],
    ]);
  });

  test("an option without an image keeps text while its siblings show thumbnails", () => {
    const swatches = resolveVariationSwatches({
      variations: [
        { ...finish, options: [...finish.options, { id: "brass", name: "Brass" }] },
      ],
      matrix: {
        chrome: "child-chrome",
        plastic: "child-plastic",
        brass: "child-brass",
      },
      sources: {
        "child-chrome": { image: image("chrome") },
        "child-plastic": { image: image("plastic") },
        "child-brass": {},
      },
      selectedOptionIds: [undefined],
    });

    expect(swatches[0]).toEqual([
      { kind: "image", url: image("chrome").url },
      { kind: "image", url: image("plastic").url },
      { kind: "text" },
    ]);
  });

  test("decides each variation of a family separately", () => {
    const sources: Record<string, SwatchSource> = {
      "sm-chrome": { color: "#c0c0c0" },
      "md-chrome": { color: "#c0c0c0" },
      "sm-plastic": { color: "#222222" },
      "md-plastic": { color: "#222222" },
    };

    const swatches = resolveVariationSwatches({
      variations: [finish, size],
      matrix: {
        sm: { chrome: "sm-chrome", plastic: "sm-plastic" },
        md: { chrome: "md-chrome", plastic: "md-plastic" },
      },
      sources,
      selectedOptionIds: [undefined, undefined],
    });

    expect(swatches).toEqual([
      [
        { kind: "color", color: "#c0c0c0" },
        { kind: "color", color: "#222222" },
      ],
      [{ kind: "text" }, { kind: "text" }],
    ]);
  });

  test("shows each option as the child it leads to under the other current choices", () => {
    const swatches = resolveVariationSwatches({
      variations: [finish, size],
      matrix: {
        sm: { chrome: "sm-chrome", plastic: "sm-plastic" },
        md: { chrome: "md-chrome", plastic: "md-plastic" },
      },
      sources: {
        "sm-chrome": { image: image("sm-chrome") },
        "sm-plastic": { image: image("sm-plastic") },
        "md-chrome": { image: image("md-chrome") },
        "md-plastic": { image: image("md-plastic") },
      },
      selectedOptionIds: ["plastic", "md"],
    });

    expect(swatches[0]).toEqual([
      { kind: "image", url: image("md-chrome").url },
      { kind: "image", url: image("md-plastic").url },
    ]);
  });

  test("uses each other variation's first option while it is unchosen", () => {
    const swatches = resolveVariationSwatches({
      variations: [finish, size],
      matrix: {
        sm: { chrome: "sm-chrome", plastic: "sm-plastic" },
        md: { chrome: "md-chrome", plastic: "md-plastic" },
      },
      sources: {
        "sm-chrome": { color: "#c0c0c0" },
        "sm-plastic": { color: "#222222" },
      },
      selectedOptionIds: [undefined, undefined],
    });

    expect(swatches[0]).toEqual([
      { kind: "color", color: "#c0c0c0" },
      { kind: "color", color: "#222222" },
    ]);
  });

  test("keeps text when the family has no variation matrix", () => {
    const swatches = resolveVariationSwatches({
      variations: [finish],
      matrix: undefined,
      sources: {},
      selectedOptionIds: [undefined],
    });

    expect(swatches).toEqual([[{ kind: "text" }, { kind: "text" }]]);
  });

  test("an option that leads to no known child keeps text", () => {
    const swatches = resolveVariationSwatches({
      variations: [
        { ...finish, options: [...finish.options, { id: "brass", name: "Brass" }] },
      ],
      matrix: { chrome: "child-chrome", plastic: "child-plastic" },
      sources: {
        "child-chrome": { color: "#c0c0c0" },
        "child-plastic": { color: "#222222" },
      },
      selectedOptionIds: [undefined],
    });

    expect(swatches[0]![2]).toEqual({ kind: "text" });
  });
});

const file = (id: string): ElasticPathFile =>
  ({ id, type: "file", link: { href: `https://files.example/${id}.jpg` } }) as ElasticPathFile;

describe("swatchSourcesFromChildProducts", () => {
  test("reads the colour attribute and the main image of each child", () => {
    const children = {
      data: [
        {
          id: "child-chrome",
          attributes: { shopper_attributes: { color: "#C0C0C0" } },
          relationships: { main_image: { data: { id: "img-chrome" } } },
        },
        {
          id: "child-plastic",
          attributes: {},
          relationships: { main_image: { data: { id: "img-missing" } } },
        },
      ],
      included: { main_images: [file("img-chrome")] },
    } as unknown as ProductListData;

    expect(swatchSourcesFromChildProducts(children)).toEqual({
      "child-chrome": {
        color: "#C0C0C0",
        image: { id: "img-chrome", url: "https://files.example/img-chrome.jpg" },
      },
      "child-plastic": { color: undefined, image: undefined },
    });
  });

  test("is empty when the children are not loaded", () => {
    expect(swatchSourcesFromChildProducts(undefined)).toEqual({});
  });
});

describe("swatchSourcesFromVariants", () => {
  test("resolves each variant's main image from the loaded files", () => {
    expect(
      swatchSourcesFromVariants(
        {
          "child-chrome": { mainImageId: "img-chrome", color: "#c0c0c0" },
          "child-plastic": { mainImageId: "img-pending" },
        },
        [file("img-chrome")],
      ),
    ).toEqual({
      "child-chrome": {
        color: "#c0c0c0",
        image: { id: "img-chrome", url: "https://files.example/img-chrome.jpg" },
      },
      "child-plastic": { color: undefined, image: undefined },
    });
  });
});
