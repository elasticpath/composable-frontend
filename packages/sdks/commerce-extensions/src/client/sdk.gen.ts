// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options } from "@hey-api/client-fetch"
import type {
  GetAllCustomApisData,
  GetAllCustomApisResponse,
  GetAllCustomApisError,
  CreateACustomApiData,
  CreateACustomApiResponse,
  CreateACustomApiError,
  DeleteACustomApiData,
  DeleteACustomApiResponse,
  DeleteACustomApiError,
  GetACustomApiData,
  GetACustomApiResponse,
  GetACustomApiError,
  UpdateACustomApiData,
  UpdateACustomApiResponse,
  UpdateACustomApiError,
  GetAllCustomFieldsData,
  GetAllCustomFieldsResponse,
  GetAllCustomFieldsError,
  CreateACustomFieldData,
  CreateACustomFieldResponse,
  CreateACustomFieldError,
  DeleteACustomFieldData,
  DeleteACustomFieldResponse,
  DeleteACustomFieldError,
  GetACustomFieldData,
  GetACustomFieldResponse,
  GetACustomFieldError,
  UpdateACustomFieldData,
  UpdateACustomFieldResponse,
  UpdateACustomFieldError,
  GetAllCustomEntriesData,
  GetAllCustomEntriesResponse,
  GetAllCustomEntriesError,
  CreateACustomEntryData,
  CreateACustomEntryResponse,
  CreateACustomEntryError,
  DeleteACustomEntryData,
  DeleteACustomEntryResponse,
  DeleteACustomEntryError,
  GetACustomEntryData,
  GetACustomEntryResponse,
  GetACustomEntryError,
  UpdateACustomEntryData,
  UpdateACustomEntryResponse,
  UpdateACustomEntryError,
  GetCustomEntriesSettingsData,
  CreateACustomEntrySettingsData,
  DeleteACustomEntrySettingsData,
  GetACustomEntrySettingsData,
  PutACustomEntrySettingsData,
} from "./types.gen"

export const client = createClient(createConfig())

/**
 * Get all Custom APIs
 * Get all Custom APIs
 *
 * ## Filtering
 * The following operators and attributes are available for [filtering](/guides/Getting-Started/filtering) Custom APIs:
 *
 * | Attribute     | Operators                     | Example                                       |
 * |---------------|-------------------------------|-----------------------------------------------|
 * | `name`        | `eq`,`like`                   | `eq(name,"Wishlist")`                         |
 * | `description` | `eq`,`like`                   | `like(description,*list*)`                   |
 * | `slug`        | `eq`,`like`,`in`              | `like(slug,*lists)`                           |
 * | `api_type`    | `eq`,`like`,`in`              | `like(api_type,wishlist*)`                    |
 * | `id`          | `lt`,`le`,`eq`,`gt`,`ge`,`in` | `eq(id,7e067539-6f6c-46e1-8c55-940031b36c6a)` |
 * | `created_at`  | `lt`,`le`,`eq`,`gt`,`ge`      | `ge(created_at,2024-04-29T00:00:00.000Z)`     |
 * | `updated_at`  | `lt`,`le`,`eq`,`gt`,`ge`      | `le(updated_at,2024-04-29T00:00:00.000Z)`     |
 *
 * ## Sorting
 * The following attributes are available for sorting. When specified, the results are sorted in ascending order based on the value of the field. To sort in descending order, prefix the attribute with `-`, for example, `-updated_at`. The default sort order is `created_at` in descending order.
 * - `name`
 * - `slug`
 * - `api_type`
 * - `id`
 * - `created_at`
 * - `updated_at`
 *
 */
export const getAllCustomApis = <ThrowOnError extends boolean = false>(
  options?: Options<GetAllCustomApisData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetAllCustomApisResponse,
    GetAllCustomApisError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/extensions/custom-apis",
  })
}

/**
 * Create a Custom API
 */
export const createACustomApi = <ThrowOnError extends boolean = false>(
  options?: Options<CreateACustomApiData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    CreateACustomApiResponse,
    CreateACustomApiError,
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
    url: "/v2/settings/extensions/custom-apis",
  })
}

/**
 * Delete a Custom API
 */
export const deleteACustomApi = <ThrowOnError extends boolean = false>(
  options: Options<DeleteACustomApiData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    DeleteACustomApiResponse,
    DeleteACustomApiError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}",
  })
}

