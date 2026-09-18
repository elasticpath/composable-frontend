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

const PAGE_SIZE = 100
const MAX_PAGES = 50

let customApiId: string | undefined

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
      const entries: SavedListEntry[] = []

      for (let page = 0; page < MAX_PAGES; page++) {
        const offset = page * PAGE_SIZE
        const response = await getAllCustomEntries({
          path,
          query: {
            filter,
            "page[limit]": BigInt(PAGE_SIZE),
            "page[offset]": BigInt(offset),
          },
        })

        if (!response.data?.data) {
          throw new Error("Failed to read saved list entries")
        }

        entries.push(...response.data.data.map(toSavedListEntry))

        if (response.data.data.length < PAGE_SIZE) {
          return entries
        }
      }

      throw new Error(
        `Saved list exceeds ${MAX_PAGES * PAGE_SIZE} entries, or the API ignored page[offset]`,
      )
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
