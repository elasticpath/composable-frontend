"use strict"

interface ServerNode {
  host: string
  port: string
  path: string
  protocol: string
}

interface Server {
  nodes: ServerNode[]
  cacheSearchResultsForSeconds?: number
}

export interface SearchParameters {
  query_by?: string
  queryBy?: string
  preset?: string
  sort_by?: string
  sortBy?: string
  highlight_full_fields?: string
  highlightFullFields?: string
  [key: string]: any
}

export interface CollectionSpecificSearchParameters {
  [collection: string]: SearchParameters
}

interface FacetByOptions {
  [key: string]: string
}

interface FilterByOptions {
  [key: string]: string
}

interface SortByOptions {
  [key: string]: string
}

interface CollectionSpecificOptions {
  [collection: string]: {
    [key: string]: string
  }
}

interface ConfigurationOptions {
  server?: Server // Deprecated - for backward compatibility
  client?: any // Pre-configured Shopper SDK client instance
  headers?: Record<string, string> // HTTP headers for requests
  additionalSearchParameters?: SearchParameters
  geoLocationField?: string
  facetableFieldsWithSpecialCharacters?: string[]
  collectionSpecificSearchParameters?: CollectionSpecificSearchParameters
  renderingContent?: any
  flattenGroupedHits?: boolean
  facetByOptions?: FacetByOptions
  filterByOptions?: FilterByOptions
  sortByOptions?: SortByOptions
  collectionSpecificFacetByOptions?: CollectionSpecificOptions
  collectionSpecificFilterByOptions?: CollectionSpecificOptions
  collectionSpecificSortByOptions?: CollectionSpecificOptions
  union?: boolean
}

export class Configuration {
  server: Server // Deprecated - for backward compatibility
  client?: any // Pre-configured Shopper SDK client instance
  headers?: Record<string, string>
  additionalSearchParameters: SearchParameters
  geoLocationField: string
  facetableFieldsWithSpecialCharacters: string[]
  collectionSpecificSearchParameters: CollectionSpecificSearchParameters
  renderingContent: any
  flattenGroupedHits: boolean
  facetByOptions: FacetByOptions
  filterByOptions: FilterByOptions
  sortByOptions: SortByOptions
  collectionSpecificFacetByOptions: CollectionSpecificOptions
  collectionSpecificFilterByOptions: CollectionSpecificOptions
  collectionSpecificSortByOptions: CollectionSpecificOptions
  union: boolean

  constructor(options: ConfigurationOptions = {}) {
    // Keep server for backward compatibility
    this.server = options.server || {
      nodes: [
        {
          host: "localhost",
          port: "8108",
          path: "",
          protocol: "http",
        },
      ],
    }

    this.server.cacheSearchResultsForSeconds =
      this.server.cacheSearchResultsForSeconds ?? 2 * 60

    // Store client reference and headers
    this.client = options.client
    this.headers = options.headers

    this.additionalSearchParameters = options.additionalSearchParameters ?? {}

    this.additionalSearchParameters.query_by =
      this.additionalSearchParameters.queryBy ??
      this.additionalSearchParameters.query_by ??
      ""

    this.additionalSearchParameters.preset =
      this.additionalSearchParameters.preset ??
      this.additionalSearchParameters.preset ??
      ""

    this.additionalSearchParameters.sort_by =
      this.additionalSearchParameters.sortBy ??
      this.additionalSearchParameters.sort_by ??
      ""

    this.additionalSearchParameters.highlight_full_fields =
      this.additionalSearchParameters.highlightFullFields ??
      this.additionalSearchParameters.highlight_full_fields ??
      this.additionalSearchParameters.query_by

    this.geoLocationField = options.geoLocationField ?? "_geoloc"
    this.facetableFieldsWithSpecialCharacters =
      options.facetableFieldsWithSpecialCharacters ?? []

    this.collectionSpecificSearchParameters =
      options.collectionSpecificSearchParameters ?? {}

    Object.keys(this.collectionSpecificSearchParameters).forEach(
      (collection) => {
        const params = this.collectionSpecificSearchParameters[collection]
        params.query_by = params.queryBy ?? params.query_by
        params.preset = params.preset ?? params.preset
        params.sort_by = params.sortBy ?? params.sort_by
        params.highlight_full_fields =
          params.highlightFullFields ??
          params.highlight_full_fields ??
          this.additionalSearchParameters.highlight_full_fields ??
          params.query_by

        // Remove undefined values
        Object.keys(params).forEach((key) =>
          params[key] === undefined ? delete params[key] : {},
        )
      },
    )

    this.renderingContent = options.renderingContent
    this.flattenGroupedHits = options.flattenGroupedHits ?? true
    this.facetByOptions = options.facetByOptions ?? {}
    this.filterByOptions = options.filterByOptions ?? {}
    this.sortByOptions = options.sortByOptions ?? {}
    this.collectionSpecificFacetByOptions =
      options.collectionSpecificFacetByOptions ?? {}
    this.collectionSpecificFilterByOptions =
      options.collectionSpecificFilterByOptions ?? {}
    this.collectionSpecificSortByOptions =
      options.collectionSpecificSortByOptions ?? {}
    this.union = options.union ?? false
  }

  validate(): void {
    // Check if client is provided
    if (!this.client && !this.server?.nodes?.length) {
      throw new Error(
        "[elastic-path-instantsearch-adapter] Missing parameter: client is required. Please provide a pre-configured Elastic Path shopper SDK client instance.",
      )
    }

    // Warn if camelCased parameters are used, suggest using snake_cased parameters instead
    if (
      this.additionalSearchParameters.queryBy ||
      Object.values(this.collectionSpecificSearchParameters).some(
        (c) => c.queryBy,
      )
    ) {
      console.warn(
        "[elastic-path-instantsearch-adapter] Please use snake_cased versions of parameters in additionalSearchParameters instead of camelCased parameters. For example: Use query_by instead of queryBy. camelCased parameters will be deprecated in a future version.",
      )
    }

    /*
     * Either additionalSearchParameters.query_by or additionalSearchParameters.preset needs to be set, or
     *   All collectionSpecificSearchParameters need to have query_by or preset
     *
     * */
    const queryBy = this.additionalSearchParameters.query_by || ""
    const preset = this.additionalSearchParameters.preset || ""

    if (
      queryBy.length === 0 &&
      preset.length === 0 &&
      (Object.keys(this.collectionSpecificSearchParameters).length === 0 ||
        Object.values(this.collectionSpecificSearchParameters).some(
          (c) =>
            (c.query_by || "").length === 0 && (c.preset || "").length === 0,
        ))
    ) {
      throw new Error(
        "[elastic-path-instantsearch-adapter] Missing parameter: One of additionalSearchParameters.query_by or additionalSearchParameters.preset needs to be set, or all collectionSpecificSearchParameters need to have either .query_by or .preset set.",
      )
    }
  }
}
