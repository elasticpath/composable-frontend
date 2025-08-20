"use strict";

import { utils } from "./support/utils";
import type { Configuration } from "./Configuration";
import type { InstantSearchRequest } from "./SearchRequestAdapter";

interface TypesenseDocument {
  id: string;
  [key: string]: any;
}

interface TypesenseHit {
  document: TypesenseDocument;
  highlights?: Array<{
    field: string;
    snippet?: string;
    snippets?: string[];
    value?: string;
    values?: string[];
    matched_tokens: string[];
    indices?: number[];
  }>;
  highlight?: any;
  text_match?: number;
  geo_distance_meters?: number;
  curated?: boolean;
  text_match_info?: any;
  hybrid_search_info?: any;
  vector_distance?: number;
  collection?: string;
  search_index?: number;
}

interface TypesenseGroupedHit {
  group_key: any[];
  hits: TypesenseHit[];
  found?: number;
}

interface TypesenseFacetCount {
  field_name: string;
  counts: Array<{
    value: string;
    count: number;
  }>;
  stats?: {
    min?: number;
    max?: number;
    avg?: number;
    sum?: number;
  };
}

interface TypesenseRequestParams {
  q?: string;
  per_page?: number;
  [key: string]: any;
}

interface TypesenseResponse {
  hits?: TypesenseHit[];
  grouped_hits?: TypesenseGroupedHit[];
  found: number;
  page: number;
  search_time_ms: number;
  facet_counts?: TypesenseFacetCount[];
  request_params?: TypesenseRequestParams;
  union_request_params?: TypesenseRequestParams[];
  metadata?: any;
  parsed_nl_query?: string;
  conversation?: any;
}

interface AdaptedHit {
  objectID: string;
  _snippetResult: any;
  _highlightResult: any;
  _rawTypesenseHit: TypesenseHit;
  _rawTypesenseConversation?: any;
  _geoloc?: {
    lat: number;
    lng: number;
  };
  group_key?: any[];
  _group_key?: any[];
  _group_found?: number;
  _grouped_hits?: AdaptedHit[];
  [key: string]: any;
}

interface AdaptedSearchResponse {
  hits: AdaptedHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  facets: { [facetName: string]: { [facetValue: string]: number } };
  facets_stats: { [facetName: string]: any };
  query: string;
  processingTimeMS: number;
  renderingContent?: any;
  appliedRules?: string[];
  userData?: any[];
  parsed_nl_query?: string;
}

export class SearchResponseAdapter {
  typesenseResponse: TypesenseResponse;
  instantsearchRequest: InstantSearchRequest;
  configuration: Configuration;
  allTypesenseResults: TypesenseResponse[];
  fullTypesenseResponse: TypesenseResponse;
  _adaptHighlightTag: typeof utils._adaptHighlightTag;
  _adaptNumberOfPages: typeof utils._adaptNumberOfPages;

  constructor(
    typesenseResponse: TypesenseResponse,
    instantsearchRequest: InstantSearchRequest,
    configuration: Configuration,
    allTypesenseResults: TypesenseResponse[] = [],
    fullTypesenseResponse: TypesenseResponse = {} as TypesenseResponse,
  ) {
    this.typesenseResponse = typesenseResponse;
    this.instantsearchRequest = instantsearchRequest;
    this.configuration = configuration;
    this.allTypesenseResults = allTypesenseResults;
    this.fullTypesenseResponse = fullTypesenseResponse;
    this._adaptHighlightTag = utils._adaptHighlightTag;
    this._adaptNumberOfPages = utils._adaptNumberOfPages;
  }

  _adaptGroupedHits(typesenseGroupedHits: TypesenseGroupedHit[]): AdaptedHit[] {
    let adaptedResult: AdaptedHit[][] | AdaptedHit[] = [];

    adaptedResult = typesenseGroupedHits.map((groupedHit) => {
      const adaptedHits = this._adaptHits(groupedHit.hits);
      adaptedHits.forEach((hit) => {
        hit["group_key"] = hit["_group_key"] = groupedHit.group_key;
        if (groupedHit.found) {
          hit["_group_found"] = groupedHit.found;
        }
      });
      return adaptedHits;
    });

    // adaptedResult is now in the form of [[{}, {}], [{}, {}], ...]
    //  where each element in the outermost array corresponds to a group.

    if (this.configuration.flattenGroupedHits) {
      // We flatten it to [{}, {}, {}]
      adaptedResult = adaptedResult.flat();
    } else {
      // We flatten it to [{ ..., grouped_hits: [{}, {}] }, {}, {}]
      // We set the first element in the group as the hit, and then add a new key called grouped_hits with the other hits
      adaptedResult = adaptedResult.map((adaptedGroupedHit) => {
        return {
          ...adaptedGroupedHit[0],
          _grouped_hits: adaptedGroupedHit,
        };
      });
    }

    return adaptedResult;
  }

