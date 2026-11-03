import type {
  IndexableField,
  IndexableFieldRequest,
  IndexableFields,
  IndexableFieldsAttributes,
  IndexableFieldsRequestAttributes,
} from "@epcc-sdk/sdks-catalog-search"

const SHOPPER_ATTRIBUTE_FIELD = /^shopper_attributes\.[A-Za-z0-9_-]{1,64}$/
const PRODUCT_EXTENSION_FIELD = /^extensions\.products\([^()\s]+\)\.[^.\s]+$/

export function facetFieldNameProblem(name: string): string | null {
  if (
    SHOPPER_ATTRIBUTE_FIELD.test(name) ||
    PRODUCT_EXTENSION_FIELD.test(name)
  ) {
    return null
  }

  return `"${name}" is not a field search can facet on. Use shopper_attributes.<name> (letters, digits, "_" or "-", at most 64 characters) or extensions.products(<template slug>).<field slug>.`
}

export type FacetableFieldMerge = {
  attributes: IndexableFieldsRequestAttributes
  changed: boolean
}

export function mergeFacetableField(
  current:
    | IndexableFieldsAttributes
    | IndexableFieldsRequestAttributes
    | undefined,
  fieldName: string,
): FacetableFieldMerge {
  const { fields = [], ...indexWideSettings } = current ?? {}
  const writableFields: IndexableFieldRequest[] = fields.map(asWritableField)
  const existing = fields.find((field) => field.name === fieldName)

  const mergedFields = writableFields.map((field) =>
    field.name === fieldName ? { ...field, facetable: true } : field,
  )

  return {
    attributes: {
      ...indexWideSettings,
      fields: existing
        ? mergedFields
        : [...mergedFields, { name: fieldName, facetable: true }],
    },
    changed: existing?.facetable !== true,
  }
}

function asWritableField(
  field: IndexableField | IndexableFieldRequest,
): IndexableFieldRequest {
  const { type: _serverDerivedType, ...writable } = field as IndexableField
  return writable
}

export type IndexableFieldsTarget =
  | { kind: "update"; id: string; attributes: IndexableFieldsAttributes }
  | { kind: "create" }
  | { kind: "organization-owned" }

export function chooseIndexableFieldsTarget(
  resources: IndexableFields[],
): IndexableFieldsTarget {
  const storeOwned = resources.find(
    (resource) => resource.meta.owner === "store",
  )

  if (storeOwned) {
    return {
      kind: "update",
      id: storeOwned.id,
      attributes: storeOwned.attributes,
    }
  }

  return resources.length > 0
    ? { kind: "organization-owned" }
    : { kind: "create" }
}
