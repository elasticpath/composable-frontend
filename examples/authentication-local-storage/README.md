# Server-Side Cookie Authentication Example

This example demonstrates how to authenticate a storefront to Elastic Path Commerce Cloud using server-side cookies. This approach provides a secure method for connecting your frontend to Elastic Path's public-facing endpoints without exposing credentials in client-side code.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fauthentication-server-cookie&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL&project-name=ep-auth-server-cookie-example)

## Overview

This example shows:

- How to authenticate a storefront to Elastic Path using implicit authentication
- How to securely store authentication tokens in server-side cookies
- How to automatically refresh expired tokens
- How to use the authenticated client to fetch catalog content from the Elastic Path backend
- How SDK interceptors automatically attach tokens from cookies to API requests

## Authentication Flow

This example uses Next.js middleware to implement the authentication flow:

1. When a request is made to the application, the middleware checks for an existing authentication token in the cookies
2. If a token exists and is valid, the request proceeds
3. If no token exists or the token has expired, the middleware:
   - Requests a new access token using the Elastic Path SDK's `createAnAccessToken` method with the implicit grant type
   - Stores the new token in a server-side cookie with an expiration date matching the token's expiry
4. The stored token is then automatically used for subsequent API calls to Elastic Path

## How the SDK is Used

The example uses the `@epcc-sdk/sdks-shopper` package to:

1. **Create authentication tokens**: Using the `createAnAccessToken` function with the implicit grant flow
2. **Configure the client**: Setting the base URL and adding an interceptor to include the authentication token in all requests
3. **Fetch data**: Using the `getByContextAllProducts` function to retrieve product data from the catalog

### SDK Interceptors

A key part of this implementation is the use of SDK interceptors to seamlessly attach the authentication token to outgoing requests:

```typescript
client.interceptors.request.use(async (request, options) => {
  const credentials = JSON.parse(
    (await cookies()).get(CREDENTIALS_COOKIE_KEY)?.value ?? "",
  ) as AccessTokenResponse | undefined

  request.headers.set("Authorization", `Bearer ${credentials?.access_token}`)
  return request
})
```

This interceptor:

- Reads the token from the server-side cookie using Next.js `cookies()` API
- Automatically attaches the token as a Bearer token in the Authorization header
- Handles this for all API requests made through the SDK client

## Cookie Storage

The authentication token is stored securely in a server-side cookie with:

- `sameSite: "strict"` - Prevents the cookie from being sent in cross-site requests
- A dynamic expiration time based on the token's expiry
- A prefix to namespace the cookie (`_store_ep_credentials`)

This approach keeps the token secure by:

1. Never exposing it to client-side JavaScript
2. Only including it in requests to the same site
3. Automatically expiring it when the token is no longer valid

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
