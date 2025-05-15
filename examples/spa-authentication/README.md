# Client-Side Local Storage Authentication Example (React SPA with Vite)

This example demonstrates how to authenticate a storefront to Elastic Path Commerce Cloud using client-side local storage within a Single Page Application (SPA) built with React and Vite. This approach provides a simple method for connecting your frontend to Elastic Path's public-facing endpoints without requiring server-side infrastructure for authentication.

## ⚠️ Security Warning

**This example uses local storage for token storage, which has significant security implications:**

- **XSS Vulnerability**: Tokens stored in local storage are accessible by any JavaScript running on your page, making them vulnerable to Cross-Site Scripting (XSS) attacks. If an attacker can inject JavaScript into your site, they can steal the tokens.
- **No HttpOnly Flag**: Unlike cookies, local storage cannot use the HttpOnly flag that would prevent JavaScript access to the token.
- **Persistent by Default**: Tokens remain in local storage until explicitly removed or the browser storage is cleared, potentially exposing them for longer than necessary.
- **CSRF Protection Needed**: When using local storage for authentication, you need to implement additional protection against Cross-Site Request Forgery (CSRF) attacks.

**For production applications with sensitive data, consider:**

- Using HTTP-only cookies for token storage (potentially with a backend-for-frontend)
- Implementing server-side authentication flows
- Implementing proper CSRF protection

This example demonstrates the technical implementation but should be adapted with appropriate security measures for production use.

## Overview

This Vite-based React SPA example shows:

- How to authenticate a storefront to Elastic Path using implicit authentication.
- How to store authentication tokens in browser local storage.
- How to automatically refresh expired tokens via SDK interceptors.
- How to use the authenticated client to fetch product data from the Elastic Path backend.
- How SDK interceptors automatically attach tokens from local storage to API requests.
- Basic SPA setup using Vite.

## Authentication Flow

This example uses a React context provider (`StorefrontProvider`) to implement the authentication flow:

1.  When the application loads, the `StorefrontProvider` sets up an interceptor to handle authentication.
2.  For each API request made via the SDK:
    - The interceptor checks for an existing authentication token in local storage.
    - If a token exists and is valid, it attaches it to the request.
    - If no token exists or the token has expired, it:
      - Requests a new access token using the Elastic Path SDK's `createAnAccessToken` method with the implicit grant type.
      - Stores the new token in the browser's local storage.
      - Attaches the token to the current request.
    - The interceptor bypasses this logic for requests to the token endpoint itself to prevent infinite loops.

## How the SDK is Used

The example uses the `@epcc-sdk/sdks-shopper` package to:

1.  **Create and configure the client**: Setting the base URL for the Elastic Path API using Vite environment variables.

    ```typescript
    // src/auth/StorefrontProvider.tsx
    client.setConfig({
      baseUrl: import.meta.env.VITE_APP_EPCC_ENDPOINT_URL!,
    })
    ```

2.  **Create authentication tokens**: Using the `createAnAccessToken` function with the implicit grant flow.

    ```typescript
    // src/auth/StorefrontProvider.tsx
    const authResponse = await createAnAccessToken({
      body: {
        grant_type: "implicit",
        client_id: import.meta.env.VITE_APP_EPCC_CLIENT_ID, // Vite environment variable
      },
    })
    ```

3.  **Fetch data**: Using the `getByContextAllProducts` function to retrieve product data from the catalog.
    ```typescript
    // src/App.tsx
    const response = await getByContextAllProducts()
    ```

### SDK Interceptors

A key part of this implementation is the use of SDK interceptors to seamlessly handle authentication:

