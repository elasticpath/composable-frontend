"use strict"

import { Configuration } from "./Configuration"
import { Client as ShopperSearchClient } from "@epcc-sdk/sdks-shopper"
import { SearchRequestAdapter } from "./SearchRequestAdapter"
import { SearchResponseAdapter } from "./SearchResponseAdapter"
import { FacetSearchResponseAdapter } from "./FacetSearchResponseAdapter"

interface InstantSearchRequest {
  indexName: string
  params: any
}

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

interface TypesenseMultiSearchResponse {
  results: TypesenseResult[]
  union_request_params?: any[]
  [key: string]: any
}

interface InstantSearchClient {
  clearCache: () => InstantSearchClient
  search: (
    instantsearchRequests: InstantSearchRequest[],
  ) => Promise<{ results: AdaptedSearchResponse[] }>
  searchForFacetValues: (
    instantsearchRequests: InstantSearchRequest[],
  ) => Promise<AdaptedFacetSearchResponse[]>
}

export default class TypesenseInstantsearchAdapter {
  configuration: Configuration
  elasitcPathClient: ShopperSearchClient
  searchClient: InstantSearchClient

  constructor(options: any) {
    this.updateConfiguration(options)
    this.searchClient = {
      clearCache: () => this.clearCache(),
      search: (instantsearchRequests) =>
        this.searchTypesenseAndAdapt(instantsearchRequests),
      searchForFacetValues: (instantsearchRequests) =>
        this.searchTypesenseForFacetValuesAndAdapt(instantsearchRequests),
    }
  }

  async searchTypesenseAndAdapt(
    instantsearchRequests: InstantSearchRequest[],
  ): Promise<{ results: AdaptedSearchResponse[] }> {
    let typesenseResponse: TypesenseMultiSearchResponse | TypesenseResult
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
        this._validateTypesenseResult(typesenseResponse as TypesenseResult)
        const responseAdapter = new SearchResponseAdapter(
          typesenseResponse as any,
          instantsearchRequests[0], // Use first request as base
          this.configuration,
          [typesenseResponse as any], // Pass single response as allTypesenseResults
          typesenseResponse as any,
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
        const multiSearchResponse =
          typesenseResponse as TypesenseMultiSearchResponse
        const adaptedResponses = multiSearchResponse.results.map(
          (typesenseResult, index) => {
            this._validateTypesenseResult(typesenseResult)
            const responseAdapter = new SearchResponseAdapter(
              typesenseResult,
              instantsearchRequests[index],
              this.configuration,
              multiSearchResponse.results,
              multiSearchResponse as any,
            )
            let adaptedResponse = responseAdapter.adapt()

            return adaptedResponse
          },
        )

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
    instantsearchRequests: InstantSearchRequest[],
  ): Promise<AdaptedFacetSearchResponse[]> {
    let typesenseResponse: TypesenseMultiSearchResponse
    try {
      typesenseResponse = (await this._adaptAndPerformTypesenseRequest(
        instantsearchRequests,
      )) as TypesenseMultiSearchResponse

      const adaptedResponses = typesenseResponse.results.map(
        (typesenseResult, index) => {
          this._validateTypesenseResult(typesenseResult)
          const responseAdapter = new FacetSearchResponseAdapter(
            typesenseResult,
            instantsearchRequests[index],
            this.configuration,
          )
          return responseAdapter.adapt()
        },
      )

      return adaptedResponses
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async _adaptAndPerformTypesenseRequest(
    instantsearchRequests: InstantSearchRequest[],
  ): Promise<TypesenseMultiSearchResponse | TypesenseResult> {
    const requestAdapter = new SearchRequestAdapter(
      instantsearchRequests,
      this.typesenseClient,
      this.configuration,
    )
    const typesenseResponse = await requestAdapter.request()
    return typesenseResponse
  }

  clearCache(): InstantSearchClient {
    // this.typesenseClient = new TypesenseSearchClient(this.configuration.server);
    return this.searchClient
  }

  updateConfiguration(options: any): boolean {
    this.configuration = new Configuration(options)
    this.configuration.validate()
    this.typesenseClient = new TypesenseSearchClient(this.configuration.server)
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
