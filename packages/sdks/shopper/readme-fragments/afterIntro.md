## Authentication (Browser)

The SDK includes built-in authentication support for browser environments using Elastic Path's implicit authentication flow. It handles token management, automatic refresh, and storage.

### Quick Start

> **Note**: This authentication mechanism is designed for browser environments where state persistence (localStorage, cookies) is available. The built-in storage adapters and cross-tab synchronization features require browser APIs.

```typescript
import { configureClient } from "@epcc-sdk/sdks-shopper/auth/configure-client";

// Configure the singleton client with authentication
configureClient(
  { 
    baseUrl: "https://useast.api.elasticpath.com" 
  },
  {
    clientId: "your-client-id",
    storage: "localStorage" // or "cookie" or custom adapter
  }
);
```

### Storage Options

- **localStorage** (default): Tokens stored in browser localStorage with cross-tab synchronization
- **cookie**: Tokens stored in JavaScript-readable cookies
- **Custom adapter**: Implement your own storage mechanism

```typescript
// Cookie storage with options
configureClient(config, {
  clientId: "your-client-id",
  storage: "cookie",
  cookie: { 
    sameSite: "Strict",
    secure: true,
    maxAge: 3600 // 1 hour
  }
});
```

### Creating Standalone Clients

For multiple stores or isolated instances:

```typescript
import { createShopperClient } from "@epcc-sdk/sdks-shopper/auth/configure-client";

const { client, auth } = createShopperClient(
  { baseUrl: "https://useast.api.elasticpath.com" },
  { clientId: "your-client-id" }
);
```

### Manual Auth Control

Access the underlying auth instance for manual control:

```typescript
const { client, auth } = configureClient(config, authOptions);

// Check authentication status
if (auth.isAuthenticated()) {
  console.log("Authenticated!");
}

// Manually clear tokens
auth.clearToken();
```

### Features

- **Automatic token refresh**: Refreshes expired tokens automatically
- **Request retry**: Retries failed requests once after refreshing token
- **Cross-tab sync**: localStorage adapter syncs auth state across browser tabs
- **Type-safe**: Full TypeScript support with proper types
- **Flexible storage**: Built-in adapters or bring your own

## React Query Support

This SDK provides optional React Query hooks for React applications. To use them, you need to:

1. Install `@tanstack/react-query` as a peer dependency:
   ```bash
   npm install @tanstack/react-query
   # or
   pnpm install @tanstack/react-query
   # or
   yarn add @tanstack/react-query
   ```

2. Import hooks from the `/react-query` subpath:
   ```ts
   import { useGetByContextProduct } from "@epcc-sdk/sdks-shopper/react-query";
   ```

**Note**: If you're not using React or React Query, you can use the SDK without installing `@tanstack/react-query`. The main exports work independently.