/**
 * Get a Custom API
 */
export const getACustomApi = <ThrowOnError extends boolean = false>(
  options: Options<GetACustomApiData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetACustomApiResponse,
    GetACustomApiError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}",
  })
}

/**
 * Update a Custom API
 */
export const updateACustomApi = <ThrowOnError extends boolean = false>(
  options: Options<UpdateACustomApiData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateACustomApiResponse,
    UpdateACustomApiError,
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
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}",
  })
}

/**
 * Get all Custom Fields
 * Get all Custom Fields
 *
 * ## Filtering
 * The following operators and attributes are available for [filtering](/guides/Getting-Started/filtering) Custom Fields:
 *
 * | Attribute     | Operators                     | Example                                       |
 * |---------------|-------------------------------|-----------------------------------------------|
 * | `name`        | `eq`,`like`                   | `eq(name,"Last Name")`                        |
 * | `description` | `eq`,`like`                   | `like(description,*confidential*)`            |
 * | `slug`        | `eq`,`like`,`in`              | `like(slug,*private*)`                        |
 * | `field_type`  | `eq`,`in`                     | `eq(field_type,string)`                       |
 * | `id`          | `lt`,`le`,`eq`,`gt`,`ge`,`in` | `eq(id,859aeba1-03c2-4822-bd4c-89afce93d7eb)` |
 * | `created_at`  | `lt`,`le`,`eq`,`gt`,`ge`      | `ge(created_at,2024-04-29T00:00:00.000Z)`     |
 * | `updated_at`  | `lt`,`le`,`eq`,`gt`,`ge`      | `le(updated_at,2024-04-29T00:00:00.000Z)`     |
 *
 * ## Sorting
 * The following attributes are available for sorting. When specified, the results are sorted in ascending order based on the value of the field. To sort in descending order, prefix the attribute with `-`, for example, `-updated_at`. The default sort order is `created_at` in descending order.
 * - `name`
 * - `slug`
 * - `field_type`
 * - `id`
 * - `created_at`
 * - `updated_at`
 *
 */
export const getAllCustomFields = <ThrowOnError extends boolean = false>(
  options: Options<GetAllCustomFieldsData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetAllCustomFieldsResponse,
    GetAllCustomFieldsError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}/fields",
  })
}

/**
 * Create a Custom Field
 */
export const createACustomField = <ThrowOnError extends boolean = false>(
  options: Options<CreateACustomFieldData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    CreateACustomFieldResponse,
    CreateACustomFieldError,
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
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}/fields",
  })
}

/**
 * Delete a Custom Field
 */
export const deleteACustomField = <ThrowOnError extends boolean = false>(
  options: Options<DeleteACustomFieldData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    DeleteACustomFieldResponse,
    DeleteACustomFieldError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}/fields/{custom_field_id}",
  })
}

/**
 * Get a Custom Field
 */
export const getACustomField = <ThrowOnError extends boolean = false>(
  options: Options<GetACustomFieldData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetACustomFieldResponse,
    GetACustomFieldError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}/fields/{custom_field_id}",
  })
}

/**
 * Update a Custom Field
 */
export const updateACustomField = <ThrowOnError extends boolean = false>(
  options: Options<UpdateACustomFieldData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateACustomFieldResponse,
    UpdateACustomFieldError,
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
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}/fields/{custom_field_id}",
  })
}

