# Shopper Accounts Authentication Example

This example demonstrates how to implement authentication for shopper accounts in an Elastic Path Commerce Cloud (EPCC) application. It provides a simple implementation of login, registration, account management, and password reset.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fshopper-accounts-authentication&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL,NEXT_PUBLIC_PASSWORD_PROFILE_ID,NEXT_PUBLIC_APP_URL&project-name=ep-shopper-accounts-authentication)

## Features

- User registration and login
- Password reset functionality
- Authentication with EPCC's account members API
- Protected account pages
- Session management with cookies
- Form validation
- Centralized API client configuration for server-side calls
- Webhook handler for password reset notifications

## Store Setup Requirements

### Required

- **A store API key that can issue an implicit token.** The middleware asks for an implicit token and keeps it in the `_store_ep_credentials` cookie, and the server-side calls send it as the bearer token (`src/middleware.ts`, `src/lib/api-client.ts`). Create it in Commerce Manager, Application Keys, and set `NEXT_PUBLIC_EPCC_CLIENT_ID` to its client id. It needs no secret. A missing client id, or a token the store refuses, fails the request with a 500.
- **A password profile on the store's account authentication realm.** Sign-in, registration and password reset all use `NEXT_PUBLIC_PASSWORD_PROFILE_ID` (`src/app/actions.ts`, `src/lib/password-reset.ts`). Create it in Commerce Manager and copy its id. The example does not check the id, so a missing or wrong one shows up as "Failed to login, make sure your email and password are correct" or "Failed to register".
- **An account for each member.** Sign-in and registration read the first account entry the token request returns (`src/app/actions.ts`), and fail with the same generic message when there is none. For a member created by registration, the store has to create that account, which is the `auto_create_account_for_account_members` setting in the account authentication settings. This comes from the setting's description in the SDK types, and has not been run against a live store.

### Optional

- **Self sign-up enabled in the account authentication settings.** Registration uses the `self_signup` mechanism (`src/app/actions.ts`), which the SDK types describe as the `enable_self_signup` setting. This is not run against a live store. Without it `/register` fails with "Failed to register". Sign-in of members you created yourself is unaffected.
- **A published catalog.** Only the home page reads it, with `getByContextAllProducts` (`src/app/page.tsx`). The SDK returns an `{ error }` and the page does not read it, so an unpublished catalog and a failed call both show "Not authenticated" and "No products found.". Sign-in, registration and the account pages work either way.
- **Password reset: a webhook on `one-time-password-token-request.created`.** The forgot-password form reads the account authentication settings for the realm, then requests a one-time password token (`src/lib/password-reset.ts`). Create a webhook in your store for the `one-time-password-token-request.created` event that posts to `{NEXT_PUBLIC_APP_URL}/api/webhooks/one-time-password`. The handler (`src/app/api/webhooks/one-time-password/route.ts`) does not send an email: it writes the reset link to the server console, and you open that link to reach the reset page. The URL must be reachable from Elastic Path, so on `localhost` it needs a tunnel. Without the webhook no link is produced. The forgot-password page says "Password reset email sent!" in every case, including when the store settings or the profile are wrong, so a misconfiguration shows only in the server console.

## Configuration

### Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```
NEXT_PUBLIC_EPCC_ENDPOINT_URL=https://euwest.api.elasticpath.com
NEXT_PUBLIC_EPCC_CLIENT_ID=your_client_id
NEXT_PUBLIC_PASSWORD_PROFILE_ID=your_password_profile_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- `NEXT_PUBLIC_EPCC_ENDPOINT_URL`: the store's API base URL. The SDK joins it to each path, so it must include `https://`. This differs from `examples/core`, which expects a bare host name.
- `NEXT_PUBLIC_EPCC_CLIENT_ID`: the client id of an implicit store API key. It has no secret.
- `NEXT_PUBLIC_PASSWORD_PROFILE_ID`: the id of the password profile used for sign-in, registration and password reset. If it is empty, those calls fail.
- `NEXT_PUBLIC_APP_URL`: the origin of this app, with the scheme and no trailing slash. The password reset webhook handler uses it to build the reset link it logs (`src/app/api/webhooks/one-time-password/route.ts`). It defaults to `http://localhost:3000`.

Next.js inlines `NEXT_PUBLIC_` values when it builds. After you change one, rebuild before `next start`.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm

### Installation

```bash
pnpm install
# or
npm install
```

### Development

```bash
pnpm dev
# or
npm run dev
```

### Building for Production

```bash
pnpm build
# or
npm run build
```

## How it Works

### Authentication Flow

1. **Registration**: New users can register with their email, password, and name
2. **Login**: Existing users can log in with their email and password
3. **Password Reset**: Users can request a password reset link and set a new password
4. **Token Storage**: Authentication tokens are stored in cookies
5. **Protected Routes**: Account pages are protected and redirect to login if not authenticated

### Client Configuration

The example uses a centralized `configureClient` function for all server-side API calls, which:

1. Configures the client with the appropriate base URL
2. Adds an interceptor to automatically include authentication tokens from cookies
3. Makes the client available for server actions and components

This approach ensures that all server-side API calls are properly authenticated and follow the same configuration pattern.

### Project Structure

- `/src/app/(auth)` - Authentication-related pages (login/register/password-reset)
- `/src/app/account` - Account management pages
- `/src/app/api/webhooks` - Webhook endpoints for notifications
- `/src/lib/auth.ts` - Helper functions for authentication
- `/src/lib/api-client.ts` - Client configuration for server-side API calls
- `/src/lib/password-reset.ts` - Functions for password reset
- `/src/components/ui.tsx` - Reusable UI components

## Security Considerations

- Tokens are stored in HttpOnly cookies to prevent XSS attacks
- Form validation is performed on both client and server
- Passwords are never stored in the application
- API client is only configured on the server side, not exposed to the client

## Learn More

To learn more about EPCC account authentication, visit the [Elastic Path documentation](https://documentation.elasticpath.com/commerce-cloud/docs/developer/authentication/index.html).
