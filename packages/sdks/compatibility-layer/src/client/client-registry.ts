import type { BridgeConfig, StorageAdapter, TokenProvider } from "../types"
import { SharedAuthState } from "../auth/shared-auth-state"
import { createLegacyStorageBridge } from "../auth/legacy-storage-bridge"
import { createBridgedFetch } from "./create-bridged-client"

/**
 * Auth type for client configuration.
 */
export type AuthType =
  | "implicit"
  | "client_credentials"
  | "password"
  | "sso"
  | "jwt"

/**
 * Configuration for a named client instance.
 */
export interface ClientInstanceConfig {
  /** Unique name for this client instance */
  name: string
  /** Authentication type */
  authType: AuthType
  /** Base URL for API calls */
  baseUrl: string
  /** Client ID for authentication */
  clientId: string
  /** Client secret (required for client_credentials) */
  clientSecret?: string
  /** Storage adapter or shorthand */
  storage?: StorageAdapter | "localStorage" | "cookie" | "memory"
  /** Legacy storage key (if sharing with old SDK) */
  legacyStorageKey?: string
  /** Default headers */
  headers?: Record<string, string>
  /** Retry configuration */
  retry?: BridgeConfig["retry"]
  /** Throttle configuration */
  throttle?: BridgeConfig["throttle"]
  /** Leeway for token expiration */
  leewaySec?: number
}

/**
 * Result of creating/getting a client instance.
 */
export interface ClientInstance {
  /** The bridged fetch function */
  fetch: typeof fetch
  /** Shared auth state for token management */
  auth: SharedAuthState
  /** Configuration used */
  config: ClientInstanceConfig
}

/**
 * Registry for managing multiple client instances.
 *
 * This supports Commerce Manager's pattern of having separate clients
 * for different auth contexts (admin, shopper, preview, etc.).
 *
 * @example
 * ```typescript
 * const registry = new ClientRegistry()
 *
 * // Create admin client with client_credentials
 * const admin = registry.getOrCreate({
 *   name: 'admin',
 *   authType: 'client_credentials',
 *   baseUrl: 'https://api.elasticpath.com',
 *   clientId: 'xxx',
 *   clientSecret: 'yyy',
 *   storage: 'memory',  // Don't persist admin tokens
 * })
 *
 * // Create shopper client with implicit grant
 * const shopper = registry.getOrCreate({
 *   name: 'shopper',
 *   authType: 'implicit',
 *   baseUrl: 'https://api.elasticpath.com',
 *   clientId: 'zzz',
 *   storage: 'localStorage',
 * })
 * ```
 */
export class ClientRegistry {
  private clients = new Map<string, ClientInstance>()

  /**
   * Get an existing client or create a new one.
   */
  getOrCreate(config: ClientInstanceConfig): ClientInstance {
    const existing = this.clients.get(config.name)
    if (existing) {
      return existing
    }

    const instance = this.createInstance(config)
    this.clients.set(config.name, instance)
    return instance
  }

  /**
   * Get an existing client by name.
   */
  get(name: string): ClientInstance | undefined {
    return this.clients.get(name)
  }

  /**
   * Check if a client exists.
   */
  has(name: string): boolean {
    return this.clients.has(name)
  }

  /**
   * Remove and dispose a client instance.
   */
  remove(name: string): boolean {
    const instance = this.clients.get(name)
    if (instance) {
      instance.auth.dispose()
      this.clients.delete(name)
      return true
    }
    return false
  }

  /**
   * Get all client names.
   */
  names(): string[] {
    return Array.from(this.clients.keys())
  }

  /**
   * Remove all clients.
   */
  clear(): void {
    for (const instance of this.clients.values()) {
      instance.auth.dispose()
    }
    this.clients.clear()
  }

  /**
   * Create a client instance from config.
   */
  private createInstance(config: ClientInstanceConfig): ClientInstance {
    const storage = this.resolveStorage(config)
    const tokenProvider = this.createTokenProvider(config)

    const { fetch, auth } = createBridgedFetch({
      baseUrl: config.baseUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      storage,
      tokenProvider,
      headers: config.headers,
      retry: config.retry,
      throttle: config.throttle,
      leewaySec: config.leewaySec,
    })

    return { fetch, auth, config }
  }

  /**
   * Resolve storage for the client.
   */
  private resolveStorage(config: ClientInstanceConfig): StorageAdapter {
    if (typeof config.storage === "object" && config.storage !== null) {
      return config.storage
    }

    const backend = config.storage ?? "localStorage"
    return createLegacyStorageBridge({
      key: config.legacyStorageKey,
      name: config.name,
      backend,
    })
  }

  /**
   * Create token provider based on auth type.
   */
  private createTokenProvider(config: ClientInstanceConfig): TokenProvider {
    switch (config.authType) {
      case "implicit":
        return this.createImplicitTokenProvider(config)
      case "client_credentials":
        return this.createClientCredentialsTokenProvider(config)
      case "password":
      case "sso":
      case "jwt":
        // These require external token setting
        return this.createManualTokenProvider(config)
      default:
        throw new Error(`Unknown auth type: ${config.authType}`)
    }
  }

  /**
   * Create token provider for implicit grant.
   */
  private createImplicitTokenProvider(
    config: ClientInstanceConfig
  ): TokenProvider {
    return async () => {
      // Use globalThis.fetch to avoid circular dependencies with the bridged fetch
      const response = await globalThis.fetch(`${config.baseUrl}/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "implicit",
          client_id: config.clientId,
        }).toString(),
      })

      if (!response.ok) {
        throw new Error(`Implicit token fetch failed: ${response.status}`)
      }

      return response.json()
    }
  }

  /**
   * Create token provider for client_credentials grant.
   */
  private createClientCredentialsTokenProvider(
    config: ClientInstanceConfig
  ): TokenProvider {
    if (!config.clientSecret) {
      throw new Error(
        `Client secret required for client_credentials auth type (client: ${config.name})`
      )
    }

    return async () => {
      // Use globalThis.fetch to avoid circular dependencies with the bridged fetch
      const response = await globalThis.fetch(`${config.baseUrl}/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: config.clientId,
          client_secret: config.clientSecret!,
        }).toString(),
      })

      if (!response.ok) {
        throw new Error(
          `Client credentials token fetch failed: ${response.status}`
        )
      }

      return response.json()
    }
  }

  /**
   * Create token provider that throws (requires manual token setting).
   */
  private createManualTokenProvider(
    config: ClientInstanceConfig
  ): TokenProvider {
    return async () => {
      throw new Error(
        `Auth type '${config.authType}' requires manual token setting via auth.setToken(). ` +
          `Use the auth object returned from getOrCreate() to set tokens after external authentication.`
      )
    }
  }
}

/**
 * Global client registry singleton.
 * Use this for simple cases where a single registry is sufficient.
 */
export const clientRegistry = new ClientRegistry()
