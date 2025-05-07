# Client-Side Local Storage Authentication Example

This example demonstrates how to authenticate a storefront to Elastic Path Commerce Cloud using client-side local storage. This approach provides a simple method for connecting your frontend to Elastic Path's public-facing endpoints without requiring server-side infrastructure for authentication.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fauthentication-local-storage&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL&project-name=ep-auth-local-storage-example)

## Overview

This example shows:

- How to authenticate a storefront to Elastic Path using implicit authentication
- How to store authentication tokens in browser local storage
- How to automatically refresh expired tokens
- How to use the authenticated client to fetch product data from the Elastic Path backend
- How SDK interceptors automatically attach tokens from local storage to API requests

## Authentication Flow

This example uses a React context provider (`StorefrontProvider`) to implement the authentication flow:

1. When the application loads, the StorefrontProvider sets up an interceptor to handle authentication
2. For each API request, the interceptor:
   - Checks for an existing authentication token in local storage
   - If a token exists and is valid, it attaches it to the request
   - If no token exists or the token has expired, it:
     - Requests a new access token using the Elastic Path SDK's `createAnAccessToken` method with the implicit grant type
     - Stores the new token in the browser's local storage
     - Attaches the token to the current request

## How the SDK is Used

The example uses the `@epcc-sdk/sdks-shopper` package to:

1. **Create and configure the client**: Setting the base URL for the Elastic Path API

   ```typescript
   client.setConfig({
     baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL!,
   })
   ```

2. **Create authentication tokens**: Using the `createAnAccessToken` function with the implicit grant flow

   ```typescript
   const authResponse = await createAnAccessToken({
     body: {
       grant_type: "implicit",
       client_id: clientId,
     },
   })
   ```

3. **Fetch data**: Using the `getByContextAllProducts` function to retrieve product data from the catalog
   ```typescript
   const response = await getByContextAllProducts()
   ```

### SDK Interceptors

A key part of this implementation is the use of SDK interceptors to seamlessly handle authentication:

```typescript
client.interceptors.request.use(async (request) => {
  let credentials = JSON.parse(
    localStorage.getItem(CREDENTIALS_COOKIE_KEY) ?? "{}",
  ) as AccessTokenResponse | undefined

  // check if token expired or missing
  if (
    !credentials?.access_token ||
    (credentials.expires && tokenExpired(credentials.expires))
  ) {
    const authResponse = await createAnAccessToken({
      body: {
        grant_type: "implicit",
        client_id: clientId,
      },
    })

    const token = authResponse.data
    localStorage.setItem(CREDENTIALS_COOKIE_KEY, JSON.stringify(token))
    credentials = token
  }

  if (credentials?.access_token) {
    request.headers.set("Authorization", `Bearer ${credentials.access_token}`)
  }
  return request
})
```

This interceptor:

- Reads the token from local storage
- Checks if the token is expired or missing
- Automatically obtains a new token when needed
- Attaches the token as a Bearer token in the Authorization header
- Handles this for all API requests made through the SDK client

## Project Structure

- `src/app/auth/StorefrontProvider.tsx`: React provider that handles authentication logic
- `src/app/client-component.tsx`: Client-side component that fetches and displays products
- `src/app/constants.ts`: Constants including the local storage key for credentials
- `src/app/layout.tsx`: Root layout that wraps the application with the StorefrontProvider

## Local Storage Strategy

The authentication token is stored in the browser's local storage:

- Persists between page reloads and browser sessions
- Easily accessible from anywhere in the client-side application
- Automatically refreshed when expired

This approach is simpler than server-side cookies but has different security considerations:

1. Tokens are accessible to any JavaScript running on the page
2. Tokens persist until explicitly removed or local storage is cleared
3. Ideal for fully client-side applications without server components

## Getting Started

### Prerequisites

- An Elastic Path Commerce Cloud account
- A client ID for your storefront application

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
NEXT_PUBLIC_EPCC_CLIENT_ID=your_client_id
NEXT_PUBLIC_EPCC_ENDPOINT_URL=your_endpoint_url # e.g. https://euwest.api.elasticpath.com
```

### Installation

```bash
npm install
# or
yarn
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

For more information about Elastic Path Commerce Cloud:

- [Elastic Path Documentation](https://documentation.elasticpath.com/)
- [Authentication with Elastic Path](https://documentation.elasticpath.com/commerce-cloud/docs/api/basics/authentication/index.html)
- [Elastic Path Composable Frontend SDK](https://github.com/elasticpath/composable-frontend)
