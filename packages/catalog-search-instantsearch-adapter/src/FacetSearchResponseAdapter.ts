"use strict";

import { utils } from "./support/utils";

interface FacetCount {
  value: string;
  highlighted: string;
  count: number;
}

interface TypesenseFacet {
  field_name: string;
  counts: FacetCount[];
}

interface TypesenseFacetSearchResponse {
  facet_counts: TypesenseFacet[];
  search_time_ms: number;
}

interface InstantSearchFacetRequest {
  params: {
    facetName: string;
    highlightPreTag?: string;
    highlightPostTag?: string;
  };
}

interface FacetHit {
  value: string;
  highlighted: string;
  count: number;
}

interface AdaptedFacetSearchResponse {
  facetHits: FacetHit[];
  exhaustiveFacetsCount: boolean;
  processingTimeMS: number;
}

export class FacetSearchResponseAdapter {
  typesenseResponse: TypesenseFacetSearchResponse;
  instantsearchRequest: InstantSearchFacetRequest;
  _adaptHighlightTag: typeof utils._adaptHighlightTag;

  constructor(typesenseResponse: TypesenseFacetSearchResponse, instantsearchRequest: InstantSearchFacetRequest) {
    this.typesenseResponse = typesenseResponse;
    this.instantsearchRequest = instantsearchRequest;
    this._adaptHighlightTag = utils._adaptHighlightTag;
  }

  _adaptFacetHits(typesenseFacetCounts: TypesenseFacet[]): FacetHit[] {
    let adaptedResult: FacetHit[] = [];
    const facet = typesenseFacetCounts.find((facet) => facet.field_name === this.instantsearchRequest.params.facetName);

    if (typeof facet !== 'undefined') {
      adaptedResult = facet.counts.map((facetCount) => ({
        value: facetCount.value,
        highlighted: this._adaptHighlightTag(
          facetCount.highlighted,
          this.instantsearchRequest.params.highlightPreTag,
          this.instantsearchRequest.params.highlightPostTag,
        ),
        count: facetCount.count,
      }));
    }

    return adaptedResult;
  }

  adapt(): AdaptedFacetSearchResponse {
    const adaptedResult = {
      facetHits: this._adaptFacetHits(this.typesenseResponse.facet_counts),
      exhaustiveFacetsCount: true,
      processingTimeMS: this.typesenseResponse.search_time_ms,
    };
    return adaptedResult;
  }
}

Object.assign(FacetSearchResponseAdapter.prototype, utils);
