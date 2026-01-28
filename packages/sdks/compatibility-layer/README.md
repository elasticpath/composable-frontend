# @epcc-sdk/compatibility-layer

A compatibility layer that enables the new TypeScript SDKs to use the old JS SDK's battle-tested authentication, retry, and throttle logic.

## Overview

This package bridges the new `@epcc-sdk/*` TypeScript SDKs with the existing `@moltin/sdk` (old JS SDK), allowing both to share:

- **Authentication state** - Single source of truth for access tokens
- **Retry logic** - Exponential backoff with jitter on 401/429 errors
- **Request throttling** - Rate limiting to prevent API overload
- **Token storage** - Shared localStorage/cookie storage keys

**Zero changes to the old JS SDK are required.** The compatibility layer works entirely by:

1. Replicating the retry and throttle logic from the old SDK
2. Reading/writing to the same storage keys the old SDK uses
3. Using browser storage events to detect when either SDK updates tokens
4. Injecting a custom fetch function into the new SDKs

## Installation

```bash
pnpm add @epcc-sdk/compatibility-layer
```

## Quick Start

### Basic Usage

```typescript
import { client } from "@epcc-sdk/sdks-shopper"
import { getByContextAllProducts } from "@epcc-sdk/sdks-shopper"
import { createBridgedClient } from "@epcc-sdk/compatibility-layer"

// Configure the client with compatibility layer
const { client: shopperClient, auth } = createBridgedClient(client, {
  baseUrl: "https://api.moltin.com",
  clientId: "your-client-id",
  legacyStorageKey: "epCredentials", // Share with old SDK
  retry: { maxAttempts: 4 },
  throttle: { enabled: true },
})

// Use the type-safe SDK operations
const { data } = await getByContextAllProducts({ client: shopperClient })
```

### Sharing Auth with Old SDK

```typescript
import { gateway } from "@moltin/sdk"
import { client } from "@epcc-sdk/sdks-shopper"
import { createBridgedClient } from "@epcc-sdk/compatibility-layer"

// Existing old SDK setup
const legacySdk = gateway({
  client_id: "your-client-id",
  host: "api.moltin.com",
})

// Bridge new SDK to share auth state
const { client: shopperClient, auth } = createBridgedClient(client, {
  baseUrl: "https://api.moltin.com",
  clientId: "your-client-id",
  legacyStorageKey: "epCredentials", // Same key old SDK uses
})

// Both SDKs now share the same token storage
// When old SDK authenticates, new SDK automatically picks up the token
await legacySdk.Products.All()

// New SDK uses the shared token
const { data } = await getByContextAllProducts({ client: shopperClient })
```

### Multiple Clients (Commerce Manager Pattern)

```typescript
import { clientRegistry } from "@epcc-sdk/compatibility-layer"

// Admin client with client_credentials
const admin = clientRegistry.getOrCreate({
  name: "admin",
  authType: "client_credentials",
  baseUrl: "https://api.moltin.com",
  clientId: process.env.ADMIN_CLIENT_ID,
  clientSecret: process.env.ADMIN_CLIENT_SECRET,
  storage: "memory", // Don't persist admin tokens
})

// Shopper client with implicit grant
const shopper = clientRegistry.getOrCreate({
  name: "shopper",
  authType: "implicit",
  baseUrl: "https://api.moltin.com",
  clientId: process.env.STOREFRONT_CLIENT_ID,
  storage: "localStorage",
})

// Password-based client (manual token setting)
const user = clientRegistry.getOrCreate({
  name: "user",
  authType: "password",
  baseUrl: "https://api.moltin.com",
  clientId: process.env.CLIENT_ID,
  storage: "localStorage",
})

// Set token after external authentication
user.auth.setToken({
  access_token: "token-from-login",
  refresh_token: "refresh-token",
  expires: Math.floor(Date.now() / 1000) + 3600,
})
```

## API Reference

### `createBridgedClient(client, config)`

Configures a `@hey-api/client-fetch` client with the compatibility layer.

```typescript
function createBridgedClient<T extends HeyApiClient>(
  client: T,
  config: BridgeConfig
): BridgedClient<T>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `client` | `HeyApiClient` | The SDK client to configure |
| `config` | `BridgeConfig` | Configuration options |

#### BridgeConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | Required | API base URL |
| `clientId` | `string` | Required | OAuth client ID |
| `clientSecret` | `string` | - | Client secret for `client_credentials` |
| `storage` | `StorageAdapter \| 'localStorage' \| 'cookie' \| 'memory'` | `'localStorage'` | Token storage backend |
| `legacyStorageKey` | `string` | `'epCredentials'` | Storage key for sharing with old SDK |
| `tokenProvider` | `TokenProvider` | Auto | Custom token provider function |
| `retry` | `Partial<RetryConfig>` | See below | Retry configuration |
| `throttle` | `Partial<ThrottleConfig>` | See below | Throttle configuration |
| `headers` | `Record<string, string>` | - | Default headers |
| `leewaySec` | `number` | `60` | Token expiration leeway |

#### RetryConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxAttempts` | `number` | `4` | Maximum retry attempts |
| `baseDelay` | `number` | `1000` | Base delay in ms |
| `jitter` | `number` | `500` | Random jitter in ms |
| `reauth` | `boolean` | `true` | Re-authenticate on 401 |

#### ThrottleConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable throttling |
| `limit` | `number` | `3` | Requests per interval |
| `interval` | `number` | `125` | Interval in ms |

#### Returns

```typescript
interface BridgedClient<T> {
  client: T                    // Configured SDK client
  auth: SharedAuthStateInterface  // Auth state for manual management
}
```

### `createBridgedFetch(config)`

Creates a bridged fetch function without configuring a specific client.

```typescript
function createBridgedFetch(config: BridgeConfig): {
  fetch: typeof fetch
  auth: SharedAuthState
}
```

### `ClientRegistry`

Manages multiple client instances for different auth contexts.

```typescript
class ClientRegistry {
  getOrCreate(config: ClientInstanceConfig): ClientInstance
  get(name: string): ClientInstance | undefined
  has(name: string): boolean
  remove(name: string): boolean
  names(): string[]
  clear(): void
}
```

#### ClientInstanceConfig

| Option | Type | Description |
|--------|------|-------------|
| `name` | `string` | Unique client name |
| `authType` | `'implicit' \| 'client_credentials' \| 'password' \| 'sso' \| 'jwt'` | Authentication type |
| `baseUrl` | `string` | API base URL |
| `clientId` | `string` | OAuth client ID |
| `clientSecret` | `string` | Required for `client_credentials` |
| `storage` | `StorageAdapter \| string` | Token storage |
| `legacyStorageKey` | `string` | Storage key for old SDK sharing |

### `SharedAuthState`

Manages authentication state with promise deduplication.

```typescript
class SharedAuthState {
  getValidAccessToken(): Promise<string>  // Get valid token, refresh if needed
  refresh(): Promise<string>              // Force token refresh
  setToken(tokenData: TokenData): void    // Set token manually
  clear(): void                           // Clear credentials
  getSnapshot(): string | undefined       // Get current token
  isExpired(): boolean                    // Check if token is expired
  subscribe(callback: () => void): () => void  // Subscribe to changes
  getCredentials(): TokenData | undefined // Get full credentials
  dispose(): void                         // Cleanup subscriptions
}
```

### `createLegacyStorageBridge(options)`

Creates a storage adapter that bridges to old SDK's storage location.

```typescript
function createLegacyStorageBridge(options?: {
  key?: string           // Custom storage key
  name?: string          // Gateway name (uses ${name}_ep_credentials)
  backend?: 'localStorage' | 'cookie' | 'memory'
  cookie?: CookieOptions
}): StorageAdapter
```

## How Token Sharing Works

```
┌─────────────────┐                    ┌─────────────────┐
│   Old JS SDK    │                    │   New SDK +     │
│                 │                    │   Compat Layer  │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │  authenticate()                      │  getValidAccessToken()
         │  stores token                        │  reads token
         ▼                                      ▼
    ┌─────────────────────────────────────────────────┐
    │          localStorage['epCredentials']           │
    │   { access_token, expires, client_id, ... }     │
    └─────────────────────────────────────────────────┘
                         │
                         │ storage event fires
                         │ when value changes
                         ▼
              New SDK automatically
              reloads credentials
```

1. **Shared Storage Key**: Both SDKs read/write to the same localStorage key (`epCredentials`)
2. **Storage Events**: Browser automatically notifies listeners when localStorage changes
3. **Compatible Format**: Tokens are stored in JSON format compatible with old SDK:
   ```json
   {
     "client_id": "your-client-id",
     "access_token": "...",
     "expires": 1234567890,
     "expires_in": 3600,
     "token_type": "Bearer"
   }
   ```

## Retry Logic

The retry logic matches the old SDK's behavior:

- **Exponential backoff**: `attempt * baseDelay + random(0, jitter)`
- **401 Handling**: Refresh token and retry (when `reauth: true`)
- **429 Handling**: Retry with backoff (rate limiting)
- **Max attempts**: Configurable, default 4

```typescript
// Example: Attempt delays with default config (baseDelay=1000, jitter=500)
// Attempt 1: 1000-1500ms
// Attempt 2: 2000-2500ms
// Attempt 3: 3000-3500ms
// Attempt 4: 4000-4500ms (final attempt)
```

## SSR Support

The compatibility layer supports server-side rendering:

```typescript
// Use memory storage for SSR
const { client, auth } = createBridgedClient(shopperClient, {
  baseUrl: process.env.EPCC_ENDPOINT_URL,
  clientId: process.env.EPCC_CLIENT_ID,
  storage: "memory", // No localStorage on server
})

// For Next.js with cookies
import { createLegacyStorageBridge } from "@epcc-sdk/compatibility-layer"

const storage = createLegacyStorageBridge({
  backend: "cookie",
  cookie: {
    secure: true,
    sameSite: "Lax",
  },
})
```

## Custom Token Providers

For custom authentication flows (SSO, password with refresh, etc.):

```typescript
const { client, auth } = createBridgedClient(shopperClient, {
  baseUrl: "https://api.moltin.com",
  clientId: "your-client-id",
  tokenProvider: async ({ current }) => {
    // Custom logic to get token
    const response = await fetch("/api/auth/token", {
      method: "POST",
      body: JSON.stringify({ currentToken: current }),
    })
    return response.json()
  },
})
```

## Testing

```bash
pnpm test          # Run tests
pnpm test:watch    # Watch mode
pnpm test:coverage # With coverage
```

## License

MIT
