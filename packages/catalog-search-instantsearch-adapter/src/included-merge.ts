"use strict"

import type { CatalogSearchIncludeResource } from "./Configuration"

interface IncludedBlock {
  main_images?: any[]
  files?: any[]
  component_products?: any[]
}

interface MergeArgs {
  hits: any[]
  included: IncludedBlock | undefined
  includeRequested: CatalogSearchIncludeResource[] | undefined
}

interface MergeResult {
  hits: any[]
  needsIncludedWarning: boolean
}

/**
 * Map each `include` value (the singular relationship key on a hit) to its
 * matching included-block key (always plural in EP responses) and the
 * cardinality of the resolved field on the hit.
 *
 *   include="main_image"        → relationships.main_image.data: { id }     → hit.main_image: object
 *   include="files"             → relationships.files.data:     [{id}, …]   → hit.files: array
 *   include="component_products"→ relationships.component_products.data: …  → hit.component_products: array
 *
 * The pluralisation special case is `main_image → main_images`; the other
 * two are already plural on both sides.
 */
const RESOURCE_MAP: Record<
  CatalogSearchIncludeResource,
  { includedKey: keyof IncludedBlock; cardinality: "single" | "array" }
> = {
  main_image: { includedKey: "main_images", cardinality: "single" },
  files: { includedKey: "files", cardinality: "array" },
  component_products: {
    includedKey: "component_products",
    cardinality: "array",
  },
}

export function mergeIncludedResources(args: MergeArgs): MergeResult {
  const { hits, included, includeRequested } = args

  // Whole-block mismatch: caller asked the server to include resources, but
  // the response carries no `included` sibling at all. That's a server-side
  // mismatch worth surfacing once. Per-resource gaps (the `included` block
  // is present but the requested collection is missing or empty) are normal
  // data variability — we don't flag those.
  const needsIncludedWarning =
    !!includeRequested && includeRequested.length > 0 && included == null

  const mergedHits = hits.map((hit) => {
    let next: any = hit
    for (const resource of includeRequested ?? []) {
      const { includedKey, cardinality } = RESOURCE_MAP[resource]
      const pool = included?.[includedKey]
      const relData = hit?.relationships?.[resource]?.data
      if (cardinality === "single") {
        const id = relData?.id
        if (!id) continue
        const resolved = pool?.find((r) => r?.id === id)
        if (!resolved) continue
        next = { ...next, [resource]: resolved }
      } else {
        const refs = Array.isArray(relData) ? relData : []
        if (refs.length === 0) continue
        const resolved = refs
          .map((ref) => pool?.find((r) => r?.id === ref?.id))
          .filter((r) => r != null)
        if (resolved.length === 0) continue
        next = { ...next, [resource]: resolved }
      }
    }
    return next
  })

  return { hits: mergedHits, needsIncludedWarning }
}
