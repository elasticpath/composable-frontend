import { describe, expect, test } from "vitest"
import type { IndexableFields } from "@epcc-sdk/sdks-catalog-search"
import {
  chooseIndexableFieldsTarget,
  facetFieldNameProblem,
  mergeFacetableField,
} from "./indexable-fields"

const RANGE = "shopper_attributes.range"

const registered = {
  fields: [
    {
      name: "extensions.products(test3).test",
      type: "string",
      facetable: false,
      sortable: false,
      locale: "en",
    },
    {
      name: "extensions.products(general).subtitle",
      type: "string",
      facetable: false,
      sortable: false,
      locale: "en",
    },
  ],
} satisfies IndexableFields["attributes"]

function resource(
  owner: "store" | "organization",
  id = `${owner}-id`,
): IndexableFields {
  return {
    id,
    type: "catalog_search_indexable_fields",
    attributes: registered,
    meta: { owner },
  }
}

describe("mergeFacetableField", () => {
  test("adds the field as facetable and keeps every field already registered", () => {
    const { attributes, changed } = mergeFacetableField(registered, RANGE)

    expect(changed).toBe(true)
    expect(attributes.fields?.map((field) => field.name)).toEqual([
      "extensions.products(test3).test",
      "extensions.products(general).subtitle",
      RANGE,
    ])
    expect(attributes.fields?.at(-1)).toEqual({ name: RANGE, facetable: true })
  })

  test("leaves the settings of the fields already registered as they were", () => {
    const { attributes } = mergeFacetableField(registered, RANGE)

    expect(attributes.fields?.[0]).toEqual({
      name: "extensions.products(test3).test",
      facetable: false,
      sortable: false,
      locale: "en",
    })
  })

  test("drops the server-derived type, which the write does not accept", () => {
    const { attributes } = mergeFacetableField(registered, RANGE)

    for (const field of attributes.fields ?? []) {
      expect(field).not.toHaveProperty("type")
    }
  })

  test("keeps the index-wide settings and core field overrides", () => {
    const { attributes } = mergeFacetableField(
      {
        ...registered,
        stem: false,
        token_separators: ["-"],
        symbols_to_index: ["+"],
        core_field_overrides: [{ name: "name", sortable: true }],
      },
      RANGE,
    )

    expect(attributes).toMatchObject({
      stem: false,
      token_separators: ["-"],
      symbols_to_index: ["+"],
      core_field_overrides: [{ name: "name", sortable: true }],
    })
  })

  test("makes an already registered field facetable without adding it twice", () => {
    const { attributes, changed } = mergeFacetableField(
      registered,
      "extensions.products(general).subtitle",
    )

    expect(changed).toBe(true)
    expect(attributes.fields).toHaveLength(2)
    expect(attributes.fields?.[1]).toEqual({
      name: "extensions.products(general).subtitle",
      facetable: true,
      sortable: false,
      locale: "en",
    })
  })

  test("reports no change when the field is already facetable", () => {
    const { changed } = mergeFacetableField(
      { fields: [{ name: RANGE, type: "string", facetable: true }] },
      RANGE,
    )

    expect(changed).toBe(false)
  })

  test("a second run over the first run's result changes nothing", () => {
    const first = mergeFacetableField(registered, RANGE)
    const second = mergeFacetableField(first.attributes, RANGE)

    expect(second.changed).toBe(false)
    expect(second.attributes).toEqual(first.attributes)
  })

  test("starts from an empty field list when the store has registered nothing", () => {
    const { attributes, changed } = mergeFacetableField(undefined, RANGE)

    expect(changed).toBe(true)
    expect(attributes).toEqual({ fields: [{ name: RANGE, facetable: true }] })
  })
})

describe("chooseIndexableFieldsTarget", () => {
  test("updates the store's own resource", () => {
    expect(
      chooseIndexableFieldsTarget([
        resource("organization"),
        resource("store"),
      ]),
    ).toEqual({
      kind: "update",
      id: "store-id",
      attributes: registered,
    })
  })

  test("creates the resource when the store has none", () => {
    expect(chooseIndexableFieldsTarget([])).toEqual({ kind: "create" })
  })

  test("refuses to touch a resource the organization owns", () => {
    expect(chooseIndexableFieldsTarget([resource("organization")])).toEqual({
      kind: "organization-owned",
    })
  })
})

describe("facetFieldNameProblem", () => {
  test.each([
    "shopper_attributes.range",
    "shopper_attributes.product-line_2",
    "extensions.products(general).range",
    "extensions.products(my-template).product-line",
  ])("accepts %s", (name) => {
    expect(facetFieldNameProblem(name)).toBeNull()
  })

  test.each([
    ["an empty name", ""],
    ["a core field", "name"],
    [
      "an admin attribute, which search never returns",
      "admin_attributes.grade",
    ],
    ["an attribute name with a space", "shopper_attributes.product line"],
    [
      "an attribute name over 64 characters",
      `shopper_attributes.${"a".repeat(65)}`,
    ],
    ["an extension with no field", "extensions.products(general)"],
    [
      "a template that is not on products",
      "extensions.accounts(general).range",
    ],
  ])("rejects %s", (_, name) => {
    expect(facetFieldNameProblem(name)).toEqual(expect.any(String))
  })
})