/**
 * Get all Custom API Entries
 * Get all Custom API Entries
 *
 * ## Filtering
 * The following operators and attributes are available for [filtering](/guides/Getting-Started/filtering) all Custom API Entries:
 *
 * | Attribute     | Operators                     | Example                                       |
 * |---------------|-------------------------------|-----------------------------------------------|
 * | `id`          | `lt`,`le`,`eq`,`gt`,`ge`,`in` | `eq(id,859aeba1-03c2-4822-bd4c-89afce93d7eb)` |
 * | `created_at`  | `lt`,`le`,`eq`,`gt`,`ge`      | `ge(created_at,2024-04-29T00:00:00.000Z)`     |
 * | `updated_at`  | `lt`,`le`,`eq`,`gt`,`ge`      | `le(updated_at,2024-04-29T00:00:00.000Z)`     |
 *
 * The following operators and attributes may be available for filtering Custom API Entries depending on how the [Custom Fields](/docs/api/commerce-extensions/create-a-custom-field) for that Custom API are configured.
 *
 * | Field type | Operators                            |
 * |------------|--------------------------------------|
 * | `string`   | `lt`,`le`,`eq`,`gt`,`ge`,`in`,`like` |
 * | `integer`  | `lt`,`le`,`eq`,`gt`,`ge`,`in`        |
 * | `float`    | `lt`,`le`,`gt`,`ge`,`in`             |
 * | `boolean`  | `eq`                                 |
 *
 * Given there is a Custom Field with `"slug": "name"` and `"field_type": "string"`.
 *
 * When you get all Custom API Entries with query parameter: `?filter=like(name,*wish*)`.
 *
 * Then you will get all Custom API Entries where `name` contains the string `wish`.
 *
 * ## Sorting
 * The following attributes are available for sorting. When specified, the results are sorted in ascending order based on the value of the field. To sort in descending order, prefix the attribute with `-`, for example, `-updated_at`. The default sort order is `created_at` in descending order.
 * - `id`
 * - `created_at`
 * - `updated_at`
 *
 */
export const getAllCustomEntries = <ThrowOnError extends boolean = false>(
  options: Options<GetAllCustomEntriesData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetAllCustomEntriesResponse,
    GetAllCustomEntriesError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}/entries",
  })
}

/**
 * Create a Custom API Entry using the settings endpoint
 */
export const createACustomEntry = <ThrowOnError extends boolean = false>(
  options: Options<CreateACustomEntryData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    CreateACustomEntryResponse,
    CreateACustomEntryError,
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
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}/entries",
  })
}

/**
 * Delete a Custom API Entry
 */
export const deleteACustomEntry = <ThrowOnError extends boolean = false>(
  options: Options<DeleteACustomEntryData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    DeleteACustomEntryResponse,
    DeleteACustomEntryError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}/entries/{custom_api_entry_id}",
  })
}

/**
 * Get a Custom API Entry using the settings endpoint
 */
export const getACustomEntry = <ThrowOnError extends boolean = false>(
  options: Options<GetACustomEntryData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetACustomEntryResponse,
    GetACustomEntryError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}/entries/{custom_api_entry_id}",
  })
}

/**
 * Update a Custom API Entry using the settings endpoint
 */
export const updateACustomEntry = <ThrowOnError extends boolean = false>(
  options: Options<UpdateACustomEntryData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateACustomEntryResponse,
    UpdateACustomEntryError,
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
    url: "/v2/settings/extensions/custom-apis/{custom_api_id}/entries/{custom_api_entry_id}",
  })
}

/**
 * Get all Custom API Entries using the extensions endpoint
 */
export const getCustomEntriesSettings = <ThrowOnError extends boolean = false>(
  options: Options<GetCustomEntriesSettingsData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<unknown, unknown, ThrowOnError>({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/extensions/{custom_api_slug}",
  })
}

/**
 * Create a Custom API Entry using the extensions endpoint
 */
export const createACustomEntrySettings = <
  ThrowOnError extends boolean = false,
>(
  options: Options<CreateACustomEntrySettingsData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<unknown, unknown, ThrowOnError>({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/extensions/{custom_api_slug}",
  })
}

/**
 * Delete a Custom API Entry using the extensions endpoint
 */
export const deleteACustomEntrySettings = <
  ThrowOnError extends boolean = false,
>(
  options: Options<DeleteACustomEntrySettingsData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<unknown, unknown, ThrowOnError>({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/extensions/{custom_api_slug}/{custom_api_entry_id}",
  })
}

/**
 * Get a Custom API Entry using the extensions endpoint
 */
export const getACustomEntrySettings = <ThrowOnError extends boolean = false>(
  options: Options<GetACustomEntrySettingsData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<unknown, unknown, ThrowOnError>({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/extensions/{custom_api_slug}/{custom_api_entry_id}",
  })
}

/**
 * Update a Custom API Entry using the extensions endpoint
 */
export const putACustomEntrySettings = <ThrowOnError extends boolean = false>(
  options: Options<PutACustomEntrySettingsData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<unknown, unknown, ThrowOnError>({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/extensions/{custom_api_slug}/{custom_api_entry_id}",
  })
}
