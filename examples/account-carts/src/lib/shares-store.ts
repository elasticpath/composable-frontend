import "server-only"

import {
  client,
  createACustomApiEntry,
  deleteACustomEntry,
  getACustomEntry,
  listCustomApiEntries,
  listCustomApis,
} from "@epcc-sdk/commerce-extensions"
import { SHARES_API_TYPE, SHARES_SLUG } from "../app/constants"
import { getServerAccessToken } from "./server-credentials"
import { serverKeyEnv } from "./server-key-env"
import { storeEndpoint } from "./store-client"
import type { ShareUnavailableReason } from "./messages"
import { missingServerKeyRequirements } from "./store-requirements"
import {
  SHARE_TOKEN_PATTERN,
  findShareByToken,
  type ShareEntry,
  type ShareStore,
} from "./shares"

export class SharesUnavailableError extends Error {
  constructor(readonly reason: ShareUnavailableReason) {
    super(`Shares are unavailable: ${reason}`)
    this.name = "SharesUnavailableError"
  }
}

let configured = false

function configureClient() {
  if (configured) return

  client.setConfig({ baseUrl: storeEndpoint() })
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

async function resolveSharesCustomApiId(): Promise<string | undefined> {
  if (customApiId) return customApiId

  configureClient()

  const response = await listCustomApis({
    query: { filter: `eq(slug,${SHARES_SLUG})` },
  })

  if (response.error) {
    throw new SharesUnavailableError("unreachable")
  }

  customApiId = response.data?.data?.find(
    (customApi) => customApi.slug === SHARES_SLUG,
  )?.id

  return customApiId
}

export async function sharesCustomApiStatus(): Promise<
  "provisioned" | "missing" | "unreadable"
> {
  try {
    return (await resolveSharesCustomApiId()) ? "provisioned" : "missing"
  } catch {
    return "unreadable"
  }
}

function toShareEntry(entry: Record<string, unknown>): ShareEntry {
  return {
    id: String(entry.id),
    share_token: String(entry.share_token ?? ""),
    cart_id: String(entry.cart_id ?? ""),
    account_id: String(entry.account_id ?? ""),
    shared_at: String(entry.shared_at ?? ""),
  }
}

function createShareStore(customApiIdForStore: string): ShareStore {
  const path = { "custom-api-id": customApiIdForStore }

  return {
    async list(filter) {
      const entries: ShareEntry[] = []

      for (let page = 0; page < MAX_PAGES; page++) {
        const response = await listCustomApiEntries({
          path,
          query: {
            filter,
            "page[limit]": PAGE_SIZE,
            "page[offset]": page * PAGE_SIZE,
          },
        })

        if (response.error || !response.data?.data) {
          throw new Error("Failed to read share entries")
        }

        entries.push(...response.data.data.map(toShareEntry))

        if (response.data.data.length < PAGE_SIZE) {
          return entries
        }
      }

      throw new Error(
        `Shares exceed ${MAX_PAGES * PAGE_SIZE} entries, or the API ignored page[offset]`,
      )
    },

    async get(entryId) {
      const response = await getACustomEntry({
        path: { ...path, "custom-api-entry-id": entryId },
      })

      if (response.error) {
        if (response.response?.status === 404) return null
        throw new Error("Failed to read a share entry")
      }

      return response.data?.data ? toShareEntry(response.data.data) : null
    },

    async create(values) {
      const response = await createACustomApiEntry({
        path,
        body: { data: { type: SHARES_API_TYPE, ...values } },
      })

      if (response.error || !response.data?.data) {
        throw new Error("Failed to create a share entry")
      }

      return toShareEntry(response.data.data)
    },

    async remove(entryId) {
      const response = await deleteACustomEntry({
        path: { ...path, "custom-api-entry-id": entryId },
      })

      if (response.error) {
        throw new Error("Failed to delete a share entry")
      }
    },
  }
}

export async function openShareStore(): Promise<ShareStore> {
  if (missingServerKeyRequirements(serverKeyEnv()).length > 0) {
    throw new SharesUnavailableError("no-server-key")
  }

  const id = await resolveSharesCustomApiId()

  if (!id) {
    throw new SharesUnavailableError("not-provisioned")
  }

  return createShareStore(id)
}

export async function lookupShareByToken(
  token: string,
): Promise<ShareEntry | null> {
  if (!SHARE_TOKEN_PATTERN.test(token)) {
    return null
  }

  return findShareByToken(await openShareStore(), token)
}
