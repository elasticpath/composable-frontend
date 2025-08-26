import { AccessTokenResponse } from "../client"

export type TokenProvider = (opts: {
  current?: string
}) => Promise<AccessTokenResponse>

export function createAuth(
  storage: import("./storage").StorageAdapter,
  tokenProvider: TokenProvider,
  leewaySec = 60,
) {
  let accessToken = storage.get()
  let expiresAt = decodeExp(accessToken) ?? 0
  let refreshing: Promise<string> | undefined

  // Optional cross-tab sync (localStorage adapter implements subscribe)
  storage.subscribe?.(() => {
    accessToken = storage.get()
    expiresAt = decodeExp(accessToken) ?? 0
  })

  function decodeExp(jwt?: string): number | undefined {
    if (!jwt) return undefined
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]))
      return typeof payload?.exp === "number" ? payload.exp : undefined
    } catch {
      return undefined
    }
  }

  function isExpired(): boolean {
    if (!accessToken) return true
    const exp = expiresAt
    if (!exp) return true
    const now = Math.floor(Date.now() / 1000)
    return now >= exp - leewaySec
  }

  async function refresh(): Promise<string> {
    if (refreshing) return refreshing
    refreshing = (async () => {
      const res = await tokenProvider({ current: accessToken })
      accessToken = res.access_token
      expiresAt =
        decodeExp(accessToken) ??
        Math.floor(Date.now() / 1000) + (res.expires_in ?? 300)
      storage.set(accessToken)
      return accessToken!
    })()
    try {
      return await refreshing
    } finally {
      refreshing = undefined
    }
  }

  async function getValidAccessToken(): Promise<string> {
    if (accessToken && !isExpired()) return accessToken
    return refresh()
  }

  function clear() {
    accessToken = undefined
    expiresAt = 0
    storage.set(undefined)
  }

  function getSnapshot() {
    return accessToken
  }

  return { getValidAccessToken, refresh, clear, getSnapshot }
}

export type Auth = ReturnType<typeof createAuth>
