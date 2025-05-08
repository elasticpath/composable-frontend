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

## Configuration

### Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```
NEXT_PUBLIC_EPCC_ENDPOINT_URL=https://euwest.api.elasticpath.com
NEXT_PUBLIC_EPCC_CLIENT_ID=your_client_id
NEXT_PUBLIC_PASSWORD_PROFILE_ID=your_password_profile_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

You'll need to set up a password profile in your EPCC account to enable authentication and password reset functionality.

For password reset to work properly, you should also set up a webhook in your EPCC account that forwards one-time-password-token events to your application's webhook endpoint:
`{NEXT_PUBLIC_APP_URL}/api/webhooks/one-time-password`

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
