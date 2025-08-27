import { AccessTokenResponse } from "../client"

export type TokenProvider = (opts: {
  current?: string
}) => Promise<AccessTokenResponse>

export function createAuth(
  storage: import("./storage").StorageAdapter,
  tokenProvider: TokenProvider,
  leewaySec = 60,
) {
  let credentials: AccessTokenResponse | undefined
  let refreshing: Promise<string> | undefined

  // Load stored credentials on initialization
  function loadStoredCredentials() {
    const storedData = storage.get()
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        if (parsed.access_token) {
          credentials = parsed
        }
      } catch {
        // Not JSON, assume it's a legacy plain token
        credentials = { access_token: storedData } as AccessTokenResponse
      }
    }
  }

  loadStoredCredentials()

  // Optional cross-tab sync (localStorage adapter implements subscribe)
  storage.subscribe?.(() => {
    loadStoredCredentials()
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
    if (!credentials?.access_token) return true
    
    // Try to decode exp from JWT
    const jwtExp = decodeExp(credentials.access_token)
    if (jwtExp) {
      const now = Math.floor(Date.now() / 1000)
      return now >= jwtExp - leewaySec
    }
    
    // Use the expires field if available (absolute timestamp)
    if (credentials.expires) {
      const now = Math.floor(Date.now() / 1000)
      return now >= credentials.expires - leewaySec
    }
    
    // If we can't determine expiration, consider it expired
    return true
  }

  async function refresh(): Promise<string> {
    if (refreshing) return refreshing
    refreshing = (async () => {
      const res = await tokenProvider({ current: credentials?.access_token })
      credentials = res
      
      // Store the credentials object directly
      storage.set(JSON.stringify(res))
      
      return credentials.access_token!
    })()
    try {
      return await refreshing
    } finally {
      refreshing = undefined
    }
  }

  async function getValidAccessToken(): Promise<string> {
    if (credentials?.access_token && !isExpired()) return credentials.access_token
    return refresh()
  }

  function clear() {
    credentials = undefined
    storage.set(undefined)
  }

  function getSnapshot() {
    return credentials?.access_token
  }

  return { getValidAccessToken, refresh, clear, getSnapshot }
}

export type Auth = ReturnType<typeof createAuth>
