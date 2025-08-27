# Client-Side Local Storage Authentication Example

This example demonstrates how to authenticate a storefront to Elastic Path Commerce Cloud using client-side local storage. This approach provides a simple method for connecting your frontend to Elastic Path's public-facing endpoints without requiring server-side infrastructure for authentication.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fauthentication-local-storage&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL&project-name=ep-auth-local-storage-example)

## ⚠️ Security Warning

**This example uses local storage for token storage, which has significant security implications:**

- **XSS Vulnerability**: Tokens stored in local storage are accessible by any JavaScript running on your page, making them vulnerable to Cross-Site Scripting (XSS) attacks. If an attacker can inject JavaScript into your site, they can steal the tokens.
- **No HttpOnly Flag**: Unlike cookies, local storage cannot use the HttpOnly flag that would prevent JavaScript access to the token.
- **Persistent by Default**: Tokens remain in local storage until explicitly removed or the browser storage is cleared, potentially exposing them for longer than necessary.
- **CSRF Protection Needed**: When using local storage for authentication, you need to implement additional protection against Cross-Site Request Forgery (CSRF) attacks.

**For production applications with sensitive data, consider:**

- Using HTTP-only cookies for token storage
- Implementing server-side authentication flows
- Implementing proper CSRF protection

This example demonstrates the technical implementation but should be adapted with appropriate security measures for production use.

## Overview

This example shows:

- How to configure the SDK with built-in authentication using `configureClient`
- How authentication tokens are automatically managed and stored in browser local storage
- How expired tokens are transparently refreshed by the SDK
- How to use the authenticated client to fetch product data from the Elastic Path backend
- How the SDK's built-in auth mechanism handles all token management automatically

## Authentication Flow

This example uses a React context provider (`StorefrontProvider`) to configure the SDK with built-in authentication:

1. When the application loads, the StorefrontProvider calls `configureClient` to set up the SDK with authentication
2. The SDK handles all authentication automatically:
   - On the first API request, it obtains an access token using the implicit grant flow
   - Stores the token in localStorage (as configured)
   - Automatically attaches the token to all subsequent API requests
   - Refreshes expired tokens transparently before making requests
   - Retries failed requests once after refreshing the token on 401 errors

## How the SDK is Used

The example uses the `@epcc-sdk/sdks-shopper` package with the new built-in authentication mechanism:

1. **Configure the client with authentication**: Using `configureClient` to set up both the API endpoint and authentication

   ```typescript
   configureClient(
     {
       baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL!,
     },
     {
       clientId: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID!,
       storage: "localStorage", // Use localStorage to persist tokens
     }
   )
   ```

2. **Fetch data**: Using the SDK functions to retrieve data - authentication is handled automatically

   ```typescript
   const response = await getByContextAllProducts()
   ```

### Built-in Authentication

The SDK now provides built-in authentication that handles:

- **Automatic token acquisition**: Fetches an access token on the first API request
- **Token persistence**: Stores tokens in localStorage (or cookies if configured)
- **Automatic token refresh**: Refreshes expired tokens transparently
- **Request authorization**: Automatically adds Bearer tokens to all API requests
- **401 retry logic**: Refreshes token and retries once on authentication failures

This eliminates the need for manual interceptor configuration. The authentication flow is:

1. When `configureClient` is called, it sets up the authentication layer
2. On the first API request, if no valid token exists, it automatically obtains one using the implicit grant flow
3. The token is stored in localStorage (as configured)
4. All subsequent requests automatically include the token
5. When a token expires, it's automatically refreshed before the next request
6. If a request returns 401, the SDK refreshes the token and retries once

## Project Structure

- `src/app/auth/StorefrontProvider.tsx`: React provider that configures the SDK with authentication
- `src/app/client-component.tsx`: Client-side component that fetches and displays products using the authenticated SDK
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