  _adaptHits(typesenseHits: TypesenseHit[]): AdaptedHit[] {
    let adaptedResult: AdaptedHit[] = [];
    adaptedResult = typesenseHits.map((typesenseHit) => {
      const adaptedHit: AdaptedHit = {
        ...typesenseHit.document,
      } as AdaptedHit;
      adaptedHit.objectID = typesenseHit.document.id;
      adaptedHit._snippetResult = this._adaptHighlightResult(typesenseHit, "snippet");
      adaptedHit._highlightResult = this._adaptHighlightResult(typesenseHit, "value");
      adaptedHit._rawTypesenseHit = typesenseHit;

      // We're adding `conversation` into each hit, since there doesn't seem to be any other way to pass this up to Instantsearch outside of hits
      if (this.fullTypesenseResponse.conversation) {
        adaptedHit._rawTypesenseConversation = this.fullTypesenseResponse.conversation;
      }

      // Add metadata fields to result, if a field with that name doesn't already exist
      [
        "text_match",
        "geo_distance_meters",
        "curated",
        "text_match_info",
        "hybrid_search_info",
        "vector_distance",
        "collection", // Union search specific
        "search_index", // Union search specific
      ].forEach((metadataField) => {
        if (Object.keys(typesenseHit).includes(metadataField) && !Object.keys(adaptedHit).includes(metadataField)) {
          adaptedHit[metadataField] = typesenseHit[metadataField];
        }
      });

      const geoLocationValue = adaptedHit[this.configuration.geoLocationField];
      if (geoLocationValue) {
        adaptedHit._geoloc = {
          lat: geoLocationValue[0],
          lng: geoLocationValue[1],
        };
      }

      return adaptedHit;
    });
    return adaptedResult;
  }

  _adaptHighlightResult(typesenseHit: TypesenseHit, snippetOrValue: "snippet" | "value"): any {
    const result: any = {};

    // If there is a highlight object available (as of v0.24.0),
    // And the highlight object uses the highlight format available in v0.24.0.rcn32 and above
    //  use that instead of the highlights array, since it supports highlights of nested fields
    if (typesenseHit.highlight != null && this.isHighlightPost0240RCN32Format(typesenseHit.highlight)) {
      this.adaptHighlightObject(typesenseHit, result, snippetOrValue);
    } else {
      this.adaptHighlightsArray(typesenseHit, result, snippetOrValue);
    }
    return result;
  }

  isHighlightPost0240RCN32Format(highlight: any): boolean {
    return highlight.full == null && highlight.snippet == null;
  }

  adaptHighlightsArray(typesenseHit: TypesenseHit, result: any, snippetOrValue: "snippet" | "value"): void {
    // Algolia lists all searchable attributes in this key, even if there are no matches
    // So do the same and then override highlights

    Object.assign(
      result,
      ...Object.entries(typesenseHit.document).map(([attribute, value]) => ({
        [attribute]: {
          value: value,
          matchLevel: "none",
          matchedWords: [],
        },
      })),
    );

    typesenseHit.highlights.forEach((highlight) => {
      result[highlight.field] = {
        value: highlight[snippetOrValue] || highlight[`${snippetOrValue}s`],
        matchLevel: "full",
        matchedWords: highlight.matched_tokens,
      };

      if (highlight.indices) {
        result[highlight.field]["matchedIndices"] = highlight.indices;
      }
    });

    // Now convert any values that have an array value
    // Also, replace highlight tag
    Object.entries(result).forEach(([k, v]: [string, any]) => {
      const attribute = k;
      const { value, matchLevel, matchedWords, matchedIndices } = v;
      if (value == null) {
        result[attribute] = this._adaptHighlightNullValue();
      } else if (Array.isArray(value)) {
        // Algolia lists all values of the key in highlights, even those that don't have any highlights
        // So add all values of the array field, including highlights
        result[attribute] = [];
        typesenseHit.document[attribute].forEach((unhighlightedValueFromArray, index) => {
          if (matchedIndices && matchedIndices.includes(index)) {
            result[attribute].push({
              value: this._adaptHighlightTag(
                `${value[matchedIndices.indexOf(index)]}`,
                this.instantsearchRequest.params.highlightPreTag,
                this.instantsearchRequest.params.highlightPostTag,
              ),
              matchLevel: matchLevel,
              matchedWords: matchedWords[index],
            });
          } else if (typeof unhighlightedValueFromArray === "object") {
            // Handle arrays of objects
            // Side note: Typesense does not support highlights for nested objects in this `highlights` array,
            //  so we pass in an empty object below
            result[attribute].push(this._adaptHighlightInObjectValue(unhighlightedValueFromArray, {}, snippetOrValue));
          } else {
            result[attribute].push({
              value: `${unhighlightedValueFromArray}`,
              matchLevel: "none",
              matchedWords: [],
            });
          }
        });
      } else if (typeof value === "object") {
        // Handle nested objects
        // Side note: Typesense does not support highlights for nested objects in this `highlights` array,
        //  so we pass in an empty object below
        result[attribute] = this._adaptHighlightInObjectValue(value, {}, snippetOrValue);
      } else {
        // Convert all values to strings
        result[attribute].value = this._adaptHighlightTag(
          `${value}`,
          this.instantsearchRequest.params.highlightPreTag,
          this.instantsearchRequest.params.highlightPostTag,
        );
      }
    });
  }

