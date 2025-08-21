"use strict"

import { Configuration } from "./Configuration"
import {
  Client as ShopperSearchClient,
  MultiSearchResponse,
  SearchResult,
} from "@epcc-sdk/sdks-shopper"
import { SearchRequestAdapter } from "./SearchRequestAdapter"
import { SearchResponseAdapter } from "./SearchResponseAdapter"
import { FacetSearchResponseAdapter } from "./FacetSearchResponseAdapter"
import type { SearchClient } from "algoliasearch-helper/types/algoliasearch"

interface AdaptedSearchResponse {
  [key: string]: any
}

interface AdaptedFacetSearchResponse {
  [key: string]: any
}

interface TypesenseResult {
  error?: string
  code?: number
  hits?: any[]
  grouped_hits?: any[]
  [key: string]: any
}

// This adapter implements the SearchClient interface from InstantSearch.js
// but returns our own client instance for clearCache

interface AdapterOptions {
  client: ShopperSearchClient
  [key: string]: any
}

export default class TypesenseInstantsearchAdapter {
  // @ts-ignore
  configuration: Configuration
  shopperClient: ShopperSearchClient
  searchClient: SearchClient & { clearCache: () => SearchClient }

  constructor(options: AdapterOptions) {
    this.shopperClient = options.client
    this.updateConfiguration(options)
    // @ts-ignore
    this.searchClient = {
      clearCache: () => this.clearCache(),
      search: (requests) => this.searchTypesenseAndAdapt(requests),
      searchForFacetValues: (requests) =>
        this.searchTypesenseForFacetValuesAndAdapt(requests),
    } as SearchClient & { clearCache: () => SearchClient }
  }

  async searchTypesenseAndAdapt(
    instantsearchRequests: Parameters<SearchClient["search"]>[0],
  ): Promise<{ results: AdaptedSearchResponse[] }> {
    let typesenseResponse: MultiSearchResponse
    try {
      typesenseResponse = await this._adaptAndPerformTypesenseRequest(
        instantsearchRequests,
      )

      // Check if this is a union search response
      if (
        "union_request_params" in typesenseResponse &&
        typesenseResponse.union_request_params
      ) {
        // Handle union search response - single unified response
        this._validateTypesenseResult(typesenseResponse)
        const responseAdapter = new SearchResponseAdapter(
          typesenseResponse as SearchResult,
          instantsearchRequests[0], // Use first request as base
          this.configuration,
          [typesenseResponse as SearchResult], // Pass single response as allTypesenseResults
          typesenseResponse,
        )
        let adaptedResponse = responseAdapter.adapt()

        // InstantSearch expects one result per request, so return the same adapted response for each request
        const adaptedResponses = instantsearchRequests.map(
          () => adaptedResponse,
        )

        return {
          results: adaptedResponses,
        }
      } else {
        // Handle regular multi-search response - multiple separate responses
        const multiSearchResponse = typesenseResponse
        const adaptedResponses =
          multiSearchResponse.results?.map((typesenseResult, index) => {
            this._validateTypesenseResult(typesenseResult)
            const responseAdapter = new SearchResponseAdapter(
              typesenseResult,
              instantsearchRequests[index],
              this.configuration,
              multiSearchResponse.results!,
              multiSearchResponse,
            )
            let adaptedResponse = responseAdapter.adapt()

            return adaptedResponse
          }) ?? []

        return {
          results: adaptedResponses,
        }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async searchTypesenseForFacetValuesAndAdapt(
    instantsearchRequests: Parameters<
      NonNullable<SearchClient["searchForFacetValues"]>
    >[0],
  ): Promise<AdaptedFacetSearchResponse[]> {
    let typesenseResponse: MultiSearchResponse
    try {
      typesenseResponse = await this._adaptAndPerformTypesenseRequest(
        instantsearchRequests,
      )

      const adaptedResponses =
        typesenseResponse.results?.map((typesenseResult, index) => {
          this._validateTypesenseResult(typesenseResult)
          const responseAdapter = new FacetSearchResponseAdapter(
            typesenseResult,
            // @ts-ignore
            instantsearchRequests[index],
          )
          return responseAdapter.adapt()
        }) ?? []

      return adaptedResponses
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async _adaptAndPerformTypesenseRequest(
    instantsearchRequests:
      | Parameters<NonNullable<SearchClient["searchForFacetValues"]>>[0]
      | Parameters<SearchClient["search"]>[0],
  ) {
    const requestAdapter = new SearchRequestAdapter(
      instantsearchRequests as any,
      this.shopperClient,
      this.configuration,
    )
    const typesenseResponse = await requestAdapter.request()
    return typesenseResponse
  }

  clearCache(): SearchClient & { clearCache: () => SearchClient } {
    // No cache to clear with the shopper client
    return this.searchClient
  }

  updateConfiguration(options: any): boolean {
    this.configuration = new Configuration(options)
    this.configuration.validate()
    // Update the client reference if provided
    if (options.client) {
      this.shopperClient = options.client
    }
    return true
  }

  _validateTypesenseResult(typesenseResult: TypesenseResult): void {
    if (typesenseResult.error) {
      throw new Error(`${typesenseResult.code} - ${typesenseResult.error}`)
    }
    if (!typesenseResult.hits && !typesenseResult.grouped_hits) {
      throw new Error(
        `Did not find any hits. ${typesenseResult.code} - ${typesenseResult.error}`,
      )
    }
  }
}
