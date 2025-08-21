"use strict"

import { utils } from "./support/utils"
import type { SearchClient } from "algoliasearch-helper/types/algoliasearch"
import { SearchResult } from "@epcc-sdk/sdks-shopper"

// InstantSearch.js sends requests in this format
// interface SearchRequest {
//   indexName: string
//   params: SearchOptions & {
//     // Additional parameters that might be sent by specific widgets
//     facetQuery?: string
//     facetName?: string
//   }
// }

type SearchRequest =
  | Parameters<SearchClient["search"]>[0]
  | Parameters<NonNullable<SearchClient["searchForFacetValues"]>>[0]

interface FacetCount {
  value: string
  highlighted: string
  count: number
}

interface TypesenseFacet {
  field_name: string
  counts: FacetCount[]
}

interface FacetHit {
  value: string
  highlighted: string
  count: number
}

interface AdaptedFacetSearchResponse {
  facetHits: FacetHit[]
  exhaustiveFacetsCount: boolean
  processingTimeMS: number
}

export class FacetSearchResponseAdapter {
  typesenseResponse: SearchResult
  instantsearchRequest: SearchRequest
  _adaptHighlightTag: typeof utils._adaptHighlightTag

  constructor(
    typesenseResponse: SearchResult,
    instantsearchRequest: SearchRequest,
  ) {
    this.typesenseResponse = typesenseResponse
    this.instantsearchRequest = instantsearchRequest
    this._adaptHighlightTag = utils._adaptHighlightTag
  }

  _adaptFacetHits(typesenseFacetCounts: TypesenseFacet[]): FacetHit[] {
    let adaptedResult: FacetHit[] = []
    const facet = typesenseFacetCounts.find(
      (facet) =>
        // @ts-ignore
        facet.field_name === this.instantsearchRequest.params.facetName,
    )

    if (typeof facet !== "undefined" && "params" in this.instantsearchRequest) {
      adaptedResult = facet.counts.map((facetCount) => ({
        value: facetCount.value,
        highlighted: this._adaptHighlightTag(
          facetCount.highlighted,
          // @ts-ignore
          this.instantsearchRequest.params.highlightPreTag,
          // @ts-ignore
          this.instantsearchRequest.params.highlightPostTag,
        ),
        count: facetCount.count,
      }))
    }

    return adaptedResult
  }

  adapt(): AdaptedFacetSearchResponse {
    const adaptedResult = {
      // @ts-ignore
      facetHits: this._adaptFacetHits(this.typesenseResponse.facet_counts),
      exhaustiveFacetsCount: true,
      processingTimeMS: this.typesenseResponse.search_time_ms,
    }
    // @ts-ignore
    return adaptedResult
  }
}

Object.assign(FacetSearchResponseAdapter.prototype, utils)
