# Elastic Path Authentication Demo

This example demonstrates how to implement authentication with Elastic Path in a Next.js application. It shows:

- User login with email/password
- User registration
- Protected routes
- Displaying user information
- Logout functionality

## Getting Started

1. Clone the repository and navigate to the auth-demo directory

```bash
cd examples/auth-demo
```

2. Install dependencies

```bash
npm install
# or
yarn
# or
pnpm install
```

3. Create a `.env.local` file based on `.env.example` and set your Elastic Path credentials:

```
NEXT_PUBLIC_EPCC_ENDPOINT_URL=api.moltin.com
NEXT_PUBLIC_PASSWORD_PROFILE_ID=your_password_profile_id
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Implementation Details

### Authentication Flow

1. The user enters their credentials on the login page
2. The `login` server action makes a request to Elastic Path's API using the SDK
3. Upon successful authentication, a token is stored in a cookie
4. The user is redirected to the dashboard
5. Protected routes check for the presence of a valid token

### Key Files

- `src/app/auth/actions.ts` - Server actions for login, register, and logout
- `src/app/auth/login/` - Login page and form
- `src/app/auth/register/` - Registration page and form
- `src/app/dashboard/` - Protected dashboard page
- `src/lib/create-elastic-path-client.ts` - SDK client setup
- `src/middleware.ts` - Route protection middleware

## Learn More

- [Elastic Path Composable Frontend](https://github.com/elasticpath/composable-frontend)
- [Elastic Path SDK Documentation](https://documentation.elasticpath.com/composable-frontend/docs/)
