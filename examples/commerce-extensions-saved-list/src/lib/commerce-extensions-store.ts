import "server-only"

import {
  client,
  createACustomEntry,
  deleteACustomEntry,
  getACustomEntry,
  getAllCustomApis,
  getAllCustomEntries,
} from "@epcc-sdk/commerce-extensions"
import { SAVED_LIST_API_TYPE, SAVED_LIST_SLUG } from "../app/constants"
import { getServerAccessToken } from "./server-credentials"
import type { SavedListEntry, SavedListEntryStore } from "./saved-list"

/**
 * The transport half of the saved list: it turns `SavedListEntryStore` calls
 * into Commerce Extensions requests and nothing else. Every ownership decision
 * lives in `saved-list.ts`, so this file has no reason to know about accounts
 * beyond passing a filter through.
 *
 * It uses the settings endpoint (`/v2/settings/extensions/custom-apis/{id}/…`)
 * rather than the slug endpoint (`/v2/extensions/{slug}`). The two read and
 * write the same records. The settings endpoint is the one this SDK types a
 * request body and a `filter` query for, and this code already runs in an admin
 * capacity with a client_credentials token, which is what that endpoint is for.
 */

let configured = false

function configureClient() {
  if (configured) return

  client.setConfig({ baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL! })
  client.interceptors.request.use(async (request) => {
    request.headers.set(
      "Authorization",
      `Bearer ${await getServerAccessToken()}`,
    )
    return request
  })

  configured = true
}

let customApiId: string | undefined

/**
 * Resolves the Custom API created by `pnpm provision`, by slug.
 *
 * Returns `undefined` when the store has no such Custom API, which is the store
 * setup requirement this example reports on the configuration error page.
 */
export async function resolveSavedListCustomApiId(): Promise<
  string | undefined
> {
  if (customApiId) return customApiId

  configureClient()

  const response = await getAllCustomApis({
    query: { filter: `eq(slug,${SAVED_LIST_SLUG})` },
  })

  customApiId = response.data?.data?.[0]?.id
  return customApiId
}

function toSavedListEntry(entry: Record<string, unknown>): SavedListEntry {
  return {
    id: String(entry.id),
    account_id: String(entry.account_id ?? ""),
    product_id: String(entry.product_id ?? ""),
  }
}

export function createSavedListEntryStore(
  customApiIdForStore: string,
): SavedListEntryStore {
  configureClient()

  const path = { custom_api_id: customApiIdForStore }

  return {
    async list(filter) {
      const response = await getAllCustomEntries({
        path,
        query: { filter, "page[limit]": BigInt(100) },
      })

      if (!response.data?.data) {
        throw new Error("Failed to read saved list entries")
      }

      return response.data.data.map(toSavedListEntry)
    },

    async get(entryId) {
      const response = await getACustomEntry({
        path: { ...path, custom_api_entry_id: entryId },
      })

      if (!response.data?.data) {
        return null
      }

      return toSavedListEntry(response.data.data)
    },

    async create(values) {
      const response = await createACustomEntry({
        path,
        body: { data: { type: SAVED_LIST_API_TYPE, ...values } },
      })

      if (!response.data?.data) {
        throw new Error("Failed to create a saved list entry")
      }

      return toSavedListEntry(response.data.data)
    },

    async remove(entryId) {
      const response = await deleteACustomEntry({
        path: { ...path, custom_api_entry_id: entryId },
      })

      if (response.error) {
        throw new Error("Failed to delete a saved list entry")
      }
    },
  }
}