  adaptHighlightObject(typesenseHit: TypesenseHit, result: any, snippetOrValue: "snippet" | "value"): void {
    Object.assign(
      result,
      this._adaptHighlightInObjectValue(typesenseHit.document, typesenseHit.highlight, snippetOrValue),
    );
  }

  _adaptHighlightInObjectValue(objectValue: any, highlightObjectValue: any, snippetOrValue: "snippet" | "value"): any {
    return Object.assign(
      {},
      ...Object.entries(objectValue).map(([attribute, value]) => {
        let adaptedValue;
        if (value == null) {
          adaptedValue = this._adaptHighlightNullValue();
        } else if (Array.isArray(value)) {
          adaptedValue = this._adaptHighlightInArrayValue(
            value,
            highlightObjectValue?.[attribute] ?? [],
            snippetOrValue,
          );
        } else if (typeof value === "object") {
          adaptedValue = this._adaptHighlightInObjectValue(
            value,
            highlightObjectValue?.[attribute] ?? {},
            snippetOrValue,
          );
        } else {
          adaptedValue = this._adaptHighlightInPrimitiveValue(value, highlightObjectValue?.[attribute], snippetOrValue);
        }

        return {
          [attribute]: adaptedValue,
        };
      }),
    );
  }

  _adaptHighlightInArrayValue(arrayValue: any[], highlightArrayValue: any[], snippetOrValue: "snippet" | "value"): any[] {
    return arrayValue.map((value, index) => {
      let adaptedValue;
      if (value == null) {
        adaptedValue = this._adaptHighlightNullValue();
      } else if (Array.isArray(value)) {
        adaptedValue = this._adaptHighlightInArrayValue(value, highlightArrayValue?.[index] ?? [], snippetOrValue);
      } else if (typeof value === "object") {
        adaptedValue = this._adaptHighlightInObjectValue(value, highlightArrayValue?.[index] ?? {}, snippetOrValue);
      } else {
        adaptedValue = this._adaptHighlightInPrimitiveValue(value, highlightArrayValue?.[index], snippetOrValue);
      }
      return adaptedValue;
    });
  }

  _adaptHighlightInPrimitiveValue(primitiveValue: any, highlightPrimitiveValue: any, snippetOrValue: "snippet" | "value"): any {
    if (highlightPrimitiveValue != null) {
      return {
        value: this._adaptHighlightTag(
          `${
            highlightPrimitiveValue[snippetOrValue] ??
            highlightPrimitiveValue["highlight"] ??
            highlightPrimitiveValue["snippet"]
          }`,
          this.instantsearchRequest.params.highlightPreTag,
          this.instantsearchRequest.params.highlightPostTag,
        ),
        matchLevel: (highlightPrimitiveValue.matched_tokens || []).length > 0 ? "full" : "none",
        matchedWords: highlightPrimitiveValue.matched_tokens || [],
      };
    } else {
      return {
        // Convert all values to strings
        value: this._adaptHighlightTag(
          `${primitiveValue}`,
          this.instantsearchRequest.params.highlightPreTag,
          this.instantsearchRequest.params.highlightPostTag,
        ),
        matchLevel: "none",
        matchedWords: [],
      };
    }
  }

  _adaptHighlightNullValue(): any {
    return {
      value: "",
      matchLevel: "none",
      matchedWords: [],
    };
  }

