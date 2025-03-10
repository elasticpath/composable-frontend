// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options } from "@hey-api/client-fetch"
import type {
  ListStockData,
  ListStockResponse,
  ListStockError,
  CreateStockData,
  CreateStockResponse,
  CreateStockError,
  GetStockForProductsData,
  GetStockForProductsResponse,
  GetStockForProductsError,
  DeleteStockData,
  DeleteStockResponse,
  DeleteStockError,
  GetStockData,
  GetStockResponse,
  GetStockError,
  UpdateStockData,
  UpdateStockResponse,
  UpdateStockError,
  ListTransactionsData,
  ListTransactionsResponse,
  ListTransactionsError,
  CreateTransactionData,
  CreateTransactionResponse,
  CreateTransactionError,
  GetTransactionData,
  GetTransactionResponse,
  GetTransactionError,
  ListLocationsData,
  ListLocationsResponse,
  ListLocationsError,
  CreateLocationData,
  CreateLocationResponse,
  CreateLocationError,
  DeleteLocationData,
  DeleteLocationResponse,
  GetLocationData,
  GetLocationResponse,
  GetLocationError,
  UpdateLocationData,
  UpdateLocationResponse,
  UpdateLocationError,
} from "./types.gen"

export const client = createClient(createConfig())

/**
 * Get Stock for all Products
 * Returns all products and their associated stock.
 */
export const listStock = <ThrowOnError extends boolean = false>(
  options?: Options<ListStockData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    ListStockResponse,
    ListStockError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories",
  })
}

/**
 * Create Stock for Product
 * Sets the inventory quantity for the specified product.
 */
export const createStock = <ThrowOnError extends boolean = false>(
  options?: Options<CreateStockData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    CreateStockResponse,
    CreateStockError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories",
  })
}

/**
 * List Stock
 * Returns stock for all products matching the supplied unique identifiers.
 */
export const getStockForProducts = <ThrowOnError extends boolean = false>(
  options?: Options<GetStockForProductsData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    GetStockForProductsResponse,
    GetStockForProductsError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/multiple",
  })
}

/**
 * Delete Stock for Product
 * Deletes the inventory for the specified product. The product inventory is null and is no longer managed by Commerce. If you want to keep managing inventory but have none of the product in stock, set the inventory to `0` instead of deleting the inventory.
 */
export const deleteStock = <ThrowOnError extends boolean = false>(
  options: Options<DeleteStockData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    DeleteStockResponse,
    DeleteStockError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/{product_uuid}",
  })
}

/**
 * Get Stock for Product
 * Gets the stock for the product matching the specified unique identifier.
 */
export const getStock = <ThrowOnError extends boolean = false>(
  options: Options<GetStockData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetStockResponse,
    GetStockError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/{product_uuid}",
  })
}

/**
 * Update Stock for Product
 * Updates the inventory for the specified product.
 */
export const updateStock = <ThrowOnError extends boolean = false>(
  options: Options<UpdateStockData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateStockResponse,
    UpdateStockError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/{product_uuid}",
  })
}

/**
 * Get Stock Transactions for Product
 * Returns the transactions recorded for the specified product.
 */
export const listTransactions = <ThrowOnError extends boolean = false>(
  options: Options<ListTransactionsData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    ListTransactionsResponse,
    ListTransactionsError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/{product_uuid}/transactions",
  })
}

/**
 * Create Stock Transaction on Product
 */
export const createTransaction = <ThrowOnError extends boolean = false>(
  options: Options<CreateTransactionData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    CreateTransactionResponse,
    CreateTransactionError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/{product_uuid}/transactions",
  })
}

/**
 * Get Single Stock Transaction for Product
 * Returns the specific transaction with transaction_uuid for product_uuid
 */
export const getTransaction = <ThrowOnError extends boolean = false>(
  options: Options<GetTransactionData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetTransactionResponse,
    GetTransactionError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/{product_uuid}/transactions/{transaction_uuid}",
  })
}

/**
 * List Locations
 * Lists all Inventory Locations
 */
export const listLocations = <ThrowOnError extends boolean = false>(
  options?: Options<ListLocationsData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    ListLocationsResponse,
    ListLocationsError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/locations",
  })
}

/**
 * Create a Location
 * Creates an Inventory Location
 */
export const createLocation = <ThrowOnError extends boolean = false>(
  options?: Options<CreateLocationData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    CreateLocationResponse,
    CreateLocationError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/locations",
  })
}

/**
 * Delete a Location
 * Delete an Inventory Location
 */
export const deleteLocation = <ThrowOnError extends boolean = false>(
  options: Options<DeleteLocationData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    DeleteLocationResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/locations/{location_uuid}",
  })
}

/**
 * Get a Location
 * Get an Inventory Location
 */
export const getLocation = <ThrowOnError extends boolean = false>(
  options: Options<GetLocationData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetLocationResponse,
    GetLocationError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/locations/{location_uuid}",
  })
}

/**
 * Update a Location
 * Updates an Inventory Location
 */
export const updateLocation = <ThrowOnError extends boolean = false>(
  options: Options<UpdateLocationData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateLocationResponse,
    UpdateLocationError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/inventories/locations/{location_uuid}",
  })
}