```typescript
// src/auth/StorefrontProvider.tsx
const interceptor = async (
  request: EpccRequesterRequest,
): Promise<EpccRequesterRequest> => {
  // Bypass interceptor logic for token requests to prevent infinite loop
  if (request.url?.includes("/oauth/access_token")) {
    return request
  }

  let credentials = JSON.parse(
    localStorage.getItem(CREDENTIALS_COOKIE_KEY) ?? "{}",
  ) as AccessTokenResponse | undefined

  // check if token expired or missing
  if (
    !credentials?.access_token ||
    (credentials.expires && tokenExpired(credentials.expires))
  ) {
    const clientId = import.meta.env.VITE_APP_EPCC_CLIENT_ID
    // ... (token fetching logic) ...
    localStorage.setItem(CREDENTIALS_COOKIE_KEY, JSON.stringify(token))
    credentials = token
  }

  if (credentials?.access_token) {
    request.headers.set("Authorization", `Bearer ${credentials.access_token}`)
  }
  return request
}

client.interceptors.request.use(interceptor)
```

This interceptor:

- Reads the token from local storage.
- Checks if the token is expired or missing.
- Automatically obtains a new token when needed (using Vite environment variables for client ID).
- Attaches the token as a Bearer token in the Authorization header.
- Handles this for all API requests made through the SDK client, except for token requests.

## Project Structure

- `public/`: Contains static assets for the SPA (e.g., favicon, images).
- `src/`: Contains the React application source code.
  - `src/auth/StorefrontProvider.tsx`: React provider that handles authentication logic.
  - `src/App.tsx`: Main application component that fetches and displays products.
  - `src/constants.ts`: Constants including the local storage key for credentials and EPCC endpoint URL (using Vite env vars).
  - `src/main.tsx`: Entry point of the React application, wraps `App` with `StorefrontProvider`.
- `index.html`: The main HTML file for the Vite application.
- `vite.config.ts`: Vite configuration file.
- `.env.example`: Example environment variables file.
- `package.json`: Project dependencies and scripts.

## Local Storage Strategy

The authentication token is stored in the browser's local storage:

- Persists between page reloads and browser sessions.
- Easily accessible from anywhere in the client-side application.
- Automatically refreshed when expired by the SDK interceptor.

This approach is simpler than server-side cookies for client-heavy applications but has different security considerations as highlighted in the warning section.

## Getting Started

### Prerequisites

- An Elastic Path Commerce Cloud account.
- A client ID for your storefront application.
- Node.js and a package manager (npm, yarn, or pnpm).

### Environment Variables

1.  Copy the `.env.example` file to a new file named `.env` in the root of the `examples/spa-authentication` directory (assuming you rename the parent folder):
    ```bash
    # Assuming you are in the 'examples/spa-authentication' directory
    cp .env.example .env
    ```
2.  Update the `.env` file with your specific Elastic Path Commerce Cloud credentials:

    ```bash
    VITE_APP_EPCC_ENDPOINT_URL=your_endpoint_url # e.g. https://useast.api.elasticpath.com
    VITE_APP_EPCC_CLIENT_ID=your_client_id
    ```

    Ensure `VITE_APP_EPCC_ENDPOINT_URL` points to the correct API host for your EPCC instance.

### Installation

Navigate to the example directory (once renamed) and install dependencies:

```bash
cd examples/spa-authentication
pnpm install
# or
# npm install
# or
# yarn install
```

### Development

To run the development server:

```bash
pnpm dev
# or
# npm run dev
# or
# yarn dev
```

Open the URL provided by Vite (usually [http://localhost:5173](http://localhost:5173)) in your browser to see the result.

### Building for Production

To build the SPA for production:

```bash
pnpm build
# or
# npm run build
# or
# yarn build
```

This will create a `dist` folder with the production-ready assets. You can then serve the `dist` folder using a static file server.

## Learn More

For more information about Elastic Path Commerce Cloud:

- [Elastic Path Documentation](https://documentation.elasticpath.com/)
- [Authentication with Elastic Path](https://documentation.elasticpath.com/commerce-cloud/docs/api/basics/authentication/index.html)
- [Elastic Path Composable Frontend SDK](https://github.com/elasticpath/composable-frontend)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