  _adaptFacets(typesenseFacetCounts: TypesenseFacetCount[] | undefined): { [facetName: string]: { [facetValue: string]: number } } {
    const adaptedResult: { [facetName: string]: { [facetValue: string]: number } } = {};
    if (Array.isArray(typesenseFacetCounts)) {
      typesenseFacetCounts.forEach((facet) => {
        Object.assign(adaptedResult, {
          [facet.field_name]: Object.assign({}, ...facet.counts.map((count) => ({ [count.value]: count.count }))),
        });
      });
    }
    return adaptedResult;
  }

  _adaptFacetStats(typesenseFacetCounts: TypesenseFacetCount[] | undefined): { [facetName: string]: any } {
    const adaptedResult: { [facetName: string]: any } = {};
    if (Array.isArray(typesenseFacetCounts)) {
      typesenseFacetCounts.forEach((facet) => {
        if (facet.stats && Object.keys(facet.stats).length > 0) {
          Object.assign(adaptedResult, {
            [facet.field_name]: facet.stats,
          });
        }
      });
    }
    return adaptedResult;
  }

  _adaptRenderingContent(typesenseFacetCounts: TypesenseFacetCount[]): any {
    const adaptedResult: any = Object.assign({}, this.configuration.renderingContent);

    // Only set facet ordering if the user has not set one
    if (adaptedResult.facetOrdering?.facets?.order == null) {
      adaptedResult.facetOrdering = adaptedResult.facetOrdering || {};
      adaptedResult.facetOrdering.facets = adaptedResult.facetOrdering.facets || {};
      adaptedResult.facetOrdering.facets.order = [
        ...new Set(
          (Array.isArray(typesenseFacetCounts) ? typesenseFacetCounts : [])
            .map((fc) => fc["field_name"])
            .concat(
              this.allTypesenseResults
                .map((r) => r.facet_counts || [])
                .flat()
                .map((fc) => fc["field_name"])
                .filter((f) => f),
            ),
        ),
      ];
    }

    return adaptedResult;
  }

  _adaptUserData(metadata: any): any[] {
    if (!metadata) return [];

    return Array.isArray(metadata) ? metadata : [metadata];
  }

  adapt(): AdaptedSearchResponse {
    const adaptedRenderingContent = this._adaptRenderingContent(this.typesenseResponse.facet_counts || []);

    // For union search, use union_request_params, otherwise use request_params
    const requestParams = this.typesenseResponse.union_request_params
      ? this.typesenseResponse.union_request_params[0]
      : this.typesenseResponse.request_params;

    const adaptedResult: AdaptedSearchResponse = {
      hits: this.typesenseResponse.grouped_hits
        ? this._adaptGroupedHits(this.typesenseResponse.grouped_hits)
        : this._adaptHits(this.typesenseResponse.hits),
      nbHits: this.typesenseResponse.found,
      page: this.typesenseResponse.union_request_params
        ? this.typesenseResponse.page // Union search already uses 0-based page
        : this.typesenseResponse.page - 1, // Regular search uses 1-based page, convert to 0-based
      nbPages: this._adaptNumberOfPages(),
      hitsPerPage: requestParams?.per_page || 10,
      facets: this._adaptFacets(this.typesenseResponse.facet_counts || []),
      facets_stats: this._adaptFacetStats(this.typesenseResponse.facet_counts || []),
      query: requestParams?.q || "",
      processingTimeMS: this.typesenseResponse.search_time_ms,
      ...(Object.keys(adaptedRenderingContent).length > 0 ? { renderingContent: adaptedRenderingContent } : null),
    };

    // Add appliedRules if metadata is present
    if (this.typesenseResponse.metadata) {
      adaptedResult.appliedRules = ["typesense-override"];
      adaptedResult.userData = this._adaptUserData(this.typesenseResponse.metadata);
    }

    // Add parsed_nl_query if natural language search was used
    if (this.typesenseResponse.parsed_nl_query) {
      adaptedResult.parsed_nl_query = this.typesenseResponse.parsed_nl_query;
    }

    // If no results were found for the search, but there is still a conversation response,
    // still send that as a hit so the conversation is accessible via Instantsearch
    if (this.fullTypesenseResponse.conversation && adaptedResult.hits.length === 0) {
      adaptedResult.hits = [
        {
          _rawTypesenseConversation: this.fullTypesenseResponse.conversation,
        } as AdaptedHit,
      ];
    }

    // console.log(adaptedResult);
    return adaptedResult;
  }
}

Object.assign(SearchResponseAdapter.prototype, utils);